import { Object3D } from "three";
import { waitTill } from "../util/Wait";

const cacheMap: any = {};
const log = false;

export interface Loader {
  load(usl: string, options?: {}): any;
}
export class LoaderManager {
  private _loader: Loader;

  constructor(loader: Loader) {
    this._loader = loader;
  }

  async load(url: string, options?: {}, clone = true) {
    if (!url || url === "") return undefined;

    log && console.log("load begins for ", url);
    if (cacheMap[url] && cacheMap[url].done && cacheMap[url].asset) {
      log && console.log("returned from cache for ", url);
      return clone ? cacheMap[url].asset.clone(true) : cacheMap[url].asset;
    }

    if (cacheMap[url] && !cacheMap[url].done) {
      log && console.log("waiting for queue for ", url);
      await waitTill(() => {
        return cacheMap[url].done;
      });
      log && console.log("queue ended, returning  for ", url);
      return clone ? cacheMap[url].asset.clone(true) : cacheMap[url].asset;
    }

    cacheMap[url] = { done: false, asset: null };

    log && console.log("Download begins  for ", url);
    const asset = await this._loader.load(url, options);
    log && console.log("Download ends  for ", url);
    if (asset) {
      log && console.log("load ends successfully for ", url);
      cacheMap[url].asset = asset;
      cacheMap[url].done = true;
      return asset;
    }

    log && console.log("load ends in error for ", url);
    cacheMap[url] = undefined;
    return undefined;
  }
}

export function clearAssetCache() {
  for (const key in cacheMap) {
    if (cacheMap[key] != null && cacheMap[key].asset instanceof Object3D) {
      cacheMap[key].asset?.traverse((child: any) => {
        child.geometry?.dispose();
        child.material?.dispose();
      });
      cacheMap[key].asset?.removeFromParent();
      cacheMap[key] = undefined;
    }
  }
}
