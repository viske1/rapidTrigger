import { useEffect, useState } from "react";

/**
 * Suit l'état de la touche ⌘ (Meta) au niveau du document.
 *
 * `blur` remet à false : macOS retient le keyup quand une combinaison système
 * prend la main (⌘ Tab, ⌘ Espace), ce qui laisserait la touche « coincée ».
 */
export function useMetaKey(): boolean {
  const [pressed, setPressed] = useState(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Meta") setPressed(true);
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Meta") setPressed(false);
    };
    const reset = () => setPressed(false);

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", reset);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", reset);
    };
  }, []);

  return pressed;
}
