export function engineRequestAfter(node: Node, func: Function, dispose: boolean) {
  const event = new CustomEvent("engine-request-after", {
    detail: {
      callback: func,
      dispose: dispose,
    },
    bubbles: true,
  });
  node.dispatchEvent(event);
}

export function engineRequestBefore(node: Node, func: Function, dispose: boolean) {
  const event = new CustomEvent("engine-request-before", {
    detail: {
      callback: func,
      dispose: dispose,
    },
    bubbles: true,
  });
  node.dispatchEvent(event);
}

export function cameraGo2d(node: Node) {
  const event = new CustomEvent("camera-go-2d", {
    bubbles: true,
  });
  node.dispatchEvent(event);
}