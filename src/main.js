import * as THREE from "three";
import { OrbitControls } from "three/addons/OrbitControls.js";
import { LAYERS, STEPS, byId } from "./anatomy.js";
import { loadEar } from "./model.js";
import { HearingAnimation } from "./animation.js";
import { ProgressStore } from "./progress.js";
import { QUESTIONS, score } from "./quiz.js";
import { NameLabels } from "./labels.js";

const $ = (sel) => document.querySelector(sel);
const viewer = $("#viewer");

function showError(message) {
  $("#loading").hidden = true;
  const box = $("#error");
  box.textContent = message;
  box.hidden = false;
}

function webglAvailable() {
  try {
    const c = document.createElement("canvas");
    return !!(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl")));
  } catch {
    return false;
  }
}

// ---------- Progress ----------
let storage = null;
try { storage = window.localStorage; } catch { storage = null; }
const progress = new ProgressStore(storage ?? { getItem() { throw new Error(); }, setItem() { throw new Error(); }, removeItem() {} });

function banner(text) {
  const b = $("#notice");
  b.textContent = text;
  b.hidden = false;
}

function renderResume() {
  const d = progress.data;
  const parts = [];
  if (d.previousVisit) parts.push(`Última visita: ${new Date(d.previousVisit).toLocaleString("ca-ES")}`);
  parts.push(`Estructures vistes: ${d.seen.length}`);
  const sc = score(d.quiz);
  parts.push(`Qüestionari: ${sc.correct} encerts de ${sc.answered} respostes (${sc.total} preguntes)`);
  if (d.lastView && byId(d.lastView)) parts.push(`Et vas quedar a: ${byId(d.lastView).name}`);
  $("#resume").textContent = parts.join(" · ");
}

// ---------- Scene ----------
let scene, camera, renderer, controls, model, animation, labels;
const INITIAL_CAMERA = new THREE.Vector3();
const INITIAL_TARGET = new THREE.Vector3();
const pickable = [];
let selected = null;

async function initScene() {
  model = await loadEar();
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(40, viewer.clientWidth / viewer.clientHeight, 0.05, 200);
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(viewer.clientWidth, viewer.clientHeight);
  viewer.appendChild(renderer.domElement);

  scene.add(new THREE.HemisphereLight(0xffffff, 0x445566, 1.6));
  const key = new THREE.DirectionalLight(0xffffff, 1.8);
  key.position.set(3, 5, 4);
  scene.add(key);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.minDistance = 0.4;
  controls.maxDistance = 30;
  // Initial view: from in front of and slightly above the right ear, looking at the middle ear.
  const size = model.box.getSize(new THREE.Vector3()).length();
  INITIAL_TARGET.set(0, 0, 0); // the tympanum
  INITIAL_CAMERA.set(-0.55 * size, 0.25 * size, 0.75 * size);
  resetView();

  scene.add(model.root);
  model.root.traverse((o) => { if (o.isMesh) pickable.push(o); });

  animation = new HearingAnimation(scene, model.pivots, onAnimationStep, model.wave);
  labels = new NameLabels(viewer, camera, model.root, isVisible);

  window.addEventListener("resize", () => {
    camera.aspect = viewer.clientWidth / viewer.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(viewer.clientWidth, viewer.clientHeight);
  });
  renderer.domElement.addEventListener("pointerdown", onPointerDown);
  renderer.domElement.addEventListener("pointerup", onPointerUp);

  const clock = new THREE.Clock();
  renderer.setAnimationLoop(() => {
    animation.update(clock.getDelta());
    controls.update();
    renderer.render(scene, camera);
    labels.update();
  });
}

function resetView() {
  camera.position.copy(INITIAL_CAMERA);
  controls.target.copy(INITIAL_TARGET);
  controls.update();
}

// A click selects; a drag (to rotate) does not.
let downAt = null;
function onPointerDown(e) { downAt = { x: e.clientX, y: e.clientY }; }
function onPointerUp(e) {
  if (!downAt || Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y) > 5) return;
  const rect = renderer.domElement.getBoundingClientRect();
  const pointer = new THREE.Vector2(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
  const ray = new THREE.Raycaster();
  ray.setFromCamera(pointer, camera);
  const hit = ray.intersectObjects(pickable.filter(isVisible), false)[0];
  select(hit ? hit.object.userData.structureId : null);
}

// Page coordinates of a structure's centre, or null when it is hidden.
function screenPoint(id) {
  const mesh = pickable.find((o) => o.userData.structureId === id && isVisible(o));
  if (!mesh) return null;
  const centre = new THREE.Box3().setFromObject(mesh).getCenter(new THREE.Vector3()).project(camera);
  const rect = renderer.domElement.getBoundingClientRect();
  return { x: rect.left + ((centre.x + 1) / 2) * rect.width, y: rect.top + ((1 - centre.y) / 2) * rect.height };
}

function isVisible(obj) {
  for (let o = obj; o; o = o.parent) if (!o.visible) return false;
  return true;
}

function setHighlight(id, on) {
  model.root.traverse((o) => {
    if (o.isMesh && o.userData.structureId === id) o.material.emissive?.setHex(on ? 0x3a2a00 : 0x000000);
  });
}

export function select(id) {
  if (selected) setHighlight(selected, false);
  selected = id;
  const panel = $("#info");
  if (!id) {
    panel.innerHTML = "<p class=\"hint\">Clica una estructura per veure'n el nom.</p>";
    return;
  }
  setHighlight(id, true);
  const s = byId(id);
  panel.innerHTML = "";
  const h = document.createElement("h2");
  h.textContent = s.name;
  const p = document.createElement("p");
  p.textContent = s.text;
  panel.append(h, p);
  progress.markSeen(id);
  renderResume();
}

// ---------- Layers ----------
const layerHidden = new Set(LAYERS.filter((l) => l.hiddenByDefault).map((l) => l.id));
function renderLayers() {
  const box = $("#layers");
  box.innerHTML = "";
  for (const layer of LAYERS) {
    const label = document.createElement("label");
    const input = document.createElement("input");
    input.type = "checkbox";
    input.checked = layer.available && !layerHidden.has(layer.id);
    input.disabled = !layer.available;
    input.dataset.layer = layer.id;
    input.addEventListener("change", () => {
      if (input.checked) layerHidden.delete(layer.id); else layerHidden.add(layer.id);
      applyLayers();
    });
    label.append(input, ` ${layer.name}${layer.available ? "" : " (properament)"}`);
    box.append(label);
  }
}

// The animation goes through the external and middle ear: they are shown while it plays.
const ANIMATION_LAYERS = ["external", "middle"];
function applyLayers(forceShow = false) {
  for (const layer of LAYERS) {
    model.layers[layer.id].visible = (forceShow && ANIMATION_LAYERS.includes(layer.id)) || !layerHidden.has(layer.id);
  }
  if (selected && !pickable.some((o) => o.userData.structureId === selected && isVisible(o))) select(null);
}

// ---------- Animation ----------
function renderSteps() {
  const ol = $("#steps");
  ol.innerHTML = "";
  STEPS.forEach((s, i) => {
    const li = document.createElement("li");
    li.textContent = s.name;
    li.dataset.index = String(i);
    ol.append(li);
  });
}

// Part whose label is highlighted at each animation step (the wave travels along the canal).
const STEP_PART = { wave: "canal" };
function onAnimationStep(index, done) {
  document.querySelectorAll("#steps li").forEach((li) => li.classList.toggle("active", Number(li.dataset.index) === index));
  const step = STEPS[index];
  labels.setActive(done || !step ? null : (STEP_PART[step.id] ?? step.id));
  if (done) {
    $("#play").textContent = "Reprodueix";
    applyLayers(); // layers back to how the user left them
  }
}

function bindAnimation() {
  $("#play").addEventListener("click", () => {
    if (animation.playing) {
      animation.pause();
      $("#play").textContent = "Continua";
    } else {
      applyLayers(true); // show the layers the animation goes through
      animation.play();
      $("#play").textContent = "Pausa";
    }
  });
  $("#restart").addEventListener("click", () => {
    applyLayers(true);
    animation.restart();
    $("#play").textContent = "Pausa";
  });
}

// ---------- Quiz ----------
function renderQuiz() {
  const box = $("#quiz-questions");
  box.innerHTML = "";
  for (const q of QUESTIONS) {
    const fs = document.createElement("fieldset");
    fs.dataset.question = q.id;
    const lg = document.createElement("legend");
    lg.textContent = q.text;
    fs.append(lg);
    q.options.forEach((opt, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = opt;
      b.addEventListener("click", () => {
        const correct = i === q.answer;
        progress.answer(q.id, correct);
        showFeedback(fs, q, correct);
        renderResume();
      });
      fs.append(b);
    });
    const fb = document.createElement("p");
    fb.className = "feedback";
    fs.append(fb);
    const prev = progress.data.quiz[q.id];
    if (prev) showFeedback(fs, q, prev.correct);
    box.append(fs);
  }
}

function showFeedback(fs, q, correct) {
  const fb = fs.querySelector(".feedback");
  fb.textContent = `${correct ? "Correcte." : "No és correcte."} ${q.explanation}`;
  fb.className = `feedback ${correct ? "ok" : "ko"}`;
}

// ---------- Export / import / reset ----------
function bindProgressButtons() {
  $("#export").addEventListener("click", () => {
    const blob = new Blob([progress.exportJSON()], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `oida3d-progres-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  });
  $("#import").addEventListener("change", async (e) => {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;
    const result = ProgressStore.parseImport(await file.text());
    if (!result.ok) {
      banner(`No s'ha importat el fitxer: ${result.error} El progrés actual no ha canviat.`);
      return;
    }
    if (!window.confirm("Vols substituir el progrés actual pel del fitxer?")) return;
    progress.replace(result.data);
    renderQuiz();
    renderResume();
    banner("Progrés importat.");
  });
  $("#reset").addEventListener("click", () => {
    if (!window.confirm("Segur que vols començar de zero? S'esborrarà tot el progrés.")) return;
    progress.reset();
    renderQuiz();
    renderResume();
    select(null);
  });
}

// ---------- Start ----------
async function start() {
  if (!webglAvailable()) {
    showError("Aquest navegador no pot mostrar gràfics 3D (WebGL). Prova-ho amb una versió recent de Chrome o Firefox, i comprova que l'acceleració per maquinari estigui activada.");
    return;
  }
  try {
    await initScene();
  } catch (err) {
    console.error(err);
    showError("No s'ha pogut carregar el model 3D. Torna a carregar la pàgina o prova-ho amb un altre navegador.");
    return;
  }
  progress.recordVisit();
  if (!progress.available) banner("Aquest navegador no deixa desar dades (potser és en mode privat): tot funciona, però el progrés no es guardarà.");
  else if (progress.notice) banner(progress.notice);
  renderLayers();
  applyLayers();
  renderSteps();
  renderQuiz();
  renderResume();
  select(null);
  bindAnimation();
  bindProgressButtons();
  $("#reset-view").addEventListener("click", resetView);
  $("#show-names").addEventListener("change", (e) => labels.setShown(e.target.checked));
  $("#loading").hidden = true;
  window.__oida = { select, screenPoint }; // used by the smoke test
  document.body.dataset.ready = "true";
}

start();
