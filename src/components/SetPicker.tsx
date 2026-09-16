import { useState } from "react";
import { DropdownInterface } from "./DropdownInterface";
import { ButtonOptionInterface } from "./ButtonOptionInterface";
import { IconButton } from "./IconButton";
import { UnfoldMoreIcon } from "./icons/UnfoldMoreIcon";
import { CheckIcon } from "./icons/CheckIcon";
import { CopyIcon } from "./icons/CopyIcon";
import { PencilIcon } from "./icons/PencilIcon";
import { TrashIcon } from "./icons/TrashIcon";
import { MoreVertIcon } from "./icons/MoreVertIcon";
import { AddCircleIcon } from "./icons/AddCircleIcon";
import type { ShortcutSet } from "../lib/types";

interface SetPickerProps {
  sets: ShortcutSet[];
  activeId: string;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onDuplicate: (id: string) => void;
  onRename: (id: string) => void;
  onDelete: (id: string) => void;
}

/** Sélecteur de jeu de raccourcis, avec les actions propres à chaque jeu. */
export function SetPicker({
  sets,
  activeId,
  onSelect,
  onCreate,
  onDuplicate,
  onRename,
  onDelete,
}: SetPickerProps) {
  const [open, setOpen] = useState(false);
  const [actionsFor, setActionsFor] = useState<string | null>(null);

  const active = sets.find((s) => s.id === activeId);

  function close() {
    setOpen(false);
    setActionsFor(null);
  }

  return (
    <div className="relative inline-flex w-[190px] shrink-0 mr-8">
      <button
        type="button"
        data-dropdown-trigger
        data-active={open || undefined}
        onClick={() => {
          setOpen((o) => !o);
          setActionsFor(null);
        }}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex h-[30px] w-full items-center justify-between gap-1 rounded-[10px]
            dark:bg-white/[.06] dark:text-content-dark pl-3 pr-2 transition-colors hover:bg-panel2
          focus:outline-none dark:border-line-dark 
          dark:hover:bg-white/[.10]"
      >
        <span
          className="min-w-0 truncate whitespace-nowrap text-left text-[13px] font-medium
          tracking-[-0.2px] text-content dark:text-content-dark"
        >
          {active?.name ?? "Mes jeux"}
        </span>
        <UnfoldMoreIcon className="h-4 w-4 shrink-0 text-content/60 dark:text-content-dark/60" />
      </button>

      <DropdownInterface open={open} onClose={close} className="w-[280px]">
        <div
          className="px-2 py-1.5 text-[11px] font-semibold tracking-[-0.2px]
          text-muted dark:text-muted-dark"
        >
          Mes jeux de raccourcis
        </div>

        {sets.map((set) => {
          const rowOpen = actionsFor === set.id;
          const selected = set.id === activeId;

          return (
            <div
              key={set.id}
              role="button"
              tabIndex={0}
              onClick={() => {
                onSelect(set.id);
                close();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  onSelect(set.id);
                  close();
                }
              }}
              className="group flex w-full cursor-pointer items-center justify-between gap-2
                rounded-[12px] px-2.5 py-1.5 text-left transition-colors
                hover:bg-black/[.06] dark:hover:bg-white/[.08]"
            >
              <span className="flex min-w-0 flex-col">
                <span
                  className="truncate text-[13px] font-medium tracking-[-0.2px]
                  text-content dark:text-content-dark"
                >
                  {set.name}
                </span>
                <span
                  className="truncate text-[11px] font-medium tracking-[-0.2px]
                  text-muted/70 dark:text-muted-dark/70 leading-[16px]"
                >
                  {set.shortcuts.length} raccourci
                  {set.shortcuts.length > 1 ? "s" : ""}
                </span>
              </span>

              {/*
                Zone d'actions à largeur fixe : au repos la coche est centrée
                au-dessus du bouton ; au survol elle glisse vers la gauche et
                laisse apparaître le menu.
              */}
              <span
                className={`relative flex h-7 shrink-0 items-center justify-end
                  transition-[width] duration-200 ease-out
                  ${rowOpen ? "w-[52px]" : "w-7 group-hover:w-[52px]"}`}
              >
                {selected && (
                  <CheckIcon
                    className={`pointer-events-none absolute right-[6px] h-[14px] w-[14px]
                      text-content transition-transform duration-200 ease-out
                      dark:text-content-dark
                      ${rowOpen ? "-translate-x-[30px]" : "group-hover:-translate-x-[30px]"}`}
                  />
                )}

                <span
                  className={`relative inline-flex
                    ${
                      rowOpen
                        ? "opacity-100"
                        : "icon-button-fade opacity-0 group-hover:opacity-100"
                    }`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <IconButton
                    label="Actions du jeu"
                    size={26}
                    radius={8}
                    active={rowOpen}
                    data-dropdown-trigger
                    aria-haspopup="menu"
                    aria-expanded={rowOpen}
                    onClick={() =>
                      setActionsFor((id) => (id === set.id ? null : set.id))
                    }
                  >
                    <MoreVertIcon className="h-[14px] w-[14px]" />
                  </IconButton>

                  <DropdownInterface
                    open={rowOpen}
                    onClose={() => setActionsFor(null)}
                    align="right"
                    nested
                    className="w-[180px]"
                  >
                    <ButtonOptionInterface
                      label="Dupliquer"
                      icon={<CopyIcon className="h-4 w-4" />}
                      onClick={() => {
                        onDuplicate(set.id);
                        close();
                      }}
                    />
                    <ButtonOptionInterface
                      label="Renommer"
                      icon={<PencilIcon className="h-4 w-4" />}
                      onClick={() => {
                        onRename(set.id);
                        close();
                      }}
                    />
                    <ButtonOptionInterface
                      label="Supprimer"
                      icon={<TrashIcon className="h-4 w-4" />}
                      disabled={sets.length <= 1}
                      onClick={() => {
                        onDelete(set.id);
                        close();
                      }}
                    />
                  </DropdownInterface>
                </span>
              </span>
            </div>
          );
        })}

        <button
          type="button"
          onClick={() => {
            onCreate();
            close();
          }}
          className="mt-2 flex h-[46.5px] w-full items-center gap-2 rounded-[10px]
            border border-dashed border-line px-2.5 py-2 text-left transition-colors
            hover:bg-black/[.06] dark:border-line-dark/70 dark:hover:bg-white/[.08]"
        >
          <AddCircleIcon className="h-4 w-4 shrink-0 text-content/60 dark:text-content-dark/60" />
          <span
            className="text-[13px] font-medium tracking-[-0.2px] text-content
            dark:text-content-dark"
          >
            Nouveau jeu
          </span>
        </button>
      </DropdownInterface>
    </div>
  );
}
