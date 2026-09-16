import { useCallback, useEffect, useRef, useState } from "react";

/** Distance, en pixels, sur laquelle le dégradé atteint sa pleine intensité. */
const RAMP = 48;

interface ScrollFade {
  /** À poser sur le conteneur défilant. */
  ref: (node: HTMLElement | null) => void;
  /** Hauteur du dégradé haut et bas, en pixels (0 quand la butée est atteinte). */
  top: number;
  bottom: number;
}

/**
 * Suit la position de défilement d'un conteneur pour doser un fondu à chaque
 * extrémité. Les valeurs montent progressivement sur les premiers pixels, si
 * bien que le dégradé apparaît et disparaît sans à-coup aux butées.
 */
export function useScrollFade(): ScrollFade {
  const [fade, setFade] = useState({ top: 0, bottom: 0 });
  const node = useRef<HTMLElement | null>(null);

  const measure = useCallback(() => {
    const el = node.current;
    if (!el) return;

    const above = el.scrollTop;
    const below = el.scrollHeight - el.clientHeight - el.scrollTop;

    setFade(prev => {
      const top = Math.min(above, RAMP);
      const bottom = Math.min(Math.max(below, 0), RAMP);
      return prev.top === top && prev.bottom === bottom ? prev : { top, bottom };
    });
  }, []);

  // La liste change de longueur au fil des filtres : on remesure aussi sur
  // redimensionnement du contenu, pas seulement au défilement.
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

    el.addEventListener("scroll", measure, { passive: true });
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    for (const child of Array.from(el.children)) observer.observe(child);

    return () => {
      el.removeEventListener("scroll", measure);
      observer.disconnect();
    };
  }, [measure]);

  return { ref, ...fade };
}
