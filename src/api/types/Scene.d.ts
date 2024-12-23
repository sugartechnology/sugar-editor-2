export class SceneInfo {
  name: string;
  products?: any[];
  productInstances?: any[];
// If ids are set, products and productInstances will be ignored
  productIds?: any[];
  shapes: {
    corners: any[];
    walls: any[];
  };
}

export class SceneResponse {
  inAppId: string;
  name: string;
  fileUrl: string;
  scene?: SceneInfo;
}
