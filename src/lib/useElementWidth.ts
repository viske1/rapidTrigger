import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Suit la largeur d'un élément.
 *
 * La mesure porte sur le conteneur réel plutôt que sur la fenêtre : la liste
 * vit dans une modale dont la largeur ne suit pas celle du viewport.
 */
export function useElementWidth(): [(node: HTMLElement | null) => void, number] {
  const [width, setWidth] = useState(0);
  const node = useRef<HTMLElement | null>(null);

  const measure = useCallback(() => {
    const el = node.current;
    if (el) setWidth(el.clientWidth);
  }, []);

  const ref = useCallback(
    (el: HTMLElement | null) => {
      node.current = el;
      measure();
    },
    [measure],
  );

  useEffect(() => {
    const el = node.current;
    if (!el) return;

    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [measure]);

  return [ref, width];
}
