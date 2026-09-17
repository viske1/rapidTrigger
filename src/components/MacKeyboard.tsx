import { useMemo } from "react";
import { KEYBOARD } from "../lib/keyboard";

interface MacKeyboardProps {
  /** Combinaison en cours, ex. « ⌘ ⌥ K ». */
  combo: string;
}

/** Hauteur d'une touche et espacement, en pixels. */
const UNIT = 26;
const GAP = 3;

/**
 * Clavier Mac en pseudo-3D : les touches de la combinaison s'illuminent.
 *
 * Le relief vient de trois couches — une arête haute claire, une ombre portée
 * sous la touche, et un dégradé vertical — plutôt que d'une transformation,
 * ce qui garde le rendu net à toute taille.
 */
export function MacKeyboard({ combo }: MacKeyboardProps) {
  const active = useMemo(
    () => new Set(combo.split(" ").filter(Boolean)),
    [combo],
  );

  return (
    <div
      aria-hidden="true"
      className="flex w-full flex-col items-center gap-[3px] rounded-[14px]
        border border-black bg-black/25 p-2"
    >
      {KEYBOARD.map((row, y) => (
        <div key={y} className="flex gap-[3px]" style={{ height: UNIT }}>
          {row.map((key, x) => {
            const lit = key.combo !== undefined && active.has(key.combo);
            const width = (key.w ?? 1) * UNIT + ((key.w ?? 1) - 1) * GAP;

            return (
              <span
                key={x}
                style={{ width, height: UNIT }}
                className={`grid place-items-center rounded-[5px] text-[10px]
                  font-medium leading-none transition-all duration-200 ease-out
                  motion-reduce:transition-none
                  ${lit
                    ? "bg-gradient-to-b from-accent to-accent-strong text-white " +
                      "shadow-[0_0_10px_0_rgba(91,140,255,.55),inset_0_1px_0_0_rgba(255,255,255,.35)]"
                    : "bg-gradient-to-b from-white/[.09] to-white/[.04] text-white/45 " +
                      "shadow-[0_1px_0_0_rgba(0,0,0,.5),inset_0_1px_0_0_rgba(255,255,255,.08)]"}`}
              >
                {key.label}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
}
