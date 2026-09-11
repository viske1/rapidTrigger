import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { CSSProperties, ReactNode } from "react";

export type TooltipPosition =
  | "top"
  | "top-left"
  | "top-right"
  | "bottom"
  | "bottom-left"
  | "bottom-right"
  | "left"
  | "right";

interface CustomTooltipProps {
  /** Texte affiché ; ignoré si `content` est fourni. */
  text?: string;
  /** Contenu riche, à la place du texte. */
  content?: ReactNode;
  position?: TooltipPosition;
  /** N'affiche l'infobulle que si le contenu survolé est tronqué. */
  checkTruncation?: boolean;
  /** Sélecteur de l'élément dont mesurer la troncature, cherché dans le déclencheur. */
  truncationSelector?: string;
  /** Délai avant affichage au survol, en millisecondes. */
  delay?: number;
  /** Délai avant disparition une fois le survol quitté. */
  hideDelay?: number;
  disabled?: boolean;
  /** Autorise le retour à la ligne, pour les contenus longs. */
  wrap?: boolean;
  children: ReactNode;
}

const GAP = 8;

/** Durée des transitions, à garder en phase avec duration-[175ms] ci-dessous. */
const DURATION = 100;

/**
 * Ancrage dans le déclencheur, et transformation appliquée à l'infobulle.
 * L'origine du scale reste au centre (défaut CSS) : elle n'est donc pas
 * redéfinie par position.
 */
const ANCHORS: Record<
  TooltipPosition,
  {
    x: (r: DOMRect) => number;
    y: (r: DOMRect) => number;
    style: CSSProperties;
  }
> = {
  top: {
    x: (r) => r.left + r.width / 2,
    y: (r) => r.top,
    style: {
      transformOrigin: "bottom center",
      transform: "translateX(-50%) translateY(-100%)",
      marginTop: -GAP,
    },
  },
  "top-left": {
    x: (r) => r.left,
    y: (r) => r.top,
    style: {
      transformOrigin: "bottom left",
      transform: "translateY(-100%)",
      marginTop: -GAP,
    },
  },
  "top-right": {
    x: (r) => r.right,
    y: (r) => r.top,
    style: {
      transformOrigin: "bottom right",
      transform: "translateX(-100%) translateY(-100%)",
      marginTop: -GAP,
    },
  },
  bottom: {
    x: (r) => r.left + r.width / 2,
    y: (r) => r.bottom,
    style: {
      transformOrigin: "top center",
      transform: "translateX(-50%)",
      marginTop: GAP,
    },
  },
  "bottom-left": {
    x: (r) => r.left,
    y: (r) => r.bottom,
    style: {
      transformOrigin: "top left",
      transform: "",
      marginTop: GAP,
    },
  },
  "bottom-right": {
    x: (r) => r.right,
    y: (r) => r.bottom,
    style: {
      transformOrigin: "top right",
      transform: "translateX(-100%)",
      marginTop: GAP,
    },
  },
  left: {
    x: (r) => r.left,
    y: (r) => r.top + r.height / 2,
    style: {
      transformOrigin: "right center",
      transform: "translateX(-100%) translateY(-50%)",
      marginLeft: -GAP,
    },
  },
  right: {
    x: (r) => r.right,
    y: (r) => r.top + r.height / 2,
    style: {
      transformOrigin: "left center",
      transform: "translateY(-50%)",
      marginLeft: GAP,
    },
  },
};

/**
 * Infobulle rendue dans un portail, pour échapper aux conteneurs
 * `overflow-hidden` de la page.
 *
 * Passer d'un déclencheur à un autre bascule sans animation ni délai : seule
 * la première apparition d'une série attend `delay`.
 */
let activeTooltip: string | null = null;
const listeners = new Map<string, () => void>();

export function CustomTooltip({
  text = "",
  content,
  position = "top",
  checkTruncation = false,
  truncationSelector,
  delay = 0,
  hideDelay = 0,
  disabled = false,
  wrap = false,
  children,
}: CustomTooltipProps) {
  const id = useId();
  const wrapper = useRef<HTMLSpanElement>(null);
  const showTimer = useRef<number>();
  const hideTimer = useRef<number>();

  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [shown, setShown] = useState(false);
  const [skipAnimation, setSkipAnimation] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });

  const hasContent = Boolean(text) || content !== undefined;

  // Fermeture immédiate, sans transition : utilisée quand une autre infobulle
  // prend la main, où laisser celle-ci s'animer la ferait traîner.
  const close = useCallback(() => {
    clearTimeout(showTimer.current);
    clearTimeout(hideTimer.current);
    setVisible(false);
    setShown(false);
    setMounted(false);
    if (activeTooltip === id) activeTooltip = null;
  }, [id]);

  // Une autre infobulle qui s'ouvre demande la fermeture immédiate de celle-ci.
  useEffect(() => {
    listeners.set(id, close);
    return () => {
      listeners.delete(id);
      clearTimeout(showTimer.current);
      clearTimeout(hideTimer.current);
      if (activeTooltip === id) activeTooltip = null;
    };
  }, [id, close]);

  // Monte d'abord à l'état fermé, puis bascule une fois peint. À la
  // fermeture, l'élément reste monté le temps de la transition de sortie.
  useEffect(() => {
    if (!visible) {
      setShown(false);
      if (skipAnimation) {
        setMounted(false);
        return;
      }
      const timer = setTimeout(() => setMounted(false), DURATION);
      return () => clearTimeout(timer);
    }

    setMounted(true);
    if (skipAnimation) {
      setShown(true);
      return;
    }

    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => setShown(true));
    });
    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, [visible, skipAnimation]);

  function isTruncated(): boolean {
    if (!checkTruncation) return true;
    const root = wrapper.current;
    if (!root) return false;

    const target = truncationSelector
      ? root.querySelector(truncationSelector)
      : (root.firstElementChild ?? root);

    return (
      target instanceof HTMLElement && target.scrollWidth > target.clientWidth
    );
  }

  function place() {
    const rect = wrapper.current?.getBoundingClientRect();
    if (!rect) return;
    const anchor = ANCHORS[position];
    setCoords({ x: anchor.x(rect), y: anchor.y(rect) });
  }

  function handleEnter() {
    if (disabled || !hasContent || !isTruncated()) return;

    clearTimeout(hideTimer.current);
    place();

    // Une autre infobulle déjà ouverte : on échange sans délai ni animation.
    const quickSwitch = activeTooltip !== null && activeTooltip !== id;
    if (quickSwitch) {
      listeners.get(activeTooltip!)?.();
      setSkipAnimation(true);
      setVisible(true);
      activeTooltip = id;
      return;
    }

    setSkipAnimation(false);
    showTimer.current = window.setTimeout(() => {
      place();
      setVisible(true);
      activeTooltip = id;
    }, delay);
  }

  function handleLeave() {
    clearTimeout(showTimer.current);
    hideTimer.current = window.setTimeout(() => {
      setSkipAnimation(false);
      setVisible(false);
      if (activeTooltip === id) activeTooltip = null;
    }, hideDelay);
  }

  return (
    <span
      ref={wrapper}
      className="relative inline-flex"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onFocus={handleEnter}
      onBlur={handleLeave}
    >
      {children}

      {mounted &&
        createPortal(
          <div
            role="tooltip"
            style={{
              position: "fixed",
              left: coords.x,
              top: coords.y,
              width: "max-content",
              maxWidth: 300,
              willChange: "transform, opacity",
              ...ANCHORS[position].style,
              /*
               * L'échelle est composée dans `transform`, après le translate
               * d'ancrage : la propriété `scale`, elle, s'applique AVANT lui,
               * si bien que le décalage se retrouvait mis à l'échelle et que
               * l'infobulle glissait latéralement en grandissant.
               */
              transform: `${ANCHORS[position].style.transform ?? ""} scale(${
                shown ? 1 : 0.85
              })`.trim(),
            }}
            className={`pointer-events-none z-[10000] inline-block rounded-[12px]
            bg-black/55 px-3 py-1.5 text-[12px] font-medium
            tracking-[-0.1px] text-white backdrop-blur-lg
            shadow-[0_5px_8px_-2px_rgba(0,0,0,0.4)]
            ${wrap ? "whitespace-pre-line text-left" : "whitespace-nowrap"}
            ${skipAnimation ? "" : "transition-[opacity,transform] duration-[175ms] ease-out"}
            ${shown ? "opacity-100" : "opacity-0"}
            motion-reduce:transition-none`}
          >
            {content ?? text}
          </div>,
          document.body,
        )}
    </span>
  );
}
