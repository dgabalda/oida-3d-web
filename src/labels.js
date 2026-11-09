// Name labels over the 3D model: one HTML label per structure, pushed outwards from the
// centre of the model, with a leader line to its part. Labels of hidden parts are hidden too.
// Plain DOM + SVG projected each frame (no CSS2DRenderer in vendor/, nothing downloaded).
// SVG elements are created through the HTML parser, so the code has no namespace URL in it
// (the publish script rejects any external address in the page or the code).

import * as THREE from "three";
import { byId } from "./anatomy.js";

const OFFSET = 110;      // px from the part to its label, along the outward direction
const GAP = 4;           // px between labels after resolving overlaps

// Vertex of the mesh nearest a world point, returned in the mesh's local coordinates.
function nearestVertex(mesh, worldPoint) {
  const p = worldPoint.clone().applyMatrix4(mesh.matrixWorld.clone().invert());
  const pos = mesh.geometry.attributes.position;
  const v = new THREE.Vector3(), best = new THREE.Vector3();
  let bestD = Infinity;
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const d = v.distanceToSquared(p);
    if (d < bestD) { bestD = d; best.copy(v); }
  }
  return best;
}

export class NameLabels {
  constructor(container, camera, root, isVisible) {
    this.camera = camera;
    this.isVisible = isVisible;
    this.active = null;
    this.layer = document.createElement("div");
    this.layer.className = "labels";
    this.layer.setAttribute("aria-hidden", "true"); // the names are also in the side panel when clicked
    const tmp = document.createElement("div");
    tmp.innerHTML = '<svg class="label-lines"></svg>';
    this.svg = tmp.firstElementChild;
    this.layer.append(this.svg);
    container.append(this.layer);

    // Group meshes by structure; keep each mesh's anchor (a vertex ON the part, in local coordinates)
    // to project it every frame. By default, the vertex nearest the centre of its bounding box, so the
    // leader line always touches the part. The malleus is anchored on its handle (the vertex nearest
    // the point halfway between its centre and the centre of the tympanum, where the handle runs);
    // the incus, on its body (default).
    root.updateMatrixWorld(true);
    const meshes = [];
    root.traverse((o) => { if (o.isMesh && o.userData.structureId && byId(o.userData.structureId)) meshes.push(o); });
    const worldCentre = (id) => {
      const box = new THREE.Box3();
      for (const m of meshes) if (m.userData.structureId === id) box.expandByObject(m);
      return box.isEmpty() ? null : box.getCenter(new THREE.Vector3());
    };
    const tympanum = worldCentre("tympanum");
    const groups = new Map();
    for (const o of meshes) {
      const id = o.userData.structureId;
      o.geometry.computeBoundingBox();
      let target = o.geometry.boundingBox.getCenter(new THREE.Vector3()).applyMatrix4(o.matrixWorld);
      if (id === "malleus" && tympanum) target = target.clone().lerp(tympanum, 0.5); // middle of the handle
      const local = nearestVertex(o, target);
      if (!groups.has(id)) groups.set(id, []);
      groups.get(id).push({ mesh: o, local });
    }
    this.items = [...groups].map(([id, meshes]) => {
      const el = document.createElement("span");
      el.className = "label";
      el.dataset.structure = id;
      el.textContent = byId(id).name;
      this.svg.insertAdjacentHTML("beforeend", "<line></line>");
      const line = this.svg.lastElementChild;
      this.layer.append(el);
      return { id, meshes, el, line };
    });
    this.root = root;
    this.setShown(true);
  }

  setShown(on) {
    this.shown = on;
    this.layer.hidden = !on;
  }

  setActive(id) {
    this.active = id;
    for (const it of this.items) it.el.classList.toggle("active", it.id === id);
  }

  update() {
    if (!this.shown) return;
    const w = this.layer.clientWidth, h = this.layer.clientHeight;
    this.svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    const toScreen = (v) => {
      const p = v.clone().project(this.camera);
      return { x: (p.x + 1) / 2 * w, y: (1 - p.y) / 2 * h, front: p.z < 1 };
    };
    const visible = [];
    for (const it of this.items) {
      const ms = it.meshes.filter((m) => this.isVisible(m.mesh));
      if (!ms.length) { it.el.hidden = true; it.line.style.display = "none"; continue; }
      const c = new THREE.Vector3();
      for (const m of ms) c.add(m.local.clone().applyMatrix4(m.mesh.matrixWorld));
      c.divideScalar(ms.length);
      const a = toScreen(c);
      if (!a.front) { it.el.hidden = true; it.line.style.display = "none"; continue; }
      visible.push({ it, a });
    }
    if (!visible.length) return;
    // Outward direction from the screen centre of the visible parts.
    const cx = visible.reduce((s, v) => s + v.a.x, 0) / visible.length;
    const cy = visible.reduce((s, v) => s + v.a.y, 0) / visible.length;
    for (const v of visible) {
      v.it.el.hidden = false;
      let dx = v.a.x - cx, dy = v.a.y - cy;
      const d = Math.hypot(dx, dy) || 1;
      dx /= d; dy /= d;
      if (Math.hypot(v.a.x - cx, v.a.y - cy) < 1) { dx = 1; dy = 0; }
      v.w = v.it.el.offsetWidth; v.h = v.it.el.offsetHeight;
      v.x = v.a.x + dx * OFFSET - (dx < 0 ? v.w : 0);
      v.y = v.a.y + dy * OFFSET - v.h / 2;
    }
    // Resolve overlaps (the ossicles are small and close together): push apart vertically.
    for (let pass = 0; pass < 30; pass++) {
      let moved = false;
      for (let i = 0; i < visible.length; i++) {
        for (let j = i + 1; j < visible.length; j++) {
          const p = visible[i], q = visible[j];
          const ox = Math.min(p.x + p.w, q.x + q.w) - Math.max(p.x, q.x);
          const oy = Math.min(p.y + p.h, q.y + q.h) - Math.max(p.y, q.y);
          if (ox > -GAP && oy > -GAP) {
            const push = (oy + GAP) / 2;
            if (p.y <= q.y) { p.y -= push; q.y += push; } else { p.y += push; q.y -= push; }
            moved = true;
          }
        }
      }
      if (!moved) break;
    }
    for (const v of visible) {
      v.x = Math.max(2, Math.min(w - v.w - 2, v.x));
      v.y = Math.max(2, Math.min(h - v.h - 2, v.y));
      v.it.el.style.transform = `translate(${Math.round(v.x)}px, ${Math.round(v.y)}px)`;
      const lx = v.x + (v.x + v.w / 2 < v.a.x ? v.w : 0);
      const ly = v.y + v.h / 2;
      const l = v.it.line;
      l.style.display = "";
      l.setAttribute("x1", v.a.x); l.setAttribute("y1", v.a.y);
      l.setAttribute("x2", lx); l.setAttribute("y2", ly);
      l.classList.toggle("active", v.it.id === this.active);
    }
  }
}
