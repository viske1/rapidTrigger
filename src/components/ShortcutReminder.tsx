import { useEffect, useState } from "react";

export interface ReminderEntry {
  label: string;
  combo: string;
}

interface ShortcutReminderProps {
  open: boolean;
  /** Symboles actuellement enfoncés, ex. ["⌥", "⌘"]. */
  symbols: string[];
  entries: ReminderEntry[];
}

const DURATION = 200;

/**
 * Rappel des raccourcis disponibles, en bas à droite de la démo.
 * S'ouvre après un maintien prolongé des modificateurs et liste les
 * combinaisons qui commencent par ceux-ci.
 */
export function ShortcutReminder({
  open,
  symbols,
  entries,
}: ShortcutReminderProps) {
  const [mounted, setMounted] = useState(open);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!open) {
      setVisible(false);
      const timer = setTimeout(() => setMounted(false), DURATION);
      return () => clearTimeout(timer);
    }

    setMounted(true);
    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => setVisible(true));
    });

    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, [open]);

  if (!mounted) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`absolute bottom-6 right-6 z-40 w-[256px] overflow-hidden rounded-2xl
        border border-white/10 bg-[#2b2b2e]/70 px-2 py-1.5 shadow-screen
        backdrop-blur-2xl backdrop-saturate-150
        transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none
        ${visible ? "translate-y-0 scale-100 opacity-100" : "translate-y-2 scale-95 opacity-0"}`}
    >
      <div className="mb-1 flex items-center justify-between gap-3 px-1">
        <span className="text-[11px] tracking-[-0.2px] font-medium text-white/45">
          Raccourcis disponibles
        </span>
        <span className="shrink-0 font-sans text-[13px] text-white/45">
          {symbols.join(" ")}
        </span>
      </div>

      {entries.length === 0 ? (
        <p className="px-1 py-2 text-[13px] text-white/45">
          Aucun raccourci pour cette combinaison.
        </p>
      ) : (
        <ul className="flex flex-col">
          {entries.map((entry) => (
            <li
              key={entry.combo + entry.label}
              className="flex items-center justify-between gap-1 rounded-lg px-1 py-0.5
                text-[11px] text-white/90"
            >
              <span className="truncate">{entry.label}</span>
              {/* Même rendu que dans ButtonOptionDropdown : texte simple, pas de <kbd>. */}
              <span className="shrink-0 font-sans text-white/45">
                {entry.combo}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
