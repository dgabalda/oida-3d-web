// One GLB per structure in model/ (see src/model.js). No Three.js here, so the tests can import it.
// "canal" and "auditoryTubeBony" are reconstructed for this page: they are not in the Z-Anatomy atlas.
// "structure" (optional) is the clickable structure a part belongs to; by default, its own id.

export const MODEL_PARTS = [
  { id: "pinna", layer: "external", color: 0xe9c3ad },
  { id: "canal", layer: "external", color: 0xe0a59a, reconstructed: true },
  { id: "tympanum", layer: "middle", color: 0xd9a7a0, opacity: 0.9 },
  { id: "malleus", layer: "middle", color: 0xefe6d2 },
  { id: "incus", layer: "middle", color: 0xe8dcc0 },
  { id: "stapes", layer: "middle", color: 0xf2ead8 },
  { id: "auditoryTube", layer: "middle", color: 0xc4b7dc },
  // Bony part of the auditory tube (the atlas only has the cartilaginous part): same structure, reconstructed.
  { id: "auditoryTubeBony", structure: "auditoryTube", layer: "middle", color: 0xb9abd6, reconstructed: true },
  { id: "cochlea", layer: "inner", color: 0x7fa7e0 },
  { id: "vestibule", layer: "inner", color: 0x6fcbbf },
  { id: "nerve", layer: "inner", color: 0xf0d564 },
  { id: "temporalBone", layer: "context", color: 0xdedede, opacity: 0.18 },
];
