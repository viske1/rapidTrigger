import { useMemo } from 'react';
import { SCOPES } from '../lib/data';
import type { Shortcut } from '../lib/types';
import type { ScopeFilter } from './types';

interface SearchPanelProps {
  shortcuts: Shortcut[];
  scope: ScopeFilter;
  search: string;
  modifiedCount: number;
  conflictCount: number;
  onScopeChange: (scope: ScopeFilter) => void;
  onSearchChange: (search: string) => void;
}

/** Bloc de gauche : recherche plein texte, navigation par portée et compteurs. */
export function SearchPanel({
  shortcuts, scope, search, modifiedCount, conflictCount,
  onScopeChange, onSearchChange,
}: SearchPanelProps) {
  const countByScope = useMemo(() => {
    const counts = new Map<string, number>();
    for (const s of shortcuts) counts.set(s.scope, (counts.get(s.scope) ?? 0) + 1);
    return counts;
  }, [shortcuts]);

  const entries: { id: ScopeFilter; label: string; count: number }[] = [
    { id: 'all', label: 'Tous les raccourcis', count: shortcuts.length },
    ...SCOPES.map(s => ({
      id: s.id as ScopeFilter,
      label: s.label,
      count: countByScope.get(s.id) ?? 0,
    })),
  ];

  const stats = [
    { value: shortcuts.length, label: 'raccourcis' },
    { value: modifiedCount, label: 'modifiés' },
    { value: conflictCount, label: 'conflits' },
  ];

  return (
    <aside className="panel">
      <input
        type="search"
        value={search}
        placeholder="Rechercher un raccourci, une action…"
        aria-label="Rechercher un raccourci"
        onChange={e => onSearchChange(e.target.value)}
        className="w-full rounded-lg border border-line bg-panel2 px-2.5 py-2 font-sans
          text-[13px] text-content outline-none focus:border-accent
          dark:border-line-dark dark:bg-panel2-dark dark:text-content-dark"
      />

      <nav aria-label="Portées" className="my-3 flex flex-col gap-0.5">
        {entries.map(entry => {
          const active = scope === entry.id;
          return (
            <button
              key={entry.id}
              type="button"
              aria-current={active ? 'true' : undefined}
              onClick={() => onScopeChange(entry.id)}
              className={`flex w-full cursor-pointer items-center justify-between gap-2
                rounded-[7px] border-none px-2.5 py-[7px] text-left font-sans text-[13px]
                ${active
                  ? 'bg-accent-strong text-white'
                  : 'bg-transparent text-content hover:bg-panel2 dark:text-content-dark dark:hover:bg-panel2-dark'}`}
            >
              <span>{entry.label}</span>
              <span className="text-[11px] opacity-70">{entry.count}</span>
            </button>
          );
        })}
      </nav>

      <div className="flex gap-2 border-t border-line pt-3 dark:border-line-dark">
        {stats.map(stat => (
          <div key={stat.label} className="flex-1 text-center">
            <strong className="block text-lg">{stat.value}</strong>
            <span className="text-[11px] text-muted dark:text-muted-dark">{stat.label}</span>
          </div>
        ))}
      </div>
    </aside>
  );
}
