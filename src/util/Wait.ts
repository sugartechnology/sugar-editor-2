export const wait = (time: number) => {
  return new Promise<void>((response, reject) => {
    setTimeout(() => {
      response();
    }, time);
  });
};

export const waitTill = (
  expression: () => boolean,
  resolveI?: (value: unknown) => void
) => {
  var p = new Promise((resolve, reject) => {
    if (!expression()) {
      setTimeout(() => {
        waitTill(expression, resolveI ? resolveI : resolve);
      }, 1);
    } else {
      if (resolveI) {
        resolveI(null);
      } else if (resolve) {
        resolve(null);
      }
    }
  });
  return p;
};
