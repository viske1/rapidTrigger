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

export function ShortcutRow({ shortcut, conflict, onEdit, onRestore, onDelete }: ShortcutRowProps) {
  const modified = isModified(shortcut);

  return (
    <div className={`row ${conflict ? 'conflict' : ''} ${modified ? 'modified' : ''}`}>
      <div className="row-main">
        <div className="row-name">
          {shortcut.name}
          <span className="tag">{TYPE_LABEL[shortcut.type] ?? shortcut.type}</span>
          {shortcut.custom && <span className="tag custom">perso</span>}
          {modified && <span className="tag modified">modifié</span>}
          {conflict && <span className="tag conflict">conflit</span>}
        </div>
        <div className="row-target" title={shortcut.target}>{shortcut.target}</div>
      </div>

      <Combo combo={shortcut.combo} />

      <div className="row-actions">
        <button className="btn tiny" onClick={() => onEdit(shortcut.id)}>Modifier</button>
        {modified && (
          <button className="btn tiny" onClick={() => onRestore(shortcut.id)}>Rétablir</button>
        )}
        <button className="btn tiny danger-ghost" onClick={() => onDelete(shortcut.id)}>Suppr.</button>
      </div>
    </div>
  );
}
