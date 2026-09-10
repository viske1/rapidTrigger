import { useEffect, useRef, useState } from "react";

/** Modificateurs suivis, dans l'ordre d'affichage macOS. */
const MODIFIERS = ["Control", "Alt", "Shift", "Meta"] as const;

const SYMBOLS: Record<string, string> = {
  Control: "⌃",
  Alt: "⌥",
  Shift: "⇧",
  Meta: "⌘",
};

interface ModifierHold {
  /** Vrai une fois le délai écoulé, tant que les touches restent enfoncées. */
  held: boolean;
  /** Symboles des modificateurs actuellement enfoncés, ex. ["⌥", "⌘"]. */
  symbols: string[];
}

/**
 * Détecte le maintien d'un ou plusieurs modificateurs pendant `delay` ms.
 *
 * Le compte à rebours redémarre à chaque changement de combinaison : ajouter
 * une touche relance l'attente plutôt que de déclencher aussitôt.
 *
 * `closeDelay` diffère la fermeture après le relâchement, pour que le panneau
 * garde son contenu pendant son animation de sortie.
 */
export function useModifierHold(delay = 1500, closeDelay = 250): ModifierHold {
  const [pressed, setPressed] = useState<string[]>([]);
  const [held, setHeld] = useState(false);
  const timer = useRef<number>();

  useEffect(() => {
    const readFrom = (e: KeyboardEvent) =>
      MODIFIERS.filter(mod => {
        if (mod === "Control") return e.ctrlKey;
        if (mod === "Alt") return e.altKey;
        if (mod === "Shift") return e.shiftKey;
        return e.metaKey;
      });

    // On lit l'état depuis l'évènement plutôt que d'accumuler les touches :
    // les keyup manquants (⌘ Tab, changement d'onglet) ne peuvent pas décaler l'état.
    const sync = (e: KeyboardEvent) => {
      const next = readFrom(e);
      setPressed(prev =>
        prev.length === next.length && prev.every((m, i) => m === next[i]) ? prev : next,
      );
    };

    const reset = () => setPressed([]);

    document.addEventListener("keydown", sync);
    document.addEventListener("keyup", sync);
    window.addEventListener("blur", reset);

    return () => {
      document.removeEventListener("keydown", sync);
      document.removeEventListener("keyup", sync);
      window.removeEventListener("blur", reset);
    };
  }, []);

  /*
   * Le délai repart de zéro dès que la combinaison change, mais une fois
   * ouvert le panneau ne se referme pas à chaud : relâcher une touche d'une
   * combinaison à plusieurs modificateurs le laisserait clignoter, et le
   * relâchement complet le ferait passer par un état vide avant sa sortie.
   * On laisse donc `held` en place jusqu'à `closeDelay` après le relâchement.
   */
  useEffect(() => {
    clearTimeout(timer.current);

    if (pressed.length === 0) {
      timer.current = window.setTimeout(() => setHeld(false), closeDelay);
      return () => clearTimeout(timer.current);
    }

    // Ouvert, on y reste : la combinaison affichée suit simplement les touches.
    if (held) return;

    timer.current = window.setTimeout(() => setHeld(true), delay);
    return () => clearTimeout(timer.current);
  }, [pressed, delay, closeDelay, held]);

  return {
    held,
    symbols: pressed.map(mod => SYMBOLS[mod]),
  };
}
