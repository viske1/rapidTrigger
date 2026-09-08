/* Shortcut Center — démo web du centre de contrôle des raccourcis macOS. */

const SCOPES = [
  { id: 'system',  label: 'Système',       sub: 'Raccourcis globaux macOS' },
  { id: 'finder',  label: 'Finder',        sub: 'Fichiers et dossiers' },
  { id: 'apps',    label: 'Applications',  sub: 'Lancement d’apps' },
  { id: 'web',     label: 'Web',           sub: 'URLs et signets' },
  { id: 'scripts', label: 'Scripts',       sub: 'Automatisations' },
];

const DEFAULTS = [
  { id:'s1', name:'Ouvrir Spotlight',        target:'Spotlight',                 type:'system', scope:'system',  combo:'⌘ Espace' },
  { id:'s2', name:'Basculer entre apps',     target:'App Switcher',              type:'system', scope:'system',  combo:'⌘ Tab' },
  { id:'s3', name:'Capture d’écran',    target:'Screenshot',                type:'system', scope:'system',  combo:'⌘ ⇧ 4' },
  { id:'f1', name:'Ouvrir le dossier Projets', target:'~/git',                   type:'folder', scope:'finder',  combo:'⌘ ⌥ P' },
  { id:'f2', name:'Ouvrir Téléchargements',  target:'~/Downloads',               type:'folder', scope:'finder',  combo:'⌘ ⌥ D' },
  { id:'f3', name:'Notes de travail',        target:'~/Documents/notes.md',      type:'file',   scope:'finder',  combo:'' },
  { id:'a1', name:'Lancer Terminal',         target:'/Applications/Utilities/Terminal.app', type:'app', scope:'apps', combo:'⌘ ⌥ T' },
  { id:'a2', name:'Lancer VS Code',          target:'/Applications/Visual Studio Code.app', type:'app', scope:'apps', combo:'⌘ ⌥ C' },
  { id:'a3', name:'Lancer Slack',            target:'/Applications/Slack.app',   type:'app',    scope:'apps',    combo:'' },
  { id:'w1', name:'Ouvrir GitHub',           target:'https://github.com',        type:'url',    scope:'web',     combo:'⌘ ⌥ G' },
  { id:'w2', name:'Tableau de bord interne', target:'https://dashboard.local',   type:'url',    scope:'web',     combo:'' },
  { id:'x1', name:'Nettoyer le cache',       target:'~/bin/clean-cache.sh',      type:'script', scope:'scripts', combo:'⌘ ⌥ ⇧ N' },
  { id:'x2', name:'Sauvegarde rapide',       target:'~/bin/backup.sh',           type:'script', scope:'scripts', combo:'' },
];

const KEY = 'shortcut-center-v1';
const TYPE_LABEL = { app:'App', folder:'Dossier', file:'Fichier', url:'URL', script:'Script', system:'Système' };

let state = load();
let ui = { scope:'all', search:'', onlyModified:false, onlyConflicts:false, editingId:null };

function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY));
    if (raw && Array.isArray(raw.shortcuts)) return raw;
  } catch (_) { /* stockage indisponible ou corrompu : on repart des défauts */ }
  return { shortcuts: DEFAULTS.map(s => ({ ...s, defaultCombo: s.combo, custom: false })), history: [] };
}

function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (_) {}
}

function log(action, detail) {
  state.history.unshift({ action, detail, at: Date.now() });
  state.history = state.history.slice(0, 60);
}

/* ---------- Capture clavier ---------- */

const MOD_ORDER = ['⌃', '⌥', '⇧', '⌘'];
const NAMED_KEYS = {
  ' ':'Espace', 'Escape':'Esc', 'ArrowUp':'↑', 'ArrowDown':'↓', 'ArrowLeft':'←',
  'ArrowRight':'→', 'Enter':'↩', 'Tab':'Tab', 'Backspace':'⌫', 'Delete':'⌦',
};

function comboFromEvent(e) {
  const mods = [];
  if (e.ctrlKey) mods.push('⌃');
  if (e.altKey) mods.push('⌥');
  if (e.shiftKey) mods.push('⇧');
  if (e.metaKey) mods.push('⌘');
  let key = e.key;
  if (['Control', 'Alt', 'Shift', 'Meta'].includes(key)) return null; // modificateur seul
  key = NAMED_KEYS[key] || (key.length === 1 ? key.toUpperCase() : key);
  mods.sort((a, b) => MOD_ORDER.indexOf(a) - MOD_ORDER.indexOf(b));
  return [...mods, key].join(' ');
}

/* ---------- Conflits ---------- */

function conflictMap() {
  const byCombo = {};
  for (const s of state.shortcuts) {
    if (!s.combo) continue;
    (byCombo[s.combo] ||= []).push(s.id);
  }
  const conflicted = new Set();
  for (const ids of Object.values(byCombo)) {
    if (ids.length > 1) ids.forEach(id => conflicted.add(id));
  }
  return conflicted;
}

const isModified = s => s.combo !== (s.defaultCombo ?? '');

/* ---------- Rendu ---------- */

const $ = sel => document.querySelector(sel);

function visibleShortcuts(conflicts) {
  const q = ui.search.trim().toLowerCase();
  return state.shortcuts.filter(s => {
    if (ui.scope !== 'all' && s.scope !== ui.scope) return false;
    if (ui.onlyModified && !isModified(s)) return false;
    if (ui.onlyConflicts && !conflicts.has(s.id)) return false;
    if (!q) return true;
    return [s.name, s.target, s.combo].join(' ').toLowerCase().includes(q);
  });
}

function render() {
  const conflicts = conflictMap();
  renderScopes(conflicts);
  renderList(conflicts);
  renderHistory();
  $('#stat-total').textContent = state.shortcuts.length;
  $('#stat-modified').textContent = state.shortcuts.filter(isModified).length;
  $('#stat-conflicts').textContent = conflicts.size;

  const banner = $('#conflict-banner');
  banner.classList.toggle('hidden', conflicts.size === 0);
  if (conflicts.size) {
    banner.textContent = `⚠︎ ${conflicts.size} raccourcis partagent une même combinaison. Modifiez-en un pour lever le conflit.`;
  }
}

function renderScopes(conflicts) {
  const all = [{ id:'all', label:'Tous les raccourcis', sub:'Vue complète' }, ...SCOPES];
  $('#scopes').innerHTML = all.map(sc => {
    const n = sc.id === 'all' ? state.shortcuts.length
                              : state.shortcuts.filter(s => s.scope === sc.id).length;
    return `<button class="scope-btn ${ui.scope === sc.id ? 'active' : ''}" data-scope="${sc.id}">
      <span>${sc.label}</span><span class="count">${n}</span></button>`;
  }).join('');
  const cur = all.find(s => s.id === ui.scope);
  $('#scope-title').textContent = cur.label;
  $('#scope-sub').textContent = cur.sub;
}

function comboHtml(combo) {
  if (!combo) return '<span class="combo empty"><kbd>non assigné</kbd></span>';
  return `<span class="combo">${combo.split(' ').map(k => `<kbd>${esc(k)}</kbd>`).join('')}</span>`;
}

function renderList(conflicts) {
  const items = visibleShortcuts(conflicts);
  $('#empty').classList.toggle('hidden', items.length > 0);
  $('#list').innerHTML = items.map(s => {
    const mod = isModified(s), conf = conflicts.has(s.id);
    return `<div class="row ${conf ? 'conflict' : ''} ${mod ? 'modified' : ''}">
      <div class="row-main">
        <div class="row-name">${esc(s.name)}
          <span class="tag">${TYPE_LABEL[s.type] || s.type}</span>
          ${s.custom ? '<span class="tag custom">perso</span>' : ''}
          ${mod ? '<span class="tag modified">modifié</span>' : ''}
          ${conf ? '<span class="tag conflict">conflit</span>' : ''}
        </div>
        <div class="row-target" title="${esc(s.target)}">${esc(s.target)}</div>
      </div>
      ${comboHtml(s.combo)}
      <div class="row-actions">
        <button class="btn tiny" data-edit="${s.id}">Modifier</button>
        ${mod ? `<button class="btn tiny" data-restore="${s.id}">Rétablir</button>` : ''}
        <button class="btn tiny danger-ghost" data-delete="${s.id}">Suppr.</button>
      </div>
    </div>`;
  }).join('');
}

function renderHistory() {
  const list = $('#history-list');
  if (!state.history.length) {
    list.innerHTML = '<li class="none">Aucune modification pour l’instant.</li>';
    return;
  }
  list.innerHTML = state.history.map(h =>
    `<li><strong>${esc(h.action)}</strong> — ${esc(h.detail)}
      <span class="when">${new Date(h.at).toLocaleString('fr-FR')}</span></li>`
  ).join('');
}

function esc(str) {
  return String(str).replace(/[&<>"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]));
}

/* ---------- Modale ---------- */

function openModal(id) {
  ui.editingId = id;
  const s = id ? state.shortcuts.find(x => x.id === id) : null;
  const form = $('#form');
  $('#modal-title').textContent = s ? 'Modifier le raccourci' : 'Nouveau raccourci';
  form.scope.innerHTML = SCOPES.map(sc => `<option value="${sc.id}">${sc.label}</option>`).join('');
  form.name.value = s ? s.name : '';
  form.target.value = s ? s.target : '';
  form.type.value = s ? s.type : 'app';
  form.scope.value = s ? s.scope : (ui.scope !== 'all' ? ui.scope : 'apps');
  form.combo.value = s ? s.combo : '';
  setHint('Astuce : cliquez dans le champ et appuyez sur la combinaison souhaitée (ex. ⌘⌥K).', false);
  $('#modal').classList.remove('hidden');
  form.name.focus();
}

function closeModal() {
  ui.editingId = null;
  $('#modal').classList.add('hidden');
}

function setHint(text, isError) {
  const h = $('#combo-hint');
  h.textContent = text;
  h.classList.toggle('error', !!isError);
}

/* ---------- Évènements ---------- */

$('#scopes').addEventListener('click', e => {
  const btn = e.target.closest('[data-scope]');
  if (!btn) return;
  ui.scope = btn.dataset.scope;
  render();
});

$('#search').addEventListener('input', e => { ui.search = e.target.value; render(); });
$('#only-modified').addEventListener('change', e => { ui.onlyModified = e.target.checked; render(); });
$('#only-conflicts').addEventListener('change', e => { ui.onlyConflicts = e.target.checked; render(); });

$('#list').addEventListener('click', e => {
  const btn = e.target.closest('button');
  if (!btn) return;
  const { edit, restore, delete: del } = btn.dataset;
  if (edit) return openModal(edit);
  if (restore) {
    const s = state.shortcuts.find(x => x.id === restore);
    log('Rétabli', `${s.name} : ${s.combo || 'non assigné'} → ${s.defaultCombo || 'non assigné'}`);
    s.combo = s.defaultCombo ?? '';
    save(); render();
  }
  if (del) {
    const s = state.shortcuts.find(x => x.id === del);
    if (!confirm(`Supprimer « ${s.name} » ?`)) return;
    state.shortcuts = state.shortcuts.filter(x => x.id !== del);
    log('Supprimé', s.name);
    save(); render();
  }
});

$('#btn-new').addEventListener('click', () => openModal(null));
$('#btn-cancel').addEventListener('click', closeModal);
$('#modal').addEventListener('click', e => { if (e.target.id === 'modal') closeModal(); });

const capture = $('#combo-capture');
capture.addEventListener('keydown', e => {
  e.preventDefault();
  if (e.key === 'Escape') { capture.value = ''; setHint('Combinaison effacée — le raccourci sera non assigné.', false); return; }
  const combo = comboFromEvent(e);
  if (!combo) { setHint('Continuez : ajoutez une touche à ce ou ces modificateurs.', false); return; }
  capture.value = combo;
  const clash = state.shortcuts.find(s => s.combo === combo && s.id !== ui.editingId);
  setHint(clash ? `⚠︎ Déjà utilisé par « ${clash.name} ». Vous pouvez enregistrer, le conflit sera signalé.`
                : 'Combinaison libre.', !!clash);
});

$('#form').addEventListener('submit', e => {
  e.preventDefault();
  const f = e.target;
  const data = {
    name: f.name.value.trim(), target: f.target.value.trim(),
    type: f.type.value, scope: f.scope.value, combo: f.combo.value.trim(),
  };
  if (ui.editingId) {
    const s = state.shortcuts.find(x => x.id === ui.editingId);
    if (s.combo !== data.combo) {
      log('Raccourci changé', `${data.name} : ${s.combo || 'non assigné'} → ${data.combo || 'non assigné'}`);
    } else {
      log('Modifié', data.name);
    }
    Object.assign(s, data);
  } else {
    state.shortcuts.push({ id: 'c' + Date.now(), ...data, defaultCombo: '', custom: true });
    log('Créé', `${data.name} → ${data.combo || 'non assigné'}`);
  }
  save(); closeModal(); render();
});

$('#btn-export').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'shortcut-center.json';
  a.click();
  URL.revokeObjectURL(a.href);
});

$('#btn-import').addEventListener('click', () => $('#file-import').click());
$('#file-import').addEventListener('change', async e => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const parsed = JSON.parse(await file.text());
    if (!Array.isArray(parsed.shortcuts)) throw new Error('format');
    state = { shortcuts: parsed.shortcuts, history: parsed.history || [] };
    log('Importé', `${state.shortcuts.length} raccourcis depuis ${file.name}`);
    save(); render();
  } catch (_) {
    alert('Fichier invalide : un export Shortcut Center est attendu.');
  }
  e.target.value = '';
});

$('#btn-reset').addEventListener('click', () => {
  if (!confirm('Réinitialiser tous les raccourcis et le journal ?')) return;
  state = { shortcuts: DEFAULTS.map(s => ({ ...s, defaultCombo: s.combo, custom: false })), history: [] };
  save(); render();
});

$('#btn-clear-history').addEventListener('click', () => {
  state.history = [];
  save(); renderHistory();
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !$('#modal').classList.contains('hidden') && document.activeElement !== capture) closeModal();
});

render();
