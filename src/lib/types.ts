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
  /** Suspendu : le raccourci reste listé mais ne se déclenche plus. */
  suspended?: boolean;
}

export interface HistoryEntry {
  action: string;
  detail: string;
  at: number;
}

/** Un jeu de raccourcis : ses entrées et son journal. */
export interface State {
  shortcuts: Shortcut[];
  history: HistoryEntry[];
}

/** Jeu nommé, tel qu'il apparaît dans le sélecteur. */
export interface ShortcutSet extends State {
  id: string;
  name: string;
  /** Ligne secondaire du sélecteur, ex. « 13 raccourcis ». */
  subtitle?: string;
}

/** Contenu complet du stockage : tous les jeux et celui qui est actif. */
export interface Library {
  sets: ShortcutSet[];
  activeId: string;
}

/** Champs éditables via le formulaire, sans les métadonnées gérées par l'app. */
export type ShortcutDraft = Pick<Shortcut, 'name' | 'target' | 'type' | 'scope' | 'combo'>;

export interface Scope {
  id: ScopeId;
  label: string;
  sub: string;
}
