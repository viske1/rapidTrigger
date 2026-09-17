import { useMemo } from "react";
import { useScrollFade } from "../lib/useScrollFade";
import { Combo } from "./Combo";
import type { Shortcut } from "../lib/types";

interface ComboAdvisorProps {
  /** Combinaison en cours de saisie. */
  combo: string;
  shortcuts: Shortcut[];
  /** Raccourci en cours de modification, exclu des conflits. */
  editingId?: string;
}

/** Combinaisons suggérées, parmi les plus courantes restées libres. */
const SUGGESTED = ["⌘ ⌥ J", "⌘ ⌥ L", "⌘ ⌥ M", "⌘ ⇧ E", "⌘ ⇧ R", "⌃ ⌥ K"];

/**
 * Panneau d'aide à la saisie d'une combinaison.
 *
 * Il répond à la question du moment : tant que rien n'est tapé, il montre ce
 * qui est déjà pris ; dès qu'une touche est saisie, il ne garde que les
 * combinaisons qui commencent pareil — c'est-à-dire celles avec lesquelles on
 * risque d'entrer en conflit.
 */
export function ComboAdvisor({ combo, shortcuts, editingId }: ComboAdvisorProps) {
  const fade = useScrollFade(18);
  const typed = combo.trim();

  const assigned = useMemo(
    () =>
      shortcuts
        .filter(s => s.combo && s.id !== editingId)
        .sort((a, b) => a.combo.localeCompare(b.combo)),
    [shortcuts, editingId],
  );

  const matching = useMemo(() => {
    if (!typed) return assigned;
    return assigned.filter(s => s.combo.startsWith(typed));
  }, [assigned, typed]);

  const exact = typed
    ? assigned.find(s => s.combo === typed)
    : undefined;

  const free = SUGGESTED.filter(
    suggestion => !assigned.some(s => s.combo === suggestion),
  );

  return (
    <div className="flex min-h-0 w-[280px] shrink-0 flex-col gap-2.5">
      {/* Verdict sur la combinaison saisie, avant la liste. */}
      {typed && (
        <div className="pl-1">
          {exact ? (
            <div className="flex items-start gap-2">
              <span className="mt-px shrink-0 text-danger">⚠︎</span>
              <p className="m-0 text-[13px] tracking-[-0.1px] text-content-dark">
                Déjà pris par{" "}
                <strong className="font-medium">{exact.name}</strong>. Vous pouvez
                enregistrer, le conflit sera signalé.
              </p>
            </div>
          ) : (
            <p className="m-0 flex items-center gap-2 text-[13px] tracking-[-0.1px]
              text-content-dark">
              <span className="shrink-0 text-emerald-400">✓</span>
              Cette combinaison est libre.
            </p>
          )}
        </div>
      )}

      <div className="flex min-h-0 flex-col">
        <span className="mb-2 pl-1 text-[13px] font-medium tracking-[-0.1px] text-white">
          {typed
            ? `Combinaisons proches (${matching.length})`
            : `Déjà utilisées (${assigned.length})`}
        </span>

        {matching.length === 0 ? (
          <p className="m-0 pl-1 text-[13px] tracking-[-0.1px] text-muted">
            Aucune combinaison ne commence ainsi.
          </p>
        ) : (
          <ul
            ref={fade.ref}
            style={{
              maskImage: `linear-gradient(to bottom,
                transparent 0, #000 ${fade.top}px,
                #000 calc(100% - ${fade.bottom}px), transparent 100%)`,
              WebkitMaskImage: `linear-gradient(to bottom,
                transparent 0, #000 ${fade.top}px,
                #000 calc(100% - ${fade.bottom}px), transparent 100%)`,
            }}
            className="m-0 flex max-h-[200px] w-full list-none flex-col gap-1
              overflow-y-auto p-0"
          >
            {matching.map(s => (
              <li
                key={s.id}
                className="flex items-center justify-between gap-2 px-1 py-0.5"
              >
                <span className="truncate text-[13px] tracking-[-0.1px] text-muted">
                  {s.name}
                </span>
                <Combo combo={s.combo} />
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Sans saisie, autant proposer des pistes plutôt qu'un simple inventaire. */}
      {!typed && free.length > 0 && (
        <div>
          <span className="mb-2 pl-1 block text-[13px] font-medium tracking-[-0.1px] text-white">
            Suggestions libres
          </span>
          <div className="flex flex-wrap gap-1.5 pl-1">
            {free.slice(0, 4).map(suggestion => (
              <Combo key={suggestion} combo={suggestion} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
