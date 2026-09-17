import { useScrollFade } from "../lib/useScrollFade";
import type { Shortcut } from "../lib/types";

interface KeyShortcutListProps {
  /** Touche concernée, ex. « ⌘ ». */
  keyLabel: string;
  shortcuts: Shortcut[];
  onSelect?: (id: string) => void;
}

/** Contenu du panneau d'une touche : les raccourcis qui l'emploient. */
export function KeyShortcutList({ keyLabel, shortcuts, onSelect }: KeyShortcutListProps) {
  // Rampe courte : le panneau est bien moins haut que la liste principale.
  const fade = useScrollFade(18);

  return (
    <div>
      <div className="px-2 py-1.5 text-[11px] font-semibold tracking-[-0.2px]
        text-muted dark:text-muted-dark">
        {shortcuts.length} raccourci{shortcuts.length > 1 ? "s" : ""} avec {keyLabel}
      </div>

      {/*
        Le masque n'estompe que le côté où il reste à faire défiler : rien en
        haut une fois revenu au sommet, rien en bas à la butée, et rien du tout
        quand la liste tient entière.
      */}
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
        className="m-0 flex max-h-[200px] list-none flex-col gap-0.5 overflow-y-auto p-0"
      >
        {shortcuts.map(s => (
          <li key={s.id}>
            <button
              type="button"
              onClick={() => onSelect?.(s.id)}
              className="flex w-full items-center justify-between gap-3 rounded-[8px]
                px-2 py-1.5 text-left transition-colors hover:bg-white/[.08]"
            >
              <span className="truncate text-[13px] font-medium tracking-[-0.1px]
                text-content-dark">
                {s.name}
              </span>
              <span className="shrink-0 font-sans text-[12px] text-white/45">
                {s.combo}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
