import {
  Box3,
  Color,
  Material,
  Mesh,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  Object3D,
  SRGBColorSpace,
  Texture,
  Vector3,
} from "three";
import { OBB } from "three/examples/jsm/math/OBB.js";
import { forEachAsync } from "../util/Collection";
import { calculateBoundingBoxAll } from "../util/GeometryUtil";
import { LoaderManager } from "./Loader";
import { Sugar3DLoader } from "./Sugar3DLoader";
import { SugarTextureLoader } from "./SugarTextureLoader";

export const listMaterialByName = (object: Object3D, name: string) => {
  const r: Material[] = [];
  object.traverse((cobj) => {
    if (
      cobj instanceof Mesh &&
      cobj.material.name === name &&
      !r.includes(cobj.material as Material)
    ) {
      r.push(cobj.material);
    }
  });

  return r;
};

interface SugarAsset {
  get data(): any;
  get id(): string;
  get name(): string;
  get code(): string;
  get thumbnailFileUrl(): string;
  get loaded(): boolean;
}

const modelCache: Map<string, SugarModel> = new Map<string, SugarModel>();

const partCache: Map<string, SugarPart> = new Map<string, SugarPart>();

const materialCache: Map<string, SugarMaterial> = new Map<
  string,
  SugarMaterial
>();

const createPart = (partData: any) => {
  let part = partCache.get(partData.id);
  if (!part) {
    part = new SugarPart(partData);
    partCache.set(partData.id, part);
  }
  return part;
};

const createMaterial = (materialData: any) => {
  let material = materialCache.get(materialData.id);
  if (!material) {
    material = new SugarMaterial(materialData);
    materialCache.set(materialData.id, material);
  }
  return material;
};

export const clearCache = () => {
  partCache.clear();
  materialCache.clear();
};

/**
 *
 *
 *
 *
 *
 */
export class SugarModel implements SugarAsset {
  parts?: SugarPart[];
  partMaterialGroups?: SugarPartGroup[];
  materials?: SugarMaterial[];

  private _model: Object3D;
  private _data: any;
  private _bound: any;
  private _bounds: Mesh[] = [];
  private _loaded = false;

  constructor(data: any) {
    this._data = data;
    this._model = new Object3D();
  }

  get data(): any {
    return this._data;
  }
  get id(): string {
    return this._data.id;
  }
  get name(): string {
    return this._data.name;
  }
  get code(): string {
    return this._data.id;
  }

  get thumbnailFileUrl(): string {
    return this._data.thumbnailFileUrl;
  }

  get model(): Object3D {
    return this._model;
  }

  get bound() {
    return this._bound;
  }
  get bounds() {
    return this._bounds;
  }

  private _localObb = new OBB();
  private _worldObb = new OBB();

  get localObb() {
    return this._localObb.clone();
  }

  get obb() {
    this._worldObb.copy(this._localObb);
    this._worldObb.applyMatrix4(this._model.matrixWorld);
    return this._worldObb;
  }

  set model(value: Object3D) {
    if (this._model) (this._model as any).model = undefined;
    this._model = value;
    (this._model as any).model = this;
    this._bounds = calculateBoundingBoxAll(this._model);

    const box = new Box3();
    box.setFromObject(this._model, true);
    this._model.userData.bound = box;
    this._bound = box;

    const size = new Vector3();
    this._bound.getSize(size);
    const obb = new OBB();
    obb.halfSize.copy(size.multiplyScalar(0.5));
    this._localObb = obb;
  }

  get loaded() {
    return this._loaded;
  }

  set loaded(value: boolean) {
    this._loaded = value;
  }

  async _loadModel(
    sugarModel: SugarModel,
    loadPromises: Promise<any[]>,
    onAfterLoad?: (sugarModel: SugarModel, results: any[]) => void
  ) {
    const results = await loadPromises;

    if (onAfterLoad) onAfterLoad(sugarModel, results);
    //after load

    sugarModel.model = results[0];
    sugarModel.loaded = true;
    return sugarModel;
  }

  async load(
    data: any,
    options?: {
      forceSync?: boolean;
      onBeforeLoad?: (product: SugarModel) => void;
      onAfterLoad?: (sugarModel: SugarModel, results: any[]) => void;
      onProgress?: (progress: ProgressEvent) => void;
    }
  ): Promise<SugarModel | undefined> {
    /*if (modelCache.get(data.id)) {
      return modelCache.get(data.id);
    }*/

    let materials: SugarMaterial[] = [];
    if (data.parts) {
      materials = data.materials.map((material: any) => {
        return createMaterial(material);
      });
    }
    //
    let parts: SugarPart[] = [];
    if (data.parts) {
      parts = data.parts.map((part: any) => {
        return createPart(part);
      });
    }

    let partMaterialGroups;
    if (data.partMaterialGroups) {
      partMaterialGroups = data.partMaterialGroups.map(
        (partMaterialGroup: any) => {
          return new SugarPartGroup(partMaterialGroup, materials, parts);
        }
      );
    }

    //const sugarModel = new SugarModel(data);
    const sugarModel = this;
    sugarModel._data = data;
    sugarModel.materials = materials;
    sugarModel.parts = parts;
    sugarModel.partMaterialGroups = partMaterialGroups;
    //modelCache.set(data.id, sugarModel);
    //load begins

    const asyncFunctions = [];

    const loader = new LoaderManager(new Sugar3DLoader());
    asyncFunctions.push(
      loader.load(data.gltf, { onProgress: options?.onProgress })
    );

    if (parts) {
      const partLoaders = forEachAsync(parts, async (part: any) => {
        await part.load();
      });
      asyncFunctions.push(partLoaders);
    }

    //
    if (partMaterialGroups) {
      const partLoaders = forEachAsync(
        partMaterialGroups,
        async (partMaterialGroupLoader: any) => {
          await partMaterialGroupLoader.load();
        }
      );
      asyncFunctions.push(partLoaders);
    }

    if (options?.onBeforeLoad) options?.onBeforeLoad(sugarModel);

    if (options?.forceSync) {
      await this._loadModel(
        sugarModel,
        Promise.all(asyncFunctions),
        options?.onAfterLoad
      );
      return sugarModel;
    } else {
      this._loadModel(
        sugarModel,
        Promise.all(asyncFunctions),
        options?.onAfterLoad
      );
      return sugarModel;
    }
  }

  static applyMaterials(sugarModel: SugarModel, results: any[]) {
    if (sugarModel.model) {
      const parent = sugarModel.model.parent;
      parent?.remove(sugarModel.model);
      parent?.add(results[0]);

      results[0].rotation.copy(sugarModel.model.rotation);
      results[0].position.copy(sugarModel.model.position);
    }

    const scene = (sugarModel as any).scene;
    scene?.removeModel(sugarModel);

    sugarModel.model = results[0];

    scene?.addModel(sugarModel);

    sugarModel.parts?.forEach((part) => {
      part.apply(sugarModel.model);
    });

    sugarModel.partMaterialGroups?.forEach((part) => {
      part.apply(sugarModel.model);
    });
  }
}

/**
 *
 *
 *
 *
 *
 */
export class SugarPart implements SugarAsset {
  private _data: any;
  private _isLoaded = false;

  materials: SugarMaterial[] = [];
  baseAoMap: Texture | undefined = undefined;
  baseNormalMap: Texture | undefined = undefined;

  constructor(part: any) {
    this._data = part;
    this.materials = this._data.materials.map((id: any) => {
      return materialCache.get(id);
    });
  }

  get data(): any {
    return this._data;
  }

  get id(): string {
    return this._data.id;
  }

  get name(): string {
    return this._data.name;
  }

  get code(): string {
    return this._data.code;
  }

  get thumbnailFileUrl(): string {
    return this._data.thumbnailFileUrl;
  }

  get size() {
    return this._data.size;
  }

  get loaded() {
    return this._isLoaded;
  }

  async load() {
    if (this._isLoaded) return;

    const loader = new LoaderManager(new SugarTextureLoader());

    const partsLooaded = await Promise.all([
      loader.load(this._data.baseNormalMap),
      loader.load(this._data.baseAoMap),
    ]);

    this.baseNormalMap = partsLooaded[0];
    if (this.baseNormalMap) this.baseNormalMap.needsUpdate = true;

    this.baseAoMap = partsLooaded[1];
    if (this.baseAoMap) this.baseAoMap.needsUpdate = true;

    this._isLoaded = true;
  }

  async apply(object: Object3D) {
    const materials = listMaterialByName(object, this._data.name);
    materials.forEach((material) => {
      const mMap = material as MeshStandardMaterial | MeshPhysicalMaterial;
      if (this.baseAoMap) {
        mMap.aoMap = this.baseAoMap;
        this.baseAoMap.flipY = false;
      }

      if (this.baseNormalMap) {
        mMap.userData.baseNormalMap = this.baseNormalMap;
        this.baseNormalMap.flipY = false;
      }

      mMap.needsUpdate = true;
    });
  }
}

/**
 *
 *
 *
 *
 *
 */
export class SugarMaterial implements SugarAsset {
  private _data: any;
  private _isLoaded = false;

  constructor(data: any) {
    this._data = data;
  }

  get data(): any {
    return this._data;
  }
  get id(): string {
    return this._data.id;
  }

  get name(): string {
    return this._data.name;
  }

  get code(): string {
    return this._data.groupBy_;
  }

  get thumbnailFileUrl(): string {
    return this._data.thumbnailFile;
  }

  get loaded() {
    return this._isLoaded;
  }

  private _map: Texture | undefined;
  private _normalMap: Texture | undefined;
  private _aoMap: Texture | undefined;
  private _roughnessMap: Texture | undefined;
  private _emissiveMap: Texture | undefined;

  async load() {
    if (this._isLoaded) return;

    const loader = new LoaderManager(new SugarTextureLoader());
    const diffuse = this._data.diffuse;
    const mapUris = diffuse.split(";");

    const mapLoaded = await Promise.all([
      loader.load(mapUris[0]),
      loader.load(mapUris[1]),
      loader.load(mapUris[2]),
      loader.load(mapUris[3]),
      loader.load(mapUris[4]),
    ]);

    mapLoaded.forEach((m) => {
      if (m) {
        m.flipY = false;
        m.needsUpdate = true;
      }
    });
    this._map = mapLoaded[0];
    this._roughnessMap = mapLoaded[1];
    this._normalMap = mapLoaded[2];
    this._aoMap = mapLoaded[3];
    this._emissiveMap = mapLoaded[4];

    this._isLoaded = true;
  }

  async apply(material: Material, options: { size: 1 }) {
    const mMap = material as MeshStandardMaterial | MeshPhysicalMaterial;

    const color = this._data.color;
    mMap.color = color != null ? new Color("#" + color) : new Color(0xffffff);

    const transparent = this._data.transparent;
    mMap.transparent = transparent && transparent > 0;

    const opacity = this._data.opacity;
    mMap.opacity = opacity != null ? opacity : mMap.opacity;

    const depthTest = mMap.depthTest;
    mMap.depthTest = depthTest != null ? depthTest : mMap.depthTest;

    const depthWrite = mMap.depthWrite;
    mMap.depthWrite = depthWrite != null ? depthWrite : mMap.depthWrite;

    let size = this._data.size ? this._data.size : 1;
    size *= options.size ? options.size : 1;

    if (this._map) {
      mMap.map = this._map;
      mMap.map.repeat.x = size;
      mMap.map.repeat.y = size;
      mMap.map.colorSpace = SRGBColorSpace;
    }

    mMap.normalMap = null;
    if (this._normalMap) {
      mMap.normalMap = this._normalMap;
      mMap.normalMap.repeat.x = size;
      mMap.normalMap.repeat.y = size;
    }

    /*mMap.aoMap = null;
      if (this._aoMap) {
        mMap.aoMap = this._aoMap;
      }*/

    mMap.roughnessMap = null;
    mMap.metalnessMap = null;
    mMap.metalness = this._data.metallicFactor;
    mMap.roughness = this._data.roughnessFactor;
    if (this._roughnessMap) {
      mMap.roughnessMap = this._roughnessMap;
      mMap.metalnessMap = this._roughnessMap;
      mMap.roughnessMap.repeat.x = size;
      mMap.roughnessMap.repeat.y = size;
      mMap.metalnessMap.repeat.x = size;
      mMap.metalnessMap.repeat.y = size;
    }

    mMap.emissiveMap = null;
    if (this._emissiveMap) {
      mMap.emissiveMap = this._emissiveMap;
      mMap.emissiveMap.repeat.x = size;
      mMap.emissiveMap.repeat.y = size;
    }

    mMap.needsUpdate = true;
  }
}

/**
 *
 *
 *
 *
 */
export class SugarPartGroup implements SugarAsset {
  private _data: any;

  private _materials: SugarMaterial[] = [];
  private _parts: SugarPart[] = [];
  private _material?: SugarMaterial;
  private _model?: Object3D;
  private _isLoaded = false;

  get data(): any {
    return this._data;
  }
  get id(): string {
    return this._data.id;
  }
  get name(): string {
    return this._data.title;
  }
  get code(): string {
    return this._data.code;
  }
  get material(): SugarMaterial | undefined {
    return this._material;
  }
  set material(value: SugarMaterial) {
    this._material = value;
    this.apply(this._model!);
  }

  get thumbnailFileUrl(): string {
    return this._data.thumbnailFileUrl;
  }

  get loaded() {
    return this._isLoaded;
  }

  constructor(
    partMaterialGroup: any,
    materials: SugarMaterial[],
    parts: SugarPart[]
  ) {
    this._data = partMaterialGroup;

    const code = this._data.code;
    const defaultMaterialCode = this._data.defaultMaterialCode;

    //find default material
    let filteredMaterials = materials.filter((material) => {
      return (
        material?.code?.toUpperCase().trim() === code?.toUpperCase().trim() ||
        material?.id == defaultMaterialCode
      );
    });
    if (filteredMaterials && filteredMaterials.length > 0)
      this._material = filteredMaterials[0];

    //find by code parts
    this._parts = parts.filter((part) => {
      return part.code === code;
    });

    //find possible materials
    this._materials = [];
    this._parts.forEach((part) => {
      this._materials = [...part.materials, ...this._materials];
    });

    this._materials = this._materials
      .filter((m) => m)
      .reduce((acc: SugarMaterial[], current) => {
        const x = acc.findIndex((item) => item.id === current.id);
        if (x <= -1) {
          acc.push(current);
        }
        return acc;
      }, []);

    /*.map((part) => {
        return createPart(part);
      });*/

    //merge with group parts part
    /*if (this._partMaterialGroup.part)
      this._parts = [...this._parts, ...this._partMaterialGroup.part];*/
  }

  async load() {
    await this._material?.load();
    this._isLoaded = true;
  }

  async apply(object: Object3D) {
    this._model = object;
    await this._material?.load();
    this._parts.forEach((part) => {
      let materialInstances = listMaterialByName(object, part.name);
      materialInstances.forEach((materialInstance) => {
        //can a part have multiple materials
        this._material?.apply(materialInstance, { size: part.size });
      });
    });
  }
}
