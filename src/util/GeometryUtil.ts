import {
  Box3,
  BufferAttribute,
  BufferGeometry,
  Mesh,
  MeshBasicMaterial,
  Object3D,
} from "three";

export const DEFAULT_ROOM = {
  points: [
    { x: -3.5, y: 0, z: -2.5 },
    { x: 3.5, y: 0, z: -2.5 },
    { x: 3.5, y: 0, z: 2.5 },
    { x: -3.5, y: 0, z: 2.5 },
  ],
  lines: [
    { start: 0, end: 1, hidden: false },
    { start: 1, end: 2, hidden: false },
    { start: 2, end: 3, hidden: false },
    { start: 3, end: 0, hidden: false },
  ],
};

export const DEFAULT_ROOM_LARGE = {
  points: [
    { x: -4.5, y: 0, z: -3.5 },
    { x: 4.5, y: 0, z: -3.5 },
    { x: 4.5, y: 0, z: 3.5 },
    { x: -4.5, y: 0, z: 3.5 },
  ],
  lines: [
    { start: 0, end: 1, hidden: false },
    { start: 1, end: 2, hidden: false },
    { start: 2, end: 3, hidden: false },
    { start: 3, end: 0, hidden: false },
  ],}

export function calculateBoundingBoxAll(model: Object3D): Mesh[] {
  const bounds: Mesh[] = [];
  (model as Object3D).traverse((o) => {
    if (o instanceof Mesh) {
      bounds.push(calculateBoundingBox(o));
    }
  });
  return bounds;
}

export function calculateBoundingBox(model: Mesh): Mesh {
  const box3 = new Box3();
  box3.setFromObject(model, true);

  const geometry = new BufferGeometry();
  const vertices = new Float32Array([
    // Arka yüz
    box3.min.x,
    box3.min.y,
    box3.min.z, // 0
    box3.max.x,
    box3.min.y,
    box3.min.z, // 1
    box3.max.x,
    box3.max.y,
    box3.min.z, // 2
    box3.min.x,
    box3.max.y,
    box3.min.z, // 3
    // Ön yüz
    box3.min.x,
    box3.min.y,
    box3.max.z, // 4
    box3.max.x,
    box3.min.y,
    box3.max.z, // 5
    box3.max.x,
    box3.max.y,
    box3.max.z, // 6
    box3.min.x,
    box3.max.y,
    box3.max.z, // 7
  ]);
  const indices = new Uint16Array([
    // Arka
    0, 2, 1, 0, 3, 2,
    // Ön
    4, 5, 6, 4, 6, 7,
    // Üst
    3, 7, 6, 3, 6, 2,
    // Alt
    0, 1, 5, 0, 5, 4,
    // Sağ
    1, 2, 6, 1, 6, 5,
    // Sol
    0, 4, 7, 0, 7, 3,
  ]);

  geometry.setIndex(new BufferAttribute(indices, 1));
  geometry.setAttribute("position", new BufferAttribute(vertices, 3));
  geometry.computeVertexNormals();

  const material = new MeshBasicMaterial({ color: 0xff000055 });
  material.transparent = true;
  material.opacity = 0.3;
  const mesh = new Mesh(geometry, material);
  return mesh;
}
