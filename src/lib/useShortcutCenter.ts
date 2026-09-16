import { useCallback, useEffect, useMemo, useState } from 'react';
import { initialState } from './data';
import { createSet, loadLibrary, saveLibrary } from './storage';
import { conflictSet, isModified } from './shortcuts';
import type { HistoryEntry, Library, Shortcut, ShortcutDraft, State } from './types';

const HISTORY_LIMIT = 60;

function withLog(state: State, action: string, detail: string, shortcuts: Shortcut[]): State {
  const entry: HistoryEntry = { action, detail, at: Date.now() };
  return {
    shortcuts,
    history: [entry, ...state.history].slice(0, HISTORY_LIMIT),
  };
}

export function useShortcutCenter() {
  const [library, setLibrary] = useState<Library>(loadLibrary);

  useEffect(() => { saveLibrary(library); }, [library]);

  const state: State = useMemo(() => {
    const active = library.sets.find(s => s.id === library.activeId);
    return active ?? library.sets[0];
  }, [library]);

  /*
   * Toutes les mutations ci-dessous raisonnent sur un seul jeu : cette
   * fonction applique leur transformation au jeu actif et laisse le reste
   * de la bibliothèque inchangé.
   */
  const setState = useCallback((update: (prev: State) => State) => {
    setLibrary(prev => ({
      ...prev,
      sets: prev.sets.map(set =>
        set.id === prev.activeId ? { ...set, ...update(set) } : set,
      ),
    }));
  }, []);

  const conflicts = useMemo(() => conflictSet(state.shortcuts), [state.shortcuts]);
  const modifiedCount = useMemo(
    () => state.shortcuts.filter(isModified).length,
    [state.shortcuts],
  );

  const createShortcut = useCallback((draft: ShortcutDraft) => {
    setState(prev => {
      const shortcut: Shortcut = { id: 'c' + Date.now(), ...draft, defaultCombo: '', custom: true };
      return withLog(
        prev,
        'Créé',
        `${draft.name} → ${draft.combo || 'non assigné'}`,
        [...prev.shortcuts, shortcut],
      );
    });
  }, []);

  const updateShortcut = useCallback((id: string, draft: ShortcutDraft) => {
    setState(prev => {
      const current = prev.shortcuts.find(s => s.id === id);
      if (!current) return prev;

      const shortcuts = prev.shortcuts.map(s => (s.id === id ? { ...s, ...draft } : s));
      return current.combo !== draft.combo
        ? withLog(prev, 'Raccourci changé',
            `${draft.name} : ${current.combo || 'non assigné'} → ${draft.combo || 'non assigné'}`,
            shortcuts)
        : withLog(prev, 'Modifié', draft.name, shortcuts);
    });
  }, []);

  const restoreShortcut = useCallback((id: string) => {
    setState(prev => {
      const current = prev.shortcuts.find(s => s.id === id);
      if (!current) return prev;

      const defaultCombo = current.defaultCombo ?? '';
      return withLog(
        prev,
        'Rétabli',
        `${current.name} : ${current.combo || 'non assigné'} → ${defaultCombo || 'non assigné'}`,
        prev.shortcuts.map(s => (s.id === id ? { ...s, combo: defaultCombo } : s)),
      );
    });
  }, []);

  const toggleSuspended = useCallback((id: string) => {
    setState(prev => {
      const current = prev.shortcuts.find(s => s.id === id);
      if (!current) return prev;

      const suspended = !current.suspended;
      return withLog(
        prev,
        suspended ? 'Suspendu' : 'Repris',
        current.name,
        prev.shortcuts.map(s => (s.id === id ? { ...s, suspended } : s)),
      );
    });
  }, []);

  const deleteShortcut = useCallback((id: string) => {
    setState(prev => {
      const current = prev.shortcuts.find(s => s.id === id);
      if (!current) return prev;
      return withLog(prev, 'Supprimé', current.name, prev.shortcuts.filter(s => s.id !== id));
    });
  }, []);

  const importState = useCallback((imported: State, fileName: string) => {
    setState(() => withLog(
      { shortcuts: imported.shortcuts, history: imported.history ?? [] },
      'Importé',
      `${imported.shortcuts.length} raccourcis depuis ${fileName}`,
      imported.shortcuts,
    ));
  }, []);

  const resetAll = useCallback(() => setState(() => initialState()), [setState]);

  /* ---------- Jeux de raccourcis ---------- */

  const selectSet = useCallback((id: string) => {
    setLibrary(prev =>
      prev.sets.some(s => s.id === id) ? { ...prev, activeId: id } : prev,
    );
  }, []);

  const createSetNamed = useCallback((name: string, base?: State) => {
    const set = createSet(name, base);
    setLibrary(prev => ({ sets: [...prev.sets, set], activeId: set.id }));
    return set.id;
  }, []);

  const duplicateSet = useCallback((id: string) => {
    setLibrary(prev => {
      const source = prev.sets.find(s => s.id === id);
      if (!source) return prev;

      const copy = createSet(`${source.name} (copie)`, {
        shortcuts: source.shortcuts,
        history: source.history,
      });
      return { sets: [...prev.sets, copy], activeId: copy.id };
    });
  }, []);

  const renameSet = useCallback((id: string, name: string) => {
    setLibrary(prev => ({
      ...prev,
      sets: prev.sets.map(s => (s.id === id ? { ...s, name } : s)),
    }));
  }, []);

  const deleteSet = useCallback((id: string) => {
    setLibrary(prev => {
      // Le dernier jeu ne peut pas être supprimé : l'application resterait vide.
      if (prev.sets.length <= 1) return prev;

      const sets = prev.sets.filter(s => s.id !== id);
      return {
        sets,
        activeId: prev.activeId === id ? sets[0].id : prev.activeId,
      };
    });
  }, []);

  const clearHistory = useCallback(() => {
    setState(prev => ({ ...prev, history: [] }));
  }, []);

  return {
    state, conflicts, modifiedCount,
    createShortcut, updateShortcut, restoreShortcut, deleteShortcut, toggleSuspended,
    sets: library.sets, activeSetId: library.activeId,
    selectSet, createSet: createSetNamed, duplicateSet, renameSet, deleteSet,
    importState, resetAll, clearHistory,
  };
}
