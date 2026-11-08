// Right ear from the Z-Anatomy atlas, licensed per part (middle and inner ear: University of Dundee,
// CC BY-NC-SA 4.0; pinna, auditory tube and temporal bone: CC BY-SA 4.0 — see model/LLICENCIA.md), exported to model/*.glb by
// scripts/model/exporta-orella.py: one file per structure, in metres. The ear canal
// ("canal") is RECONSTRUCTED for this page (an S-shaped tube from the concha to the
// tympanum of the same atlas); it is not in the atlas and the page says so.
// The scene is centred on the tympanum and scaled to centimetres (1 unit = 1 cm).

import * as THREE from "three";
import { parseGLB } from "./glb.js";
import { MODEL_PARTS } from "./parts.js";

const ANIMATED = ["tympanum", "malleus", "incus", "stapes"];
const SCALE = 100; // metres → centimetres

function tagged(mesh, id) {
  mesh.userData.structureId = id;
  return mesh;
}

function geometryFrom(glb) {
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(glb.positions, 3));
  if (glb.normals) g.setAttribute("normal", new THREE.BufferAttribute(glb.normals, 3));
  if (glb.indices) g.setIndex(new THREE.BufferAttribute(glb.indices, 1));
  if (!glb.normals) g.computeVertexNormals();
  return g;
}

export async function loadEar(base = "model/") {
  const loaded = await Promise.all(MODEL_PARTS.map(async (p) => {
    const res = await fetch(`${base}${p.id}.glb`);
    if (!res.ok) throw new Error(`${p.id}.glb: HTTP ${res.status}`);
    return { part: p, glb: parseGLB(await res.arrayBuffer()) };
  }));

  const geoms = Object.fromEntries(loaded.map(({ part, glb }) => [part.id, geometryFrom(glb)]));
  for (const g of Object.values(geoms)) g.scale(SCALE, SCALE, SCALE);
  geoms.tympanum.computeBoundingBox();
  const origin = geoms.tympanum.boundingBox.getCenter(new THREE.Vector3()).negate();
  for (const g of Object.values(geoms)) g.translate(origin.x, origin.y, origin.z);

  const root = new THREE.Group();
  root.name = "ear";
  const layers = {};
  for (const id of ["external", "middle", "inner", "context"]) {
    layers[id] = new THREE.Group();
    layers[id].name = id;
    root.add(layers[id]);
  }
  layers.context.visible = false; // temporal bone: optional context, off by default

  const pivots = {};
  const centres = {};
  for (const { part } of loaded) {
    const g = geoms[part.id];
    g.computeBoundingBox();
    const c = g.boundingBox.getCenter(new THREE.Vector3());
    centres[part.id] = c.clone();
    const mat = new THREE.MeshStandardMaterial({
      color: part.color, roughness: 0.55, metalness: 0.05, side: THREE.DoubleSide,
      transparent: part.opacity !== undefined, opacity: part.opacity ?? 1, depthWrite: part.opacity === undefined || part.opacity > 0.5,
    });
    const mesh = tagged(new THREE.Mesh(g, mat), part.structure ?? part.id);
    if (ANIMATED.includes(part.id)) {
      // Pivot at the structure's centre so it can move or rotate in place.
      g.translate(-c.x, -c.y, -c.z);
      pivots[part.id] = new THREE.Group();
      pivots[part.id].position.copy(c);
      pivots[part.id].add(mesh);
      layers[part.layer].add(pivots[part.id]);
    } else {
      layers[part.layer].add(mesh);
    }
  }

  // Oval window: schematic reference ring where the stapes footplate meets the vestibule.
  const toVestibule = centres.vestibule.clone().sub(centres.stapes).normalize();
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.13, 0.015, 12, 48),
    new THREE.MeshStandardMaterial({ color: 0x3f7fc0, roughness: 0.5 }),
  );
  ring.position.copy(centres.stapes).addScaledVector(toVestibule, 0.18);
  ring.lookAt(ring.position.clone().add(toVestibule));
  layers.middle.add(tagged(ring, "ovalWindow"));

  // Path of the sound wave: along the reconstructed canal, from its entrance to the tympanum.
  const wave = {
    from: centres.canal.clone().multiplyScalar(2).sub(centres.tympanum), // entrance ≈ mirror of the tympanum about the canal centre
    to: centres.tympanum.clone(),
    radius: 0.32,
  };

  const box = new THREE.Box3().setFromObject(layers.external).union(new THREE.Box3().setFromObject(layers.inner));
  return { root, layers, pivots, centres, wave, box };
}
