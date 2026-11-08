// Minimal reader for the GLB files in model/: one mesh, one primitive, POSITION, NORMAL
// and indices, no textures. Pure JavaScript (no Three.js) so the tests can use it too.

const COMPONENTS = { 5121: Uint8Array, 5123: Uint16Array, 5125: Uint32Array, 5126: Float32Array };
const SIZES = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4 };

export function parseGLB(buffer) {
  const view = new DataView(buffer);
  if (view.getUint32(0, true) !== 0x46546c67) throw new Error("not a GLB file");
  let offset = 12;
  let json = null;
  let bin = null;
  while (offset < view.byteLength) {
    const length = view.getUint32(offset, true);
    const type = view.getUint32(offset + 4, true);
    const start = offset + 8;
    if (type === 0x4e4f534a) json = JSON.parse(new TextDecoder().decode(new Uint8Array(buffer, start, length)));
    else if (type === 0x004e4942) bin = buffer.slice(start, start + length);
    offset = start + length;
  }
  if (!json || !bin) throw new Error("GLB without JSON or binary chunk");

  const read = (index) => {
    const acc = json.accessors[index];
    const bv = json.bufferViews[acc.bufferView];
    const Type = COMPONENTS[acc.componentType];
    const count = acc.count * SIZES[acc.type];
    return new Type(bin, (bv.byteOffset || 0) + (acc.byteOffset || 0), count);
  };
  const prim = json.meshes[0].primitives[0];
  const node = json.nodes.find((n) => n.mesh === 0) || {};
  return {
    positions: read(prim.attributes.POSITION),
    normals: prim.attributes.NORMAL !== undefined ? read(prim.attributes.NORMAL) : null,
    indices: prim.indices !== undefined ? read(prim.indices) : null,
    extras: node.extras || json.meshes[0].extras || {},
  };
}
