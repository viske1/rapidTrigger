import { initialState } from "./data";
import type { Library, ShortcutSet } from "./types";

const KEY = "shortcut-center-v2";

/** Identifiant court, suffisant pour distinguer des jeux créés à la main. */
export function newId(prefix = "set"): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function createSet(name: string, base = initialState()): ShortcutSet {
  return { id: newId(), name, ...base };
}

function defaultLibrary(): Library {
  const set = createSet("Par défaut");
  return { sets: [set], activeId: set.id };
}

export function loadLibrary(): Library {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Library;
      // Une bibliothèque vide laisserait l'application sans jeu actif.
      if (parsed && Array.isArray(parsed.sets) && parsed.sets.length > 0) {
        const activeId = parsed.sets.some(s => s.id === parsed.activeId)
          ? parsed.activeId
          : parsed.sets[0].id;
        return { sets: parsed.sets, activeId };
      }
    }
  } catch {
    /* stockage indisponible ou corrompu : on repart des défauts */
  }
  return defaultLibrary();
}

export function saveLibrary(library: Library): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(library));
  } catch {
    /* quota ou mode privé */
  }
}
