import { useMemo, useState } from 'react';
import { ShortcutList } from './components/ShortcutList';
import { ShortcutModal } from './components/ShortcutModal';
import { MacDemo } from './components/MacDemo';
import { Modal } from './components/Modal';
import { Header } from './components/Header';
import { SearchPanel } from './components/SearchPanel';
import { ChangeLog } from './components/ChangeLog';
import { useShortcutCenter } from './lib/useShortcutCenter';
import { isModified } from './lib/shortcuts';
import type { ScopeFilter } from './components/types';
import type { ShortcutDraft, State } from './lib/types';

/** null = modale fermée ; '' = création ; sinon l'id du raccourci édité. */
type Editing = string | null;

export default function App() {
  const {
    state, conflicts, modifiedCount,
    createShortcut, updateShortcut, restoreShortcut, deleteShortcut,
    importState, resetAll, clearHistory,
  } = useShortcutCenter();

  const [scope, setScope] = useState<ScopeFilter>('all');
  const [search, setSearch] = useState('');
  const [onlyModified, setOnlyModified] = useState(false);
  const [onlyConflicts, setOnlyConflicts] = useState(false);
  const [editing, setEditing] = useState<Editing>(null);
  const [panelOpen, setPanelOpen] = useState(false);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return state.shortcuts.filter(s => {
      if (scope !== 'all' && s.scope !== scope) return false;
      if (onlyModified && !isModified(s)) return false;
      if (onlyConflicts && !conflicts.has(s.id)) return false;
      if (!q) return true;
      return [s.name, s.target, s.combo].join(' ').toLowerCase().includes(q);
    });
  }, [state.shortcuts, scope, search, onlyModified, onlyConflicts, conflicts]);

  function handleExport() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'shortcut-center.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleImport(file: File) {
    try {
      const parsed = JSON.parse(await file.text()) as State;
      if (!Array.isArray(parsed.shortcuts)) throw new Error('format');
      importState(parsed, file.name);
    } catch {
      alert('Fichier invalide : un export Shortcut Center est attendu.');
    }
  }

  function handleDelete(id: string) {
    const shortcut = state.shortcuts.find(s => s.id === id);
    if (shortcut && confirm(`Supprimer « ${shortcut.name} » ?`)) deleteShortcut(id);
  }

  function handleReset() {
    if (confirm('Réinitialiser tous les raccourcis et le journal ?')) resetAll();
  }

  function handleSubmit(draft: ShortcutDraft) {
    if (editing) updateShortcut(editing, draft);
    else createShortcut(draft);
    setEditing(null);
  }

  return (
    <>
      {/* <Header
        onNew={() => setEditing('')}
        onExport={handleExport}
        onImport={handleImport}
        onReset={handleReset}
      /> */}

      <MacDemo onOpen={() => setPanelOpen(true)}>
        <Modal
          open={panelOpen}
          onClose={() => setPanelOpen(false)}
          label="Centre de contrôle des raccourcis"
          className="max-w-[82%]"
          contained
        >
          <Header
            onNew={() => setEditing('')}
            onExport={handleExport}
            onImport={handleImport}
            onReset={handleReset}
          />

          <main className="grid grid-cols-1 items-start gap-4 p-4 xl:grid-cols-[230px_1fr_280px]">
            <SearchPanel
              shortcuts={state.shortcuts}
              scope={scope}
              search={search}
              modifiedCount={modifiedCount}
              conflictCount={conflicts.size}
              onScopeChange={setScope}
              onSearchChange={setSearch}
            />

            <ShortcutList
              shortcuts={visible}
              scope={scope}
              conflicts={conflicts}
              onlyModified={onlyModified}
              onlyConflicts={onlyConflicts}
              onOnlyModifiedChange={setOnlyModified}
              onOnlyConflictsChange={setOnlyConflicts}
              onEdit={setEditing}
              onRestore={restoreShortcut}
              onDelete={handleDelete}
            />

            <ChangeLog history={state.history} onClear={clearHistory} />
          </main>
        </Modal>
      </MacDemo>

      {editing !== null && (
        <ShortcutModal
          editing={editing ? state.shortcuts.find(s => s.id === editing) ?? null : null}
          shortcuts={state.shortcuts}
          currentScope={scope}
          onSubmit={handleSubmit}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}
