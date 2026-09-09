import { initialState } from './data';
import type { State } from './types';

const KEY = 'shortcut-center-v1';

export function loadState(): State {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as State;
      if (parsed && Array.isArray(parsed.shortcuts)) return parsed;
    }
  } catch { /* stockage indisponible ou corrompu : on repart des défauts */ }
  return initialState();
}

export function saveState(state: State): void {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* quota ou mode privé */ }
}
