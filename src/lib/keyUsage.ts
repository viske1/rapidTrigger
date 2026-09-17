import type { Shortcut } from "./types";

/** Raccourcis qui emploient une touche donnée, et intensité de son usage. */
export interface KeyUsage {
  /** Nombre de raccourcis employant la touche. */
  count: number;
  /** Part de l'usage le plus fréquent, entre 0 et 1. */
  intensity: number;
  shortcuts: Shortcut[];
}

/**
 * Recense l'emploi de chaque touche dans un jeu de raccourcis.
 *
 * L'intensité est relative au maximum observé plutôt qu'absolue : une touche
 * employée trois fois s'illumine pleinement si aucune ne dépasse trois, et
 * faiblement si une autre monte à dix.
 */
export function keyUsageMap(shortcuts: Shortcut[]): Map<string, KeyUsage> {
  const byKey = new Map<string, Shortcut[]>();

  for (const shortcut of shortcuts) {
    if (!shortcut.combo || shortcut.suspended) continue;

    for (const key of new Set(shortcut.combo.split(" ").filter(Boolean))) {
      const list = byKey.get(key);
      if (list) list.push(shortcut);
      else byKey.set(key, [shortcut]);
    }
  }

  const max = Math.max(1, ...Array.from(byKey.values(), list => list.length));

  const usage = new Map<string, KeyUsage>();
  for (const [key, list] of byKey) {
    usage.set(key, {
      count: list.length,
      intensity: list.length / max,
      shortcuts: list,
    });
  }
  return usage;
}
