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

/**
 * Bloc de gauche : recherche plein texte, navigation par portée et compteurs.
 * Remplace Sidebar — les compteurs par portée sont calculés en une passe.
 */
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

  return (
    <aside className="search-panel">
      <div className="search-wrap">
        <input
          type="search"
          value={search}
          placeholder="Rechercher un raccourci, une action…"
          aria-label="Rechercher un raccourci"
          onChange={e => onSearchChange(e.target.value)}
        />
      </div>

      <nav className="scopes" aria-label="Portées">
        {entries.map(entry => (
          <button
            key={entry.id}
            type="button"
            className={`scope-btn ${scope === entry.id ? 'active' : ''}`}
            aria-current={scope === entry.id ? 'true' : undefined}
            onClick={() => onScopeChange(entry.id)}
          >
            <span>{entry.label}</span>
            <span className="count">{entry.count}</span>
          </button>
        ))}
      </nav>

      <div className="search-panel-stats">
        <div className="stat">
          <strong>{shortcuts.length}</strong><span>raccourcis</span>
        </div>
        <div className="stat">
          <strong>{modifiedCount}</strong><span>modifiés</span>
        </div>
        <div className="stat">
          <strong>{conflictCount}</strong><span>conflits</span>
        </div>
      </div>
    </aside>
  );
}
