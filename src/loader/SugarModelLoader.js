import {
	Box3,
	Color,
	Object3D,
	SRGBColorSpace,
	Vector3
} from "three";
import { OBB } from "three/examples/jsm/math/OBB.js";
import { forEachAsync } from "../util/Collection";
import { calculateBoundingBoxAll } from "../util/GeometryUtil";
import { listMaterialByName } from "../util/SceneUtil";
import { LoaderManager } from "./Loader";
import { Sugar3DLoader } from "./Sugar3DLoader";
import { SugarTextureLoader } from "./SugarTextureLoader";

const modelCache = new Map();

const partCache = new Map();

const materialCache = new Map();

const createPart = (partData) => {
  let part = partCache.get(partData.id);
  if (!part) {
    part = new SugarPart(partData);
    partCache.set(partData.id, part);
  }
  return part;
};

const createMaterial = (materialData) => {
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

export class SugarModel {
  parts;
  partMaterialGroups;
  materials;

  _model;
  _data;
  _bound;
  _bounds = [];
  _loaded = false;

  constructor(data) {
    this._data = data;
    this._model = new Object3D();
  }

  get data() {
    return this._data;
  }
  get id() {
    return this._data.id;
  }
  get name() {
    return this._data.name;
  }
  get code() {
    return this._data.id;
  }

  get thumbnailFileUrl() {
    return this._data.thumbnailFileUrl;
  }

  get model() {
    return this._model;
  }

  get bound() {
    return this._bound;
  }
  get bounds() {
    return this._bounds;
  }

  _localObb = new OBB();
  _worldObb = new OBB();

  get localObb() {
    return this._localObb.clone();
  }

  get obb() {
    this._worldObb.copy(this._localObb);
    this._worldObb.applyMatrix4(this._model.matrixWorld);
    return this._worldObb;
  }

  set model(value) {
    if (this._model) this._model.model = undefined;
    this._model = value;
    this._model.model = this;
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

  set loaded(value) {
    this._loaded = value;
  }

  async _loadModel(sugarModel, loadPromises, onAfterLoad) {
    const results = await loadPromises;

    if (onAfterLoad) onAfterLoad(sugarModel, results);

    sugarModel.model = results[0];
    sugarModel.loaded = true;
    return sugarModel;
  }

  async load(data, options) {
    let materials = [];
    if (data.parts) {
      materials = data.materials.map((material) => {
        return createMaterial(material);
      });
    }

    let parts = [];
    if (data.parts) {
      parts = data.parts.map((part) => {
        return createPart(part);
      });
    }

    let partMaterialGroups;
    if (data.partMaterialGroups) {
      partMaterialGroups = data.partMaterialGroups.map((partMaterialGroup) => {
        return new SugarPartGroup(partMaterialGroup, materials, parts);
      });
    }

    const sugarModel = this;
    sugarModel._data = data;
    sugarModel.materials = materials;
    sugarModel.parts = parts;
    sugarModel.partMaterialGroups = partMaterialGroups;

    const asyncFunctions = [];

    const loader = new LoaderManager(new Sugar3DLoader());
    asyncFunctions.push(loader.load(data.gltf, { onProgress: options?.onProgress }));

    if (parts) {
      const partLoaders = forEachAsync(parts, async (part) => {
        await part.load();
      });
      asyncFunctions.push(partLoaders);
    }

    if (partMaterialGroups) {
      const partLoaders = forEachAsync(partMaterialGroups, async (partMaterialGroupLoader) => {
        await partMaterialGroupLoader.load();
      });
      asyncFunctions.push(partLoaders);
    }

    if (options?.onBeforeLoad) options?.onBeforeLoad(sugarModel);

    if (options?.forceSync) {
      await this._loadModel(sugarModel, Promise.all(asyncFunctions), options?.onAfterLoad);
      return sugarModel;
    } else {
      this._loadModel(sugarModel, Promise.all(asyncFunctions), options?.onAfterLoad);
      return sugarModel;
    }
  }

  static applyMaterials(sugarModel, results) {
    if (sugarModel.model) {
      const parent = sugarModel.model.parent;
      parent?.remove(sugarModel.model);
      parent?.add(results[0]);

      results[0].rotation.copy(sugarModel.model.rotation);
      results[0].position.copy(sugarModel.model.position);
    }

    const scene = sugarModel.scene;
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

export class SugarPart {
  _data;
  _isLoaded = false;

  materials = [];
  baseAoMap;
  baseNormalMap;

  constructor(part) {
    this._data = part;
    this.materials = this._data.materials.map((id) => {
      return materialCache.get(id);
    });
  }

  get data() {
    return this._data;
  }

  get id() {
    return this._data.id;
  }

  get name() {
    return this._data.name;
  }

  get code() {
    return this._data.code;
  }

  get thumbnailFileUrl() {
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

  async apply(object) {
    const materials = listMaterialByName(object, this._data.name);
    materials.forEach((material) => {
      const mMap = material;
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

export class SugarMaterial {
  _data;
  _isLoaded = false;

  constructor(data) {
    this._data = data;
  }

  get data() {
    return this._data;
  }
  get id() {
    return this._data.id;
  }

  get name() {
    return this._data.name;
  }

  get code() {
    return this._data.groupBy_;
  }

  get thumbnailFileUrl() {
    return this._data.thumbnailFile;
  }

  get loaded() {
    return this._isLoaded;
  }

  _map;
  _normalMap;
  _aoMap;
  _roughnessMap;
  _emissiveMap;

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

  async apply(material, options) {
    const mMap = material;

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

export class SugarPartGroup {
  _data;

  _materials = [];
  _parts = [];
  _material;
  _model;
  _isLoaded = false;

  get data() {
    return this._data;
  }
  get id() {
    return this._data.id;
  }
  get name() {
    return this._data.title;
  }
  get code() {
    return this._data.code;
  }
  get material() {
    return this._material;
  }
  set material(value) {
    this._material = value;
    this.apply(this._model);
  }

  get thumbnailFileUrl() {
    return this._data.thumbnailFileUrl;
  }

  get loaded() {
    return this._isLoaded;
  }

  constructor(partMaterialGroup, materials, parts) {
    this._data = partMaterialGroup;

    const code = this._data.code;
    const defaultMaterialCode = this._data.defaultMaterialCode;

    let filteredMaterials = materials.filter((material) => {
      return (
        material.code.toUpperCase().trim() === code.toUpperCase().trim() ||
        material.id == defaultMaterialCode
      );
    });
    if (filteredMaterials && filteredMaterials.length > 0) this._material = filteredMaterials[0];

    this._parts = parts.filter((part) => {
      return part.code === code;
    });

    this._materials = [];
    this._parts.forEach((part) => {
      this._materials = [...part.materials, ...this._materials];
    });

    this._materials = this._materials
      .filter((m) => m)
      .reduce((acc, current) => {
        const x = acc.findIndex((item) => item.id === current.id);
        if (x <= -1) {
          acc.push(current);
        }
        return acc;
      }, []);
  }

  async load() {
    await this._material?.load();
    this._isLoaded = true;
  }

  async apply(object) {
    this._model = object;
    await this._material?.load();
    this._parts.forEach((part) => {
      let materialInstances = listMaterialByName(object, part.name);
      materialInstances.forEach((materialInstance) => {
        this._material?.apply(materialInstance, { size: part.size });
      });
    });
  }
}
