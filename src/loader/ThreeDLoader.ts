import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export class ThreeDLoader {
  private static _instance: ThreeDLoader | null = null;

  private static _gltfloader: GLTFLoader;

  static instance = () => {
    if (!ThreeDLoader._instance) ThreeDLoader._instance = new ThreeDLoader();
    return ThreeDLoader._instance;
  };

  private constructor() {}

  loadModel = async (modelUrl: string) => {
    const loader = this.getGltfLoader();

    const gltf = await new Promise((resolve, reject) => {
      loader.load(modelUrl, resolve, undefined, reject);
    });

    return gltf;
  };

  private getGltfLoader = () => {
    if (!ThreeDLoader._gltfloader) {
      ThreeDLoader._gltfloader = new GLTFLoader();
      const dracoLoader = new DRACOLoader();
      dracoLoader.setDecoderPath(
        "https://s3.eu-central-1.amazonaws.com/cdn.sugartech/mottobucket/draco/161/"
      );
      ThreeDLoader._gltfloader.setDRACOLoader(dracoLoader);
    }

    return ThreeDLoader._gltfloader;
  };
}
