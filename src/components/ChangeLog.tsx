import type { HistoryEntry } from '../lib/types';

interface ChangeLogProps {
  history: HistoryEntry[];
  onClear: () => void;
}

const dateFormat = new Intl.DateTimeFormat('fr-FR', {
  dateStyle: 'short',
  timeStyle: 'medium',
});

/** Journal des modifications : historique horodaté des actions sur les raccourcis. */
export function ChangeLog({ history, onClear }: ChangeLogProps) {
  return (
    <aside className="panel">
      <div className="flex items-center justify-between gap-2">
        <h3 className="m-0 text-[13px]">Journal des modifications</h3>
        <button
          type="button"
          className="btn btn-tiny disabled:cursor-default disabled:opacity-45"
          onClick={onClear}
          disabled={history.length === 0}
        >
          Vider
        </button>
      </div>

      {history.length === 0 ? (
        <p className="mb-0 mt-3 text-xs text-muted dark:text-muted-dark">
          Aucune modification pour l’instant.
        </p>
      ) : (
        <ul className="m-0 mt-3 flex max-h-[60vh] list-none flex-col gap-2 overflow-auto p-0">
          {history.map((entry, i) => (
            <li key={`${entry.at}-${i}`} className="border-l-2 border-accent pl-2 text-xs">
              <strong>{entry.action}</strong> — {entry.detail}
              <span className="mt-0.5 block text-[11px] text-muted dark:text-muted-dark">
                {dateFormat.format(entry.at)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
