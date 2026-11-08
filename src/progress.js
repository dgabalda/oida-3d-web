// Study progress kept in the browser, with versioned export and import.
// Pure logic: the storage object is injected so it can be tested without a browser.

export const STORAGE_KEY = "oida3d.progress";
export const FORMAT_VERSION = 1;

export function emptyProgress(now = new Date()) {
  return {
    version: FORMAT_VERSION,
    seen: [],
    lastView: null,
    quiz: {},
    lastVisit: null,
    previousVisit: null,
    createdAt: now.toISOString(),
  };
}

// Brings an older format up to date. Returns null when it cannot be read.
export function migrate(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) return null;
  if (data.version === FORMAT_VERSION) return data;
  return null; // No older formats exist yet: version 1 is the first.
}

const isDate = (v) => v === null || (typeof v === "string" && !Number.isNaN(Date.parse(v)));

export function validate(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) return "No és un fitxer de progrés.";
  if (data.version !== FORMAT_VERSION) return `Versió del fitxer no compatible (${data.version ?? "cap"}).`;
  if (!Array.isArray(data.seen) || !data.seen.every((s) => typeof s === "string")) return "La llista d'estructures vistes no és vàlida.";
  if (data.lastView !== null && typeof data.lastView !== "string") return "L'última vista no és vàlida.";
  if (!data.quiz || typeof data.quiz !== "object" || Array.isArray(data.quiz)) return "Els resultats del qüestionari no són vàlids.";
  for (const [id, answer] of Object.entries(data.quiz)) {
    if (!answer || typeof answer.correct !== "boolean" || !isDate(answer.date)) return `La resposta «${id}» no és vàlida.`;
  }
  if (!isDate(data.lastVisit) || !isDate(data.previousVisit ?? null)) return "Les dates de visita no són vàlides.";
  return null;
}

// Wraps a Storage-like object. Every access is guarded: private mode or a full or
// blocked storage must never break the page, only switch saving off.
export class ProgressStore {
  constructor(storage, now = () => new Date()) {
    this.storage = storage;
    this.now = now;
    this.available = this.#probe();
    this.notice = null; // set when the saved progress had to be discarded
    this.data = this.#load();
  }

  #probe() {
    try {
      const k = STORAGE_KEY + ".probe";
      this.storage.setItem(k, "1");
      this.storage.removeItem(k);
      return true;
    } catch {
      return false;
    }
  }

  #load() {
    if (!this.available) return emptyProgress(this.now());
    let raw;
    try {
      raw = this.storage.getItem(STORAGE_KEY);
    } catch {
      this.available = false;
      return emptyProgress(this.now());
    }
    if (raw === null) return emptyProgress(this.now());
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      this.notice = "El progrés desat estava malmès i s'ha començat de zero.";
      return emptyProgress(this.now());
    }
    const migrated = migrate(parsed);
    if (!migrated || validate(migrated)) {
      this.notice = "El progrés desat no es podia llegir i s'ha començat de zero.";
      return emptyProgress(this.now());
    }
    return migrated;
  }

  save() {
    if (!this.available) return false;
    try {
      this.storage.setItem(STORAGE_KEY, JSON.stringify(this.data));
      return true;
    } catch {
      this.available = false;
      return false;
    }
  }

  // Call once per page load: keeps the previous visit for the resume summary.
  recordVisit() {
    this.data.previousVisit = this.data.lastVisit;
    this.data.lastVisit = this.now().toISOString();
    this.save();
  }

  markSeen(id) {
    if (!this.data.seen.includes(id)) this.data.seen.push(id);
    this.data.lastView = id;
    this.save();
  }

  answer(questionId, correct) {
    this.data.quiz[questionId] = { correct, date: this.now().toISOString() };
    this.save();
  }

  reset() {
    this.data = emptyProgress(this.now());
    this.save();
  }

  exportJSON() {
    return JSON.stringify(this.data, null, 2);
  }

  // Returns { ok, error, data }. Does not touch the current progress: the caller
  // asks for confirmation and then calls replace().
  static parseImport(text) {
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      return { ok: false, error: "El fitxer no és JSON vàlid." };
    }
    const migrated = migrate(parsed);
    const error = migrated ? validate(migrated) : validate(parsed);
    if (error) return { ok: false, error };
    return { ok: true, data: migrated };
  }

  replace(data) {
    this.data = data;
    this.save();
  }
}
