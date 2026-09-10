import { Combo } from './Combo';
import { TYPE_LABEL } from '../lib/data';
import { isModified } from '../lib/shortcuts';
import type { Shortcut } from '../lib/types';

interface ShortcutRowProps {
  shortcut: Shortcut;
  conflict: boolean;
  onEdit: (id: string) => void;
  onRestore: (id: string) => void;
  onDelete: (id: string) => void;
}

const TAG = 'rounded-[5px] px-1.5 py-0.5 text-[10px] uppercase tracking-[.04em]';

export function ShortcutRow({ shortcut, conflict, onEdit, onRestore, onDelete }: ShortcutRowProps) {
  const modified = isModified(shortcut);

  return (
    <div
      className={`grid grid-cols-[1fr_auto_auto] items-center gap-3 rounded-[9px]
        border bg-panel2 px-3 py-2.5 dark:bg-panel2-dark
        ${conflict ? 'border-danger' : 'border-line dark:border-line-dark'}
        ${modified ? 'border-l-[3px] border-l-warn' : ''}`}
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-[7px] font-semibold">
          {shortcut.name}
          <span className={`${TAG} bg-line text-muted dark:bg-line-dark dark:text-muted-dark`}>
            {TYPE_LABEL[shortcut.type] ?? shortcut.type}
          </span>
          {shortcut.custom && (
            <span className={`${TAG} bg-accent/[.16] text-accent`}>perso</span>
          )}
          {modified && (
            <span className={`${TAG} bg-warn/[.16] text-warn`}>modifié</span>
          )}
          {conflict && (
            <span className={`${TAG} bg-danger/[.16] text-danger`}>conflit</span>
          )}
        </div>
        <div
          title={shortcut.target}
          className="overflow-hidden text-ellipsis whitespace-nowrap font-mono text-xs
            text-muted dark:text-muted-dark"
        >
          {shortcut.target}
        </div>
      </div>

      <Combo combo={shortcut.combo} />

      <div className="flex gap-1.5">
        <button type="button" className="btn btn-tiny" onClick={() => onEdit(shortcut.id)}>
          Modifier
        </button>
        {modified && (
          <button type="button" className="btn btn-tiny" onClick={() => onRestore(shortcut.id)}>
            Rétablir
          </button>
        )}
        <button
          type="button"
          className="btn btn-tiny btn-danger"
          onClick={() => onDelete(shortcut.id)}
        >
          Suppr.
        </button>
      </div>
    </div>
  );
}
