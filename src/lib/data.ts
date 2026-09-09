import type { Scope, Shortcut, ShortcutType, State } from './types';

export const SCOPES: Scope[] = [
  { id: 'system',  label: 'Système',      sub: 'Raccourcis globaux macOS' },
  { id: 'finder',  label: 'Finder',       sub: 'Fichiers et dossiers' },
  { id: 'apps',    label: 'Applications', sub: 'Lancement d’apps' },
  { id: 'web',     label: 'Web',          sub: 'URLs et signets' },
  { id: 'scripts', label: 'Scripts',      sub: 'Automatisations' },
];

export const TYPE_LABEL: Record<ShortcutType, string> = {
  app: 'App', folder: 'Dossier', file: 'Fichier',
  url: 'URL', script: 'Script', system: 'Système',
};

type DefaultShortcut = Omit<Shortcut, 'defaultCombo' | 'custom'>;

const DEFAULTS: DefaultShortcut[] = [
  { id:'s1', name:'Ouvrir Spotlight',          target:'Spotlight',            type:'system', scope:'system',  combo:'⌘ Espace' },
  { id:'s2', name:'Basculer entre apps',       target:'App Switcher',         type:'system', scope:'system',  combo:'⌘ Tab' },
  { id:'s3', name:'Capture d’écran',           target:'Screenshot',           type:'system', scope:'system',  combo:'⌘ ⇧ 4' },
  { id:'f1', name:'Ouvrir le dossier Projets', target:'~/git',                type:'folder', scope:'finder',  combo:'⌘ ⌥ P' },
  { id:'f2', name:'Ouvrir Téléchargements',    target:'~/Downloads',          type:'folder', scope:'finder',  combo:'⌘ ⌥ D' },
  { id:'f3', name:'Notes de travail',          target:'~/Documents/notes.md', type:'file',   scope:'finder',  combo:'' },
  { id:'a1', name:'Lancer Terminal',           target:'/Applications/Utilities/Terminal.app', type:'app', scope:'apps', combo:'⌘ ⌥ T' },
  { id:'a2', name:'Lancer VS Code',            target:'/Applications/Visual Studio Code.app', type:'app', scope:'apps', combo:'⌘ ⌥ C' },
  { id:'a3', name:'Lancer Slack',              target:'/Applications/Slack.app', type:'app', scope:'apps',    combo:'' },
  { id:'w1', name:'Ouvrir GitHub',             target:'https://github.com',   type:'url',    scope:'web',     combo:'⌘ ⌥ G' },
  { id:'w2', name:'Tableau de bord interne',   target:'https://dashboard.local', type:'url', scope:'web',     combo:'' },
  { id:'x1', name:'Nettoyer le cache',         target:'~/bin/clean-cache.sh', type:'script', scope:'scripts', combo:'⌘ ⌥ ⇧ N' },
  { id:'x2', name:'Sauvegarde rapide',         target:'~/bin/backup.sh',      type:'script', scope:'scripts', combo:'' },
];

export function initialState(): State {
  return {
    shortcuts: DEFAULTS.map(s => ({ ...s, defaultCombo: s.combo, custom: false })),
    history: [],
  };
}
