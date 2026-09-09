import { ShortcutRow } from './ShortcutRow';
import { SCOPES } from '../lib/data';
import type { Shortcut } from '../lib/types';
import type { ScopeFilter } from './types';

interface ShortcutListProps {
  shortcuts: Shortcut[];
  scope: ScopeFilter;
  conflicts: Set<string>;
  onlyModified: boolean;
  onlyConflicts: boolean;
  onOnlyModifiedChange: (value: boolean) => void;
  onOnlyConflictsChange: (value: boolean) => void;
  onEdit: (id: string) => void;
  onRestore: (id: string) => void;
  onDelete: (id: string) => void;
}

const ALL_SCOPE = { label: 'Tous les raccourcis', sub: 'Vue complète' };

export function ShortcutList({
  shortcuts, scope, conflicts, onlyModified, onlyConflicts,
  onOnlyModifiedChange, onOnlyConflictsChange, onEdit, onRestore, onDelete,
}: ShortcutListProps) {
  const current = scope === 'all' ? ALL_SCOPE : SCOPES.find(s => s.id === scope) ?? ALL_SCOPE;

  return (
    <section className="content">
      <div className="content-head">
        <div>
          <h2>{current.label}</h2>
          <p className="muted scope-sub">{current.sub}</p>
        </div>
        <div className="filters">
          <label className="chk">
            <input
              type="checkbox"
              checked={onlyModified}
              onChange={e => onOnlyModifiedChange(e.target.checked)}
            /> Modifiés seulement
          </label>
          <label className="chk">
            <input
              type="checkbox"
              checked={onlyConflicts}
              onChange={e => onOnlyConflictsChange(e.target.checked)}
            /> Conflits seulement
          </label>
        </div>
      </div>

      {conflicts.size > 0 && (
        <div className="banner">
          ⚠︎ {conflicts.size} raccourcis partagent une même combinaison. Modifiez-en un pour lever le conflit.
        </div>
      )}

      <div className="list">
        {shortcuts.map(s => (
          <ShortcutRow
            key={s.id}
            shortcut={s}
            conflict={conflicts.has(s.id)}
            onEdit={onEdit}
            onRestore={onRestore}
            onDelete={onDelete}
          />
        ))}
      </div>

      {shortcuts.length === 0 && (
        <p className="empty">Aucun raccourci ne correspond à votre recherche.</p>
      )}
    </section>
  );
}
