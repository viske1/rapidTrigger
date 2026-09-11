import { useState } from "react";
import type { ReactNode } from "react";
import { useMetaKey } from "../lib/useMetaKey";
import { PlusIcon } from "./icons/PlusIcon";
import { PencilIcon } from "./icons/PencilIcon";

interface ButtonOptionInterfaceProps {
  label: string;
  /** Combinaison affichée à droite, ex. « ⌘ Z ». */
  combo?: string;
  /** Affiche un chevron de sous-menu à la place de la combinaison. */
  submenu?: boolean;
  disabled?: boolean;
  /** Icône affichée devant le libellé. */
  icon?: ReactNode;
  onClick?: () => void;
  /**
   * Ouvre l'interface Rapid Trigger pour ce raccourci.
   * Reçoit `combo` s'il en existe un (modification), sinon rien (création).
   */
  onTrigger?: (context: { label: string; combo?: string }) => void;
}

/**
 * Entrée d'un menu déroulant, dans le style des menus macOS.
 *
 * Survolée pendant que ⌘ est enfoncée, la combinaison cède la place à un
 * déclencheur « Créer » / « Modifier » qui ouvre Rapid Trigger : les deux
 * se croisent au même emplacement en fade + scale inversés.
 */
export function ButtonOptionInterface({
  label,
  combo,
  submenu = false,
  disabled = false,
  icon,
  onClick,
  onTrigger,
}: ButtonOptionInterfaceProps) {
  const [hovered, setHovered] = useState(false);
  const metaDown = useMetaKey();

  // Le mode trigger ne concerne pas les sous-menus, qui n'ont pas de combinaison.
  const triggering =
    hovered && metaDown && !submenu && !disabled && Boolean(onTrigger);

  function handleClick() {
    if (triggering) {
      onTrigger?.({ label, combo });
      return;
    }
    onClick?.();
  }

  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      className={`flex w-full items-center justify-between gap-6 rounded-[10px] px-2 py-[4px]
        text-left font-regular tracking-[-0.1px] text-[13px] transition-colors duration-100
        focus-visible:outline-none
        text-content hover:bg-black/[.06] focus-visible:bg-black/[.06]
        dark:text-content-dark dark:hover:bg-white/[.08] dark:focus-visible:bg-white/[.08]
        disabled:pointer-events-none disabled:opacity-40 motion-reduce:transition-none`}
    >
      <span className="flex min-w-0 items-center gap-2">
        {icon && (
          <span className="shrink-0 text-content/55 dark:text-content-dark/55">
            {icon}
          </span>
        )}
        <span className="truncate">{label}</span>
      </span>

      {submenu ? (
        <span aria-hidden="true" className="shrink-0 text-white/50">
          ›
        </span>
      ) : (
        /*
          Les deux états se superposent dans une même grille : ils occupent
          la même cellule, donc la largeur ne saute pas pendant l'échange.
          Celui qui sort part sans délai, celui qui entre attend 100 ms —
          les deux ne se chevauchent donc jamais, dans un sens comme dans l'autre.
        */
        <span className="grid shrink-0 grid-cols-1 grid-rows-1 items-center justify-items-end">
          {combo && (
            <span
              aria-hidden={triggering}
              className={`col-start-1 row-start-1 font-sans text-white/45
                transition-[opacity,transform,filter] duration-100 ease-out motion-reduce:transition-none
                ${
                  triggering
                    ? "scale-75 opacity-0 blur-[2px] delay-0"
                    : "scale-100 opacity-100 blur-0 delay-100"
                }`}
            >
              {combo}
            </span>
          )}

          <span
            aria-hidden={!triggering}
            aria-label={combo ? "Modifier le raccourci" : "Créer un raccourci"}
            className={` hover-pop col-start-1 row-start-1 grid h-6 w-6 place-items-center translate-x-1
              rounded-lg  text-white/90
              transition-[opacity,transform,filter] duration-100 ease-out motion-reduce:transition-none
              ${
                triggering
                  ? "scale-100 opacity-70 blur-0 delay-100 hover:opacity-100"
                  : "pointer-events-none scale-75 opacity-0 blur-[2px] delay-0"
              }`}
          >
            {combo ? (
              <PencilIcon className="h-4 w-4" />
            ) : (
              <PlusIcon className="h-4 w-4" />
            )}
          </span>
        </span>
      )}
    </button>
  );
}

/** Trait de séparation entre deux groupes d'entrées. */
export function DropdownInterfaceSeparator() {
  return <hr className="my-1.5 border-0 border-t border-white/10" />;
}
