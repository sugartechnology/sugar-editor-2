import {
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial
} from "three";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { Loader } from "./Loader";
import addBeforeCompile from "./MultipleMapShader";

export class Sugar3DLoader implements Loader {
  public constructor() {
    this._loader = this.getGLTFLoader();
  }

  private _loader: GLTFLoader;

  load(
    url: string,
    options?: { onProgress?: (event: ProgressEvent) => void } | undefined
  ) {
    return new Promise((resolve, reject) => {
      this._loader.load(
        url,
        (returnObject) => {
          returnObject.scene.traverse((mesh) => {
            if (mesh instanceof Mesh) {
              this.resolveShadaw(mesh);
              this.resolveMaterial(mesh);
            }
          });
          resolve(returnObject.scene);
        },
        options?.onProgress,
        reject
      );
    });
  }

  private getGLTFLoader() {
    const loader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath(
      "https://s3.eu-central-1.amazonaws.com/cdn.sugartech/mottobucket/draco/161/"
    );
    loader.setDRACOLoader(dracoLoader);
    return loader;
  }

  private resolveShadaw(mesh: Mesh) {
    mesh.castShadow = true;
    mesh.receiveShadow = true;
  }

  private resolveMaterial(mesh: Mesh) {
    addBeforeCompile(
      mesh.material as
        | MeshBasicMaterial
        | MeshStandardMaterial
        | MeshPhysicalMaterial
    );
  }
}
