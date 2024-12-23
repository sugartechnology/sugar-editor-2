import {
  ImageLoader,
  LinearFilter,
  LinearMipMapLinearFilter,
  RepeatWrapping,
  Texture,
  TextureLoader
} from "three";
import { Loader } from "./Loader";

export class SugarTextureLoader implements Loader {
  private textureLoader: TextureLoader | undefined;

  //canvas: HTMLCanvasElement | undefined;

  public constructor() {}

  getTextureLoader() {
    if (!this.textureLoader) {
      this.textureLoader = new TextureLoader();
    }
    return this.textureLoader;
  }

  load(key: string) {
    //const resizeFunc = this.resize.bind(this);
    const promise = new Promise((resolve, reject) => {
      const texture = new Texture();
      const url = key; //tex.uri;
      const imageLoader = new ImageLoader(this.getTextureLoader().manager);

      imageLoader.setCrossOrigin(this.getTextureLoader().crossOrigin);
      imageLoader.setPath(this.getTextureLoader().path);

      imageLoader.load(url, function (image) {
        texture.image = image; // resizeFunc(image);
        texture.wrapS = RepeatWrapping;
        texture.wrapT = RepeatWrapping;
        texture.minFilter = LinearMipMapLinearFilter;
        texture.magFilter = LinearFilter;
        texture.needsUpdate = true;
        resolve(texture);
      });
    });
    return promise;
  }
}
