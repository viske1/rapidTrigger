import { useMemo } from "react";
import { KEYBOARD } from "../lib/keyboard";
import { keyUsageMap } from "../lib/keyUsage";
import { HoverCard } from "./HoverCard";
import { KeyShortcutList } from "./KeyShortcutList";
import type { Shortcut } from "../lib/types";

interface MacKeyboardProps {
  /** Raccourcis du jeu, dont se déduit la fréquence d'emploi des touches. */
  shortcuts?: Shortcut[];
  /** Combinaison mise en avant, ex. la ligne survolée dans la liste. */
  highlight?: string;
  /** Hauteur d'une touche, en pixels. */
  unit?: number;
  /** Ouvre le panneau listant les raccourcis d'une touche. */
  interactive?: boolean;
  onSelect?: (id: string) => void;
}

const GAP = 3;

/**
 * Clavier Mac en pseudo-3D.
 *
 * Une touche s'éclaire d'autant plus qu'elle sert souvent, et passe en pleine
 * lumière quand elle appartient à la combinaison mise en avant. Le relief vient
 * de trois couches CSS plutôt que d'une transformation, ce qui garde le rendu
 * net et évite les problèmes d'empilement.
 */
export function MacKeyboard({
  shortcuts = [], highlight = "", unit = 26, interactive = false, onSelect,
}: MacKeyboardProps) {
  const usage = useMemo(() => keyUsageMap(shortcuts), [shortcuts]);
  const lit = useMemo(
    () => new Set(highlight.split(" ").filter(Boolean)),
    [highlight],
  );

  return (
    <div
      className="flex w-full flex-col items-center gap-[3px] rounded-[14px]
        border border-black bg-black/25 p-2"
    >
      {KEYBOARD.map((row, y) => (
        <div key={y} className="flex gap-[3px]" style={{ height: unit }}>
          {row.map((key, x) => {
            const width = (key.w ?? 1) * unit + ((key.w ?? 1) - 1) * GAP;
            const used = key.combo ? usage.get(key.combo) : undefined;
            const active = key.combo !== undefined && lit.has(key.combo);

            const cap = (
              <span
                style={{
                  width,
                  height: unit,
                  // L'intensité module la lueur : rare à peine visible,
                  // fréquente pleinement éclairée.
                  ...(used && !active
                    ? {
                        backgroundColor: `rgba(91,140,255,${0.08 + used.intensity * 0.3})`,
                        boxShadow:
                          `0 0 ${4 + used.intensity * 10}px 0 rgba(91,140,255,${used.intensity * 0.45}),` +
                          " inset 0 1px 0 0 rgba(255,255,255,.12)",
                      }
                    : undefined),
                }}
                className={`grid shrink-0 place-items-center rounded-[5px] text-[10px]
                  font-medium leading-none transition-all duration-200 ease-out
                  motion-reduce:transition-none
                  ${active
                    ? "bg-gradient-to-b from-accent to-accent-strong text-white " +
                      "shadow-[0_0_14px_0_rgba(91,140,255,.7),inset_0_1px_0_0_rgba(255,255,255,.35)]"
                    : used
                      ? "text-white/85"
                      : "bg-gradient-to-b from-white/[.09] to-white/[.04] text-white/40 " +
                        "shadow-[0_1px_0_0_rgba(0,0,0,.5),inset_0_1px_0_0_rgba(255,255,255,.08)]"}
                  ${interactive && used ? "cursor-pointer" : ""}`}
              >
                {key.label}
              </span>
            );

            if (!interactive || !used) {
              return <span key={x} aria-hidden="true">{cap}</span>;
            }

            return (
              <HoverCard
                key={x}
                className="w-[240px]"
                content={
                  <KeyShortcutList
                    keyLabel={key.combo!}
                    shortcuts={used.shortcuts}
                    onSelect={onSelect}
                  />
                }
              >
                {cap}
              </HoverCard>
            );
          })}
        </div>
      ))}
    </div>
  );
}
