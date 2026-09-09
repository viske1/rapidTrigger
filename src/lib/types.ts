export type ShortcutType = 'app' | 'folder' | 'file' | 'url' | 'script' | 'system';
export type ScopeId = 'system' | 'finder' | 'apps' | 'web' | 'scripts';

export interface Shortcut {
  id: string;
  name: string;
  target: string;
  type: ShortcutType;
  scope: ScopeId;
  combo: string;
  defaultCombo: string;
  custom: boolean;
}

export interface HistoryEntry {
  action: string;
  detail: string;
  at: number;
}

export interface State {
  shortcuts: Shortcut[];
  history: HistoryEntry[];
}

/** Champs éditables via le formulaire, sans les métadonnées gérées par l'app. */
export type ShortcutDraft = Pick<Shortcut, 'name' | 'target' | 'type' | 'scope' | 'combo'>;

export interface Scope {
  id: ScopeId;
  label: string;
  sub: string;
}
