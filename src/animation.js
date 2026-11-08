// Slow-motion hearing animation: wave -> tympanum -> malleus -> incus -> stapes.
// Each step starts a little after the previous one so the chain can be followed.
// Amplitudes are exaggerated on purpose; the real movement is microscopic.

import * as THREE from "three";
import { STEPS } from "./anatomy.js";

const STEP_SECONDS = 1.6;
const FREQ = 1.2; // oscillations per second, slowed down

export class HearingAnimation {
  // wave: { from, to, radius } in scene units — path of the sound along the ear canal.
  constructor(scene, pivots, onStep, wave) {
    this.pivots = pivots;
    this.onStep = onStep;
    this.time = 0;
    this.playing = false;
    this.finished = false;
    this.rest = Object.fromEntries(Object.entries(pivots).map(([k, p]) => [k, { pos: p.position.clone(), rot: p.rotation.clone() }]));

    // Sound wave: rings travelling along the ear canal towards the tympanum.
    this.waves = [];
    this.wave = wave;
    const dir = wave.to.clone().sub(wave.from).normalize();
    const facing = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir);
    const mat = new THREE.MeshBasicMaterial({ color: 0x5aa0e6, transparent: true, opacity: 0, side: THREE.DoubleSide });
    for (let i = 0; i < 3; i++) {
      const ring = new THREE.Mesh(new THREE.RingGeometry(wave.radius, wave.radius * 1.12, 48), mat.clone());
      ring.quaternion.copy(facing);
      ring.visible = false;
      scene.add(ring);
      this.waves.push(ring);
    }
    this.duration = STEP_SECONDS * (STEPS.length + 1.5);
  }

  play() {
    if (this.finished) this.restart();
    this.playing = true;
  }

  pause() {
    this.playing = false;
  }

  restart() {
    this.time = 0;
    this.finished = false;
    this.playing = true;
    this.#apply(0);
  }

  stop() {
    this.playing = false;
    this.time = 0;
    this.#apply(-1);
  }

  currentStep() {
    if (this.time <= 0) return -1;
    return Math.min(STEPS.length - 1, Math.floor(this.time / STEP_SECONDS));
  }

  update(dt) {
    if (!this.playing) return;
    this.time += dt;
    if (this.time >= this.duration) {
      this.playing = false;
      this.finished = true;
      this.#apply(-1);
      this.onStep(-1, true);
      return;
    }
    this.#apply(this.time);
    this.onStep(this.currentStep(), false);
  }

  // Amplitude envelope for the step with this index: fades in when it starts.
  #env(t, index) {
    const start = index * STEP_SECONDS;
    if (t < start) return 0;
    return Math.min(1, (t - start) / 0.6);
  }

  #apply(t) {
    const { tympanum, malleus, incus, stapes } = this.pivots;
    for (const [k, p] of Object.entries(this.pivots)) {
      p.position.copy(this.rest[k].pos);
      p.rotation.copy(this.rest[k].rot);
    }
    this.waves.forEach((w) => { w.visible = false; });
    if (t < 0) return;

    // Step 0: wave rings travel along the canal towards the tympanum.
    this.waves.forEach((w, i) => {
      const phase = ((t * 0.9 + i / this.waves.length) % 1);
      w.visible = true;
      w.position.lerpVectors(this.wave.from, this.wave.to, phase);
      w.material.opacity = 0.7 * Math.sin(Math.PI * phase);
    });

    const s = Math.sin(2 * Math.PI * FREQ * t);
    // Units are centimetres; the ossicles are a few millimetres long.
    tympanum.position.x += 0.04 * this.#env(t, 1) * s;
    malleus.rotation.z += 0.18 * this.#env(t, 2) * s;
    incus.rotation.z += 0.14 * this.#env(t, 3) * s;
    stapes.position.x += 0.025 * this.#env(t, 4) * s;
  }
}
