import type { HistoryEntry } from '../lib/types';

interface ChangeLogProps {
  history: HistoryEntry[];
  onClear: () => void;
}

const dateFormat = new Intl.DateTimeFormat('fr-FR', {
  dateStyle: 'short',
  timeStyle: 'medium',
});

/**
 * Journal des modifications : historique horodaté des actions sur les raccourcis.
 * Remplace HistoryPanel — en-tête et bouton « Vider » regroupés, formateur de date mémorisé.
 */
export function ChangeLog({ history, onClear }: ChangeLogProps) {
  return (
    <aside className="change-log">
      <div className="change-log-head">
        <h3>Journal des modifications</h3>
        <button
          type="button"
          className="btn tiny"
          onClick={onClear}
          disabled={history.length === 0}
        >
          Vider
        </button>
      </div>

      {history.length === 0 ? (
        <p className="change-log-empty">Aucune modification pour l’instant.</p>
      ) : (
        <ul className="change-log-list">
          {history.map((entry, i) => (
            <li key={`${entry.at}-${i}`}>
              <strong>{entry.action}</strong> — {entry.detail}
              <span className="when">{dateFormat.format(entry.at)}</span>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
