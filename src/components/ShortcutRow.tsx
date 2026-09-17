import { Combo } from "./Combo";
import { Tag } from "./Tag";
import { IconButton } from "./IconButton";
import { DropdownInterface } from "./DropdownInterface";
import { ButtonOptionInterface } from "./ButtonOptionInterface";
import { MoreVertIcon } from "./icons/MoreVertIcon";
import { PencilIcon } from "./icons/PencilIcon";
import { PauseIcon } from "./icons/PauseIcon";
import { PlayIcon } from "./icons/PlayIcon";
import { AutorenewIcon } from "./icons/AutorenewIcon";
import { TrashIcon } from "./icons/TrashIcon";
import { TYPE_LABEL } from "../lib/data";
import { isModified } from "../lib/shortcuts";
import { useState } from "react";
import type { Shortcut } from "../lib/types";

interface ShortcutRowProps {
  shortcut: Shortcut;
  conflict: boolean;
  onEdit: (id: string) => void;
  onRestore: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleSuspended: (id: string) => void;
  /** Signale la combinaison survolée, pour l'illustrer sur le clavier. */
  onHover?: (combo: string | null) => void;
}

export function ShortcutRow({
  shortcut,
  conflict,
  onEdit,
  onRestore,
  onDelete,
  onToggleSuspended,
  onHover,
}: ShortcutRowProps) {
  const modified = isModified(shortcut);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div
      onMouseEnter={() => onHover?.(shortcut.combo)}
      onMouseLeave={() => onHover?.(null)}
      className={`flex justify-between items-center gap-3 rounded-[16px]
         px-3 py-2.5 transition-colors duration-150 hover:dark:bg-white/5
        ${menuOpen ? "dark:bg-white/5" : ""}
        ${conflict ? "border-danger" : ""}
        ${modified ? "border-l-[3px] border-l-warn" : ""}
        ${shortcut.suspended ? "opacity-55" : ""}`}
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-[7px] font-semibold">
          <span className="text-[13px] tracking-[-0.2px] font-normal">
            {shortcut.name}
          </span>

          {/* <Tag label={TYPE_LABEL[shortcut.type] ?? shortcut.type} />
          {shortcut.custom && <Tag label="perso" variant="accent" />}
          {modified && <Tag label="modifié" variant="warn" />}
          {conflict && <Tag label="conflit" variant="danger" />}
          {shortcut.suspended && <Tag label="suspendu" />} */}
        </div>
        <div
          title={shortcut.target}
          className="overflow-hidden text-ellipsis whitespace-nowrap font-mono text-[11px] leading-[14px]
            text-muted dark:text-muted-dark"
        >
          {shortcut.target}
        </div>
      </div>

      {/* Largeur fixe et alignement à droite : les combinaisons se calent
          les unes sous les autres quelle que soit la longueur du nom. */}
      <div className="flex w-[190px] shrink-0 justify-end">
        <Combo combo={shortcut.combo} />
      </div>

      {/* Ancre du menu : le DropdownInterface se positionne sur ce parent. */}
      <div className="relative">
        <IconButton
          label="Options du raccourci"
          active={menuOpen}
          data-dropdown-trigger
          onClick={() => setMenuOpen((o) => !o)}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
        >
          <MoreVertIcon className="h-[14px] w-[14px]" />
        </IconButton>

        <DropdownInterface
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
          align="right"
          className="w-[190px]"
        >
          <ButtonOptionInterface
            label="Modifier"
            icon={<PencilIcon className="h-4 w-4" />}
            onClick={() => {
              setMenuOpen(false);
              onEdit(shortcut.id);
            }}
          />

          <ButtonOptionInterface
            label={shortcut.suspended ? "Reprendre" : "Suspendre"}
            icon={
              shortcut.suspended ? (
                <PlayIcon className="h-4 w-4" />
              ) : (
                <PauseIcon className="h-4 w-4" />
              )
            }
            onClick={() => {
              setMenuOpen(false);
              onToggleSuspended(shortcut.id);
            }}
          />

          {modified && (
            <ButtonOptionInterface
              label="Rétablir"
              icon={<AutorenewIcon className="h-4 w-4" />}
              onClick={() => {
                setMenuOpen(false);
                onRestore(shortcut.id);
              }}
            />
          )}

          <ButtonOptionInterface
            label="Supprimer"
            icon={<TrashIcon className="h-4 w-4" />}
            onClick={() => {
              setMenuOpen(false);
              onDelete(shortcut.id);
            }}
          />
        </DropdownInterface>
      </div>
    </div>
  );
}
