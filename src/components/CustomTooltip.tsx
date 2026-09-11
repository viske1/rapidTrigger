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
  showDelay?: number;
  hideDelay?: number;
  disabled?: boolean;
  /** Autorise le retour à la ligne, pour les contenus longs. */
  wrap?: boolean;
  children: ReactNode;
}

const GAP = 8;

/** Ancrage dans le déclencheur, et transformation appliquée à l'infobulle. */
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
      transform: "translateX(-50%) translateY(-100%)",
      transformOrigin: "center bottom",
      marginTop: -GAP,
    },
  },
  "top-left": {
    x: (r) => r.left,
    y: (r) => r.top,
    style: {
      transform: "translateY(-100%)",
      transformOrigin: "left bottom",
      marginTop: -GAP,
    },
  },
  "top-right": {
    x: (r) => r.right,
    y: (r) => r.top,
    style: {
      transform: "translateX(-100%) translateY(-100%)",
      transformOrigin: "right bottom",
      marginTop: -GAP,
    },
  },
  bottom: {
    x: (r) => r.left + r.width / 2,
    y: (r) => r.bottom,
    style: {
      transform: "translateX(-50%)",
      transformOrigin: "center top",
      marginTop: GAP,
    },
  },
  "bottom-left": {
    x: (r) => r.left,
    y: (r) => r.bottom,
    style: { transform: "none", transformOrigin: "left top", marginTop: GAP },
  },
  "bottom-right": {
    x: (r) => r.right,
    y: (r) => r.bottom,
    style: {
      transform: "translateX(-100%)",
      transformOrigin: "right top",
      marginTop: GAP,
    },
  },
  left: {
    x: (r) => r.left,
    y: (r) => r.top + r.height / 2,
    style: {
      transform: "translateX(-100%) translateY(-50%)",
      transformOrigin: "right center",
      marginLeft: -GAP,
    },
  },
  right: {
    x: (r) => r.right,
    y: (r) => r.top + r.height / 2,
    style: {
      transform: "translateY(-50%)",
      transformOrigin: "left center",
      marginLeft: GAP,
    },
  },
};

/**
 * Infobulle rendue dans un portail, pour échapper aux conteneurs
 * `overflow-hidden` de la page.
 *
 * Passer d'un déclencheur à un autre bascule sans animation ni délai : seule
 * la première apparition d'une série attend `showDelay`.
 */
let activeTooltip: string | null = null;
const listeners = new Map<string, () => void>();

export function CustomTooltip({
  text = "",
  content,
  position = "top",
  checkTruncation = false,
  truncationSelector,
  showDelay = 300,
  hideDelay = 300,
  disabled = false,
  wrap = false,
  children,
}: CustomTooltipProps) {
  const id = useId();
  const wrapper = useRef<HTMLSpanElement>(null);
  const showTimer = useRef<number>();
  const hideTimer = useRef<number>();

  const [visible, setVisible] = useState(false);
  const [shown, setShown] = useState(false);
  const [skipAnimation, setSkipAnimation] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });

  const hasContent = Boolean(text) || content !== undefined;

  const close = useCallback(() => {
    clearTimeout(showTimer.current);
    clearTimeout(hideTimer.current);
    setVisible(false);
    setShown(false);
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

  // Monte d'abord à l'état fermé, puis bascule une fois peint.
  useEffect(() => {
    if (!visible) {
      setShown(false);
      return;
    }
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
    }, showDelay);
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

      {visible &&
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
              // `scale` est distinct de `transform` : les deux cohabitent sans
              // que l'animation n'écrase la transformation d'ancrage.
              scale: shown ? "1" : "0.95",
            }}
            className={`pointer-events-none z-[10000] inline-block rounded-[12px]
            bg-black/60 px-3 py-1.5 text-[12px] font-medium
            tracking-[-0.1px] text-white backdrop-blur-lg
            shadow-[0_5px_8px_-2px_rgba(0,0,0,0.4)]
            ${wrap ? "whitespace-pre-line text-left" : "whitespace-nowrap"}
            ${skipAnimation ? "" : "transition-[opacity,filter,scale] duration-150 ease-in-out"}
            ${shown ? "opacity-100 blur-0" : "opacity-0 blur-[1px]"}
            motion-reduce:transition-none`}
          >
            {content ?? text}
          </div>,
          document.body,
        )}
    </span>
  );
}
