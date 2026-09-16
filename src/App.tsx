import { useMemo, useState } from "react";
import { ShortcutList } from "./components/ShortcutList";
import { ShortcutModal } from "./components/ShortcutModal";
import { MacDemo } from "./components/MacDemo";
import { Modal } from "./components/Modal";
import { Header } from "./components/Header";
import { SearchPanel } from "./components/SearchPanel";
import { ChangeLog } from "./components/ChangeLog";
import { useShortcutCenter } from "./lib/useShortcutCenter";
import { isModified } from "./lib/shortcuts";
import type { ScopeFilter } from "./components/types";
import type { ShortcutDraft, State } from "./lib/types";

/** null = modale fermée ; '' = création ; sinon l'id du raccourci édité. */
type Editing = string | null;

export default function App() {
  const {
    state,
    conflicts,
    modifiedCount,
    createShortcut,
    updateShortcut,
    restoreShortcut,
    deleteShortcut,
    toggleSuspended,
    sets,
    activeSetId,
    selectSet,
    createSet,
    duplicateSet,
    renameSet,
    deleteSet,
    importState,
    resetAll,
    clearHistory,
  } = useShortcutCenter();

  const [scope, setScope] = useState<ScopeFilter>("all");
  const [search, setSearch] = useState("");
  const [onlyModified, setOnlyModified] = useState(false);
  const [onlyConflicts, setOnlyConflicts] = useState(false);
  const [editing, setEditing] = useState<Editing>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return state.shortcuts.filter((s) => {
      if (scope !== "all" && s.scope !== scope) return false;
      if (onlyModified && !isModified(s)) return false;
      if (onlyConflicts && !conflicts.has(s.id)) return false;
      if (!q) return true;
      return [s.name, s.target, s.combo].join(" ").toLowerCase().includes(q);
    });
  }, [state.shortcuts, scope, search, onlyModified, onlyConflicts, conflicts]);

  function handleExport() {
    const blob = new Blob([JSON.stringify(state, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "shortcut-center.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleImport(file: File) {
    let parsed: State;
    try {
      parsed = JSON.parse(await file.text()) as State;
      if (!Array.isArray(parsed.shortcuts)) throw new Error("format");
    } catch {
      alert("Fichier invalide : un export Shortcut Center est attendu.");
      return;
    }

    // Deux usages légitimes : recevoir un jeu de plus, ou remplacer le sien.
    const asNewSet = confirm(
      `Importer « ${file.name} » comme nouveau jeu ?\n\n` +
        "OK : créer un jeu à partir de ce fichier.\n" +
        "Annuler : remplacer le contenu du jeu actif.",
    );

    if (asNewSet) {
      const name = file.name.replace(/\.json$/i, "");
      createSet(name, { shortcuts: parsed.shortcuts, history: parsed.history ?? [] });
      return;
    }

    importState(parsed, file.name);
  }

  function handleCreateSet() {
    const name = prompt("Nom du nouveau jeu ?", "Nouveau jeu");
    if (name?.trim()) createSet(name.trim());
  }

  function handleRenameSet(id: string) {
    const set = sets.find(s => s.id === id);
    if (!set) return;

    const name = prompt("Renommer le jeu", set.name);
    if (name?.trim()) renameSet(id, name.trim());
  }

  function handleDeleteSet(id: string) {
    const set = sets.find(s => s.id === id);
    if (set && confirm(`Supprimer le jeu « ${set.name} » et tous ses raccourcis ?`)) {
      deleteSet(id);
    }
  }

  function handleDelete(id: string) {
    const shortcut = state.shortcuts.find((s) => s.id === id);
    if (shortcut && confirm(`Supprimer « ${shortcut.name} » ?`))
      deleteShortcut(id);
  }

  function handleReset() {
    if (confirm("Réinitialiser tous les raccourcis et le journal ?"))
      resetAll();
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
          className="max-w-[70%]"
          contained
        >
          <Header
            sets={sets}
            activeSetId={activeSetId}
            onSelectSet={selectSet}
            onCreateSet={handleCreateSet}
            onDuplicateSet={duplicateSet}
            onRenameSet={handleRenameSet}
            onDeleteSet={handleDeleteSet}
            search={search}
            onSearchChange={setSearch}
            onNew={() => setEditing("")}
            onToggleHistory={() => setHistoryOpen((o) => !o)}
            historyOpen={historyOpen}
            onExport={handleExport}
            onImport={handleImport}
            onReset={handleReset}
          />

          {/* La modale est en flex-col : le header garde sa taille, ce bloc
              prend la hauteur restante. Les colonnes s'y tiennent en pleine
              hauteur (items-stretch), et seule la liste défile. */}
          <main
            className={`grid min-h-0 flex-1 grid-cols-1 gap-8 overflow-hidden px-4 pb-4
              ${historyOpen ? "xl:grid-cols-[230px_1fr_280px]" : "xl:grid-cols-[230px_1fr]"}`}
          >
            <SearchPanel
              shortcuts={state.shortcuts}
              scope={scope}
              modifiedCount={modifiedCount}
              conflictCount={conflicts.size}
              onScopeChange={setScope}
              onlyModified={onlyModified}
              onlyConflicts={onlyConflicts}
              onOnlyModifiedChange={setOnlyModified}
              onOnlyConflictsChange={setOnlyConflicts}
            />

            <ShortcutList
              shortcuts={visible}
              scope={scope}
              conflicts={conflicts}
              onEdit={setEditing}
              onRestore={restoreShortcut}
              onDelete={handleDelete}
              onToggleSuspended={toggleSuspended}
            />

            {historyOpen && (
              <ChangeLog history={state.history} onClear={clearHistory} />
            )}
          </main>
        </Modal>
      </MacDemo>

      {editing !== null && (
        <ShortcutModal
          editing={
            editing
              ? (state.shortcuts.find((s) => s.id === editing) ?? null)
              : null
          }
          shortcuts={state.shortcuts}
          currentScope={scope}
          onSubmit={handleSubmit}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}
