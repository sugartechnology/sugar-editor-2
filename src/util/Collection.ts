export const forEachAsync = async (
  array: any[],
  predicate: (a?: any) => {}
) => {
  await Promise.all(array.map(predicate));
};

export const filterAsync = async (arr: [], predicate: () => {}) => {
  const results = await Promise.all(arr.map(predicate));

  return arr.filter((_v, index) => results[index]);
};

export const forEachRunAsync = async (array: []) => {
  await Promise.all(array);
};

export const events: { name: String; listeners: (() => {})[] }[] = [];

export const addEventListener = async (name: String, func: () => {}) => {
  let event = events.find((e) => (e as any).name == name);
  if (!event) {
    event = { name: name, listeners: [] };
    events.push(event);
  }
  event.listeners.push(func);
};

export const removeEventListener = async (name: String, func: () => {}) => {
  let event = events.find((e) => e.name == name);
  if (!event) return;
  event.listeners = event.listeners.filter((e) => e != func);
};

export const runEventListener = async (name: String) => {
  let event = events.find((e) => e.name == name);
  if (!event) return;
  await Promise.all(event.listeners.map((lisener) => lisener()));
};
