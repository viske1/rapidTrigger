import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { ReactNode } from "react";

interface HoverCardProps {
  /** Contenu du panneau ; il reste ouvert quand la souris s'y déplace. */
  content: ReactNode;
  children: ReactNode;
  showDelay?: number;
  hideDelay?: number;
  disabled?: boolean;
  className?: string;
}

/** Hauteur présumée du panneau, pour décider du sens d'ouverture. */
const ESTIMATED_HEIGHT = 260;

/** Durée des transitions, à garder en phase avec duration-[175ms] ci-dessous. */
const DURATION = 175;

/**
 * Panneau au survol, à la différence de CustomTooltip : la souris peut y
 * entrer sans qu'il se ferme, ce qui permet d'y cliquer.
 *
 * La fermeture est simplement différée, et tout survol du panneau annule ce
 * report — un pont invisible couvre l'espace entre le déclencheur et lui.
 */
export function HoverCard({
  content, children, showDelay = 120, hideDelay = 180,
  disabled = false, className = "w-[260px]",
}: HoverCardProps) {
  const anchor = useRef<HTMLSpanElement>(null);
  const showTimer = useRef<number>();
  const hideTimer = useRef<number>();

  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [shown, setShown] = useState(false);
  /* `above` : le panneau se déploie au-dessus du déclencheur. */
  const [coords, setCoords] = useState({ x: 0, y: 0, above: true });

  const cancelClose = useCallback(() => clearTimeout(hideTimer.current), []);

  /*
   * Le clavier occupe le bas de l'écran : le panneau s'ouvre donc vers le
   * haut, et ne bascule vers le bas que si la place manque au-dessus.
   */
  function place() {
    const rect = anchor.current?.getBoundingClientRect();
    if (!rect) return;

    const above = rect.top > ESTIMATED_HEIGHT || rect.top > window.innerHeight - rect.bottom;
    setCoords({
      x: rect.left + rect.width / 2,
      y: above ? rect.top : rect.bottom,
      above,
    });
  }

  function handleEnter() {
    if (disabled) return;
    cancelClose();
    place();
    showTimer.current = window.setTimeout(() => {
      place();
      setOpen(true);
    }, showDelay);
  }

  function handleLeave() {
    clearTimeout(showTimer.current);
    hideTimer.current = window.setTimeout(() => setOpen(false), hideDelay);
  }

  // Deux frames avant de basculer : le noeud doit être peint pour s'animer.
  useEffect(() => {
    if (!open) {
      setShown(false);
      const timer = setTimeout(() => setMounted(false), DURATION);
      return () => clearTimeout(timer);
    }

    setMounted(true);
    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => setShown(true));
    });
    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, [open]);

  useEffect(() => () => {
    clearTimeout(showTimer.current);
    clearTimeout(hideTimer.current);
  }, []);

  return (
    <span
      ref={anchor}
      className="relative inline-flex"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      {children}

      {mounted && createPortal(
        <div
          style={{
            position: "fixed",
            left: coords.x,
            top: coords.y,
            transform:
              `translateX(-50%) ${coords.above ? "translateY(-100%) " : ""}` +
              `scale(${shown ? 1 : 0.85})`,
            transformOrigin: coords.above ? "bottom center" : "top center",
            opacity: shown ? 1 : 0,
            transition: "opacity 175ms ease-out, transform 175ms ease-out",
            pointerEvents: open ? undefined : "none",
          }}
          className={`z-[10000] ${coords.above ? "pb-2" : "pt-2"}`}
          onMouseEnter={() => {
            cancelClose();
            // Le panneau reste monté pendant sa sortie : y revenir le rouvre
            // plutôt que de le laisser disparaître à moitié.
            setOpen(true);
          }}
          onMouseLeave={handleLeave}
        >
          <div
            className={`${className} overflow-hidden rounded-[14px] border border-black
              bg-[#111113] p-1.5`}
            style={{
              boxShadow:
                "inset 0 0 8px 0 rgba(255,255,255,.08), inset 0 1.2px 0 0 rgba(255,255,255,.08)," +
                " 0 4px 10px rgba(0,0,0,.5), 0 16px 32px rgba(0,0,0,.65)",
            }}
          >
            {content}
          </div>
        </div>,
        document.body,
      )}
    </span>
  );
}
