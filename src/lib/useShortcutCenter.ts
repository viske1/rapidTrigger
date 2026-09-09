import { useCallback, useEffect, useMemo, useState } from 'react';
import { initialState } from './data';
import { loadState, saveState } from './storage';
import { conflictSet, isModified } from './shortcuts';
import type { HistoryEntry, Shortcut, ShortcutDraft, State } from './types';

const HISTORY_LIMIT = 60;

function withLog(state: State, action: string, detail: string, shortcuts: Shortcut[]): State {
  const entry: HistoryEntry = { action, detail, at: Date.now() };
  return {
    shortcuts,
    history: [entry, ...state.history].slice(0, HISTORY_LIMIT),
  };
}

export function useShortcutCenter() {
  const [state, setState] = useState<State>(loadState);

  useEffect(() => { saveState(state); }, [state]);

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

  const resetAll = useCallback(() => setState(initialState()), []);

  const clearHistory = useCallback(() => {
    setState(prev => ({ ...prev, history: [] }));
  }, []);

  return {
    state, conflicts, modifiedCount,
    createShortcut, updateShortcut, restoreShortcut, deleteShortcut,
    importState, resetAll, clearHistory,
  };
}
