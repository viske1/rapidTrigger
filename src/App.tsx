import { useMemo, useState } from "react";
import { ShortcutList } from "./components/ShortcutList";
import { ShortcutModal } from "./components/ShortcutModal";
import { MacDemo } from "./components/MacDemo";
import { Modal } from "./components/Modal";
import { MacKeyboard } from "./components/MacKeyboard";
import { SetNameModal } from "./components/SetNameModal";
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
  /** Combinaison de la ligne survolée, mise en avant sur le clavier. */
  const [hoveredCombo, setHoveredCombo] = useState<string | null>(null);

  /** Jeu en cours de nommage : création, ou renommage d'un jeu existant. */
  const [setNaming, setSetNaming] = useState<
    { mode: "create" } | { mode: "rename"; id: string; name: string } | null
  >(null);

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

  function handleSetNameSubmit(name: string) {
    if (!setNaming) return;

    if (setNaming.mode === "create") createSet(name);
    else renameSet(setNaming.id, name);

    setSetNaming(null);
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
          className="max-w-[82%]"
          contained
        >
          <Header
            sets={sets}
            activeSetId={activeSetId}
            onSelectSet={selectSet}
            onCreateSet={() => setSetNaming({ mode: "create" })}
            onDuplicateSet={duplicateSet}
            onRenameSet={id => {
              const set = sets.find(s => s.id === id);
              if (set) setSetNaming({ mode: "rename", id, name: set.name });
            }}
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
              onHover={setHoveredCombo}
            />

            {historyOpen && (
              <ChangeLog history={state.history} onClear={clearHistory} />
            )}
          </main>

          {/*
            Clavier de synthèse : chaque touche s'éclaire à proportion de son
            emploi dans le jeu, et passe en pleine lumière quand on survole
            une ligne de la liste.
          */}
          <div className="shrink-0 px-4 pb-4">
            <MacKeyboard
              shortcuts={state.shortcuts}
              highlight={hoveredCombo ?? ""}
              interactive
              onSelect={setEditing}
            />
          </div>

          <ShortcutModal
            open={editing !== null}
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

          <SetNameModal
            open={setNaming !== null}
            mode={setNaming?.mode ?? "create"}
            initialName={setNaming?.mode === "rename" ? setNaming.name : ""}
            onSubmit={handleSetNameSubmit}
            onClose={() => setSetNaming(null)}
          />
        </Modal>
      </MacDemo>

    </>
  );
}
