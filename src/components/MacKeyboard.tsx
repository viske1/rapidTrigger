import { useMemo } from "react";
import type { CSSProperties } from "react";
import { KEYBOARD } from "../lib/keyboard";
import { keyUsageMap } from "../lib/keyUsage";
import { HoverCard } from "./HoverCard";
import { KeyShortcutList } from "./KeyShortcutList";
import { KEY_CAP } from "../lib/keyStyle";
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
  /** Anime l'arrivée de chaque touche, avec un retard propre à chacune. */
  animateKeys?: boolean;
  onSelect?: (id: string) => void;
}

/** Proportions rapportées à la hauteur d'une touche. */
const GAP_RATIO = 3 / 26;
const RADIUS_RATIO = 6 / 26;
const FONT_RATIO = 10 / 26;

/**
 * Clavier Mac en pseudo-3D.
 *
 * Une touche s'éclaire d'autant plus qu'elle sert souvent, et passe en pleine
 * lumière quand elle appartient à la combinaison mise en avant. Le relief vient
 * de trois couches CSS plutôt que d'une transformation, ce qui garde le rendu
 * net et évite les problèmes d'empilement.
 */
export function MacKeyboard({
  shortcuts = [],
  highlight = "",
  unit = 26,
  interactive = false,
  animateKeys = false,
  onSelect,
}: MacKeyboardProps) {
  const gap = Math.round(unit * GAP_RATIO);
  const radius = Math.round(unit * RADIUS_RATIO);
  const fontSize = Math.round(unit * FONT_RATIO);

  const usage = useMemo(() => keyUsageMap(shortcuts), [shortcuts]);

  /*
   * Retard propre à chaque touche : dérivé de ses coordonnées plutôt que tiré
   * au hasard, pour qu'il reste le même d'une ouverture à l'autre. La diagonale
   * donne la vague d'ensemble, le sinus la disperse.
   */
  const keyDelay = (x: number, y: number) => {
    const wave = (x + y * 2) * 9;
    const jitter = Math.abs(Math.sin(x * 12.9898 + y * 78.233)) * 90;
    return Math.round(wave + jitter);
  };

  /*
   * Hauteur de chute propre à chaque touche : de 40 à 80 px environ. Une
   * amplitude uniforme donnait un rideau trop régulier ; en la faisant varier
   * fortement, certaines touches semblent tomber de bien plus haut.
   */
  const keyRise = (x: number, y: number) => {
    const spread = Math.abs(Math.sin(x * 45.164 + y * 23.789));
    return Math.round(40 + spread * spread * 40);
  };
  const lit = useMemo(
    () => new Set(highlight.split(" ").filter(Boolean)),
    [highlight],
  );

  return (
    <div
      style={{
        gap,
      }}
      className="flex w-full flex-col items-center rounded-[14px]
        p-2"
    >
      {KEYBOARD.map((row, y) => (
        <div
          key={y}
          className="flex"
          style={{
            height: unit,
            gap,
          }}
        >
          {row.map((key, x) => {
            const width = (key.w ?? 1) * unit + ((key.w ?? 1) - 1) * gap;
            const used = key.combo ? usage.get(key.combo) : undefined;
            const active = key.combo !== undefined && lit.has(key.combo);

            const cap = (
              <span
                style={{
                  width,
                  height: unit,
                  ...(animateKeys
                    ? ({
                        "--key-delay": `${keyDelay(x, y)}ms`,
                        "--key-rise": `${keyRise(x, y)}px`,
                      } as CSSProperties)
                    : undefined),
                  borderRadius: radius,
                  fontSize,
                  transition:
                    "background-color 200ms ease-out, box-shadow 200ms ease-out",
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
                className={`grid shrink-0 place-items-center
                  ${animateKeys ? "key-cap-anim" : ""}
                  font-medium leading-none motion-reduce:transition-none
                  ${
                    active
                      ? "bg-gradient-to-b from-accent to-accent-strong text-white " +
                        "shadow-[0_0_14px_0_rgba(91,140,255,.7),inset_0_1px_0_0_rgba(255,255,255,.35)]"
                      : used
                        ? "text-white/85"
                        : KEY_CAP
                  }
                  ${interactive && used ? "cursor-pointer" : ""}`}
              >
                {key.label}
              </span>
            );

            /*
              Toujours le même noeud, quel que soit le mode : changer de
              balise démonterait la touche, qui repartirait à sa taille
              finale sans transition — le clavier se disloquerait alors,
              les touches sans panneau étant seules à s'animer.
            */
            return (
              <HoverCard
                key={x}
                className="w-[240px]"
                disabled={!interactive || !used}
                content={
                  used ? (
                    <KeyShortcutList
                      keyLabel={key.combo!}
                      shortcuts={used.shortcuts}
                      onSelect={onSelect}
                    />
                  ) : null
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
