import { ShortcutRow } from "./ShortcutRow";
import { useState } from "react";
import { useScrollFade } from "../lib/useScrollFade";
import { useElementWidth } from "../lib/useElementWidth";
import { IconButton } from "./IconButton";
import { CustomTooltip } from "./CustomTooltip";
import { ColumnsOneIcon } from "./icons/ColumnsOneIcon";
import { ColumnsTwoIcon } from "./icons/ColumnsTwoIcon";
import { SCOPES } from "../lib/data";
import type { Shortcut } from "../lib/types";
import type { ScopeFilter } from "./types";

interface ShortcutListProps {
  shortcuts: Shortcut[];
  scope: ScopeFilter;
  conflicts: Set<string>;
  onEdit: (id: string) => void;
  onRestore: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleSuspended: (id: string) => void;
  onHover?: (combo: string | null) => void;
}

/** En deçà, une colonne écrase trop le nom du raccourci. */
const MIN_COLUMN_WIDTH = 312;
const COLUMN_GAP = 8;

const ALL_SCOPE = { label: "Tous les raccourcis", sub: "Vue complète" };

export function ShortcutList({
  shortcuts,
  scope,
  conflicts,
  onEdit,
  onRestore,
  onDelete,
  onToggleSuspended,
  onHover,
}: ShortcutListProps) {
  const fade = useScrollFade();
  const [listRef, listWidth] = useElementWidth();

  /* Disposition choisie ; deux colonnes par défaut. */
  const [columns, setColumns] = useState<1 | 2>(2);

  /*
   * En deux colonnes, chaque élément reçoit la moitié de la largeur moins la
   * gouttière. Sous MIN_COLUMN_WIDTH le nom serait trop écrasé : on replie
   * alors sur une colonne, sans changer le choix de l'utilisateur.
   */
  const fitsTwo = (listWidth - COLUMN_GAP) / 2 >= MIN_COLUMN_WIDTH;
  const effectiveColumns = columns === 2 && fitsTwo ? 2 : 1;

  const current =
    scope === "all"
      ? ALL_SCOPE
      : (SCOPES.find((s) => s.id === scope) ?? ALL_SCOPE);

  return (
    <section className="flex min-h-0 flex-col">
      <div className="mb-4 flex shrink-0 flex-wrap items-start justify-between gap-3">
        <h2 className="m-0 font-medium tracking-[-0.2px] text-[16px] pl-3">
          {current.label}
        </h2>

        <div className="flex items-center gap-0.5 pr-1">
          <CustomTooltip text="Une colonne" position="bottom">
            <IconButton
              label="Afficher sur une colonne"
              active={columns === 1}
              onClick={() => setColumns(1)}
            >
              <ColumnsOneIcon className="h-[14px] w-[14px]" />
            </IconButton>
          </CustomTooltip>

          <CustomTooltip
            text={
              fitsTwo ? "Deux colonnes" : "Deux colonnes — place insuffisante"
            }
            position="bottom"
          >
            <IconButton
              label="Afficher sur deux colonnes"
              active={columns === 2}
              disabled={!fitsTwo}
              onClick={() => setColumns(2)}
            >
              <ColumnsTwoIcon className="h-[14px] w-[14px]" />
            </IconButton>
          </CustomTooltip>
        </div>
      </div>

      {conflicts.size > 0 && (
        <div className="mb-3 shrink-0 rounded-lg border border-danger bg-danger/[.12] px-3 py-2 text-xs text-danger">
          ⚠︎ {conflicts.size} raccourcis partagent une même combinaison.
          Modifiez-en un pour lever le conflit.
        </div>
      )}

      {/*
        Le masque estompe le contenu à chaque extrémité, en proportion de ce
        qui reste à faire défiler de ce côté : aucun fondu une fois la butée
        atteinte, et une montée progressive sur les premiers pixels.
      */}
      <div
        ref={(node) => {
          fade.ref(node);
          listRef(node);
        }}
        style={{
          maskImage: `linear-gradient(to bottom,
            transparent 0, #000 ${fade.top}px,
            #000 calc(100% - ${fade.bottom}px), transparent 100%)`,
          WebkitMaskImage: `linear-gradient(to bottom,
            transparent 0, #000 ${fade.top}px,
            #000 calc(100% - ${fade.bottom}px), transparent 100%)`,
        }}
        className={`grid min-h-0 flex-1 content-start gap-1 overflow-y-auto
          ${effectiveColumns === 2 ? "grid-cols-2" : "grid-cols-1"}`}
      >
        {shortcuts.map((s) => (
          <ShortcutRow
            key={s.id}
            shortcut={s}
            conflict={conflicts.has(s.id)}
            onEdit={onEdit}
            onRestore={onRestore}
            onDelete={onDelete}
            onToggleSuspended={onToggleSuspended}
            onHover={onHover}
          />
        ))}

        {/*
          Cale de fin de liste : la modale occupe 78 % de la maquette, donc
          deux tiers de sa hauteur valent environ 40vh. En fin de défilement,
          la dernière ligne remonte ainsi au premier tiers.
        */}
        {shortcuts.length > 0 && (
          <div
            aria-hidden="true"
            className="col-span-full h-[128px] shrink-0"
          />
        )}
      </div>

      {shortcuts.length === 0 && (
        <p className="py-[30px] text-center text-muted dark:text-muted-dark">
          Aucun raccourci ne correspond à votre recherche.
        </p>
      )}
    </section>
  );
}
