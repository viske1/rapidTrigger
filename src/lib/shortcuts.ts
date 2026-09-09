import type { Shortcut } from './types';

/** Ids des raccourcis partageant leur combinaison avec au moins un autre. */
export function conflictSet(shortcuts: Shortcut[]): Set<string> {
  const byCombo = new Map<string, string[]>();
  for (const s of shortcuts) {
    if (!s.combo) continue;
    const ids = byCombo.get(s.combo);
    if (ids) ids.push(s.id);
    else byCombo.set(s.combo, [s.id]);
  }

  const conflicted = new Set<string>();
  for (const ids of byCombo.values()) {
    if (ids.length > 1) ids.forEach(id => conflicted.add(id));
  }
  return conflicted;
}

export const isModified = (s: Shortcut): boolean => s.combo !== (s.defaultCombo ?? '');
