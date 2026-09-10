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

const CHECKBOX = 'flex cursor-pointer items-center gap-1.5 text-xs text-muted dark:text-muted-dark';

export function ShortcutList({
  shortcuts, scope, conflicts, onlyModified, onlyConflicts,
  onOnlyModifiedChange, onOnlyConflictsChange, onEdit, onRestore, onDelete,
}: ShortcutListProps) {
  const current = scope === 'all' ? ALL_SCOPE : SCOPES.find(s => s.id === scope) ?? ALL_SCOPE;

  return (
    <section className="panel">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="m-0 text-[15px]">{current.label}</h2>
          <p className="mb-0 mt-[3px] text-xs text-muted dark:text-muted-dark">{current.sub}</p>
        </div>

        <div className="flex gap-3.5">
          <label className={CHECKBOX}>
            <input
              type="checkbox"
              checked={onlyModified}
              onChange={e => onOnlyModifiedChange(e.target.checked)}
            /> Modifiés seulement
          </label>
          <label className={CHECKBOX}>
            <input
              type="checkbox"
              checked={onlyConflicts}
              onChange={e => onOnlyConflictsChange(e.target.checked)}
            /> Conflits seulement
          </label>
        </div>
      </div>

      {conflicts.size > 0 && (
        <div className="mb-3 rounded-lg border border-danger bg-danger/[.12] px-3 py-2 text-xs text-danger">
          ⚠︎ {conflicts.size} raccourcis partagent une même combinaison. Modifiez-en un pour lever le conflit.
        </div>
      )}

      <div className="flex flex-col gap-2">
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
        <p className="py-[30px] text-center text-muted dark:text-muted-dark">
          Aucun raccourci ne correspond à votre recherche.
        </p>
      )}
    </section>
  );
}
