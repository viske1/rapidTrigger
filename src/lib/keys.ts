import type { KeyboardEvent as ReactKeyboardEvent } from 'react';

const MOD_ORDER = ['⌃', '⌥', '⇧', '⌘'];

const NAMED_KEYS: Record<string, string> = {
  ' ': 'Espace', 'Escape': 'Esc', 'ArrowUp': '↑', 'ArrowDown': '↓', 'ArrowLeft': '←',
  'ArrowRight': '→', 'Enter': '↩', 'Tab': 'Tab', 'Backspace': '⌫', 'Delete': '⌦',
};

const MODIFIER_KEYS = ['Control', 'Alt', 'Shift', 'Meta'];

/** Rend la combinaison telle qu'elle a été tapée, ou null si seuls des modificateurs sont enfoncés. */
export function comboFromEvent(e: ReactKeyboardEvent | KeyboardEvent): string | null {
  if (MODIFIER_KEYS.includes(e.key)) return null;

  const mods: string[] = [];
  if (e.ctrlKey) mods.push('⌃');
  if (e.altKey) mods.push('⌥');
  if (e.shiftKey) mods.push('⇧');
  if (e.metaKey) mods.push('⌘');
  mods.sort((a, b) => MOD_ORDER.indexOf(a) - MOD_ORDER.indexOf(b));

  const key = NAMED_KEYS[e.key] ?? (e.key.length === 1 ? e.key.toUpperCase() : e.key);
  return [...mods, key].join(' ');
}
