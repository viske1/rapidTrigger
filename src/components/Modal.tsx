import { useEffect, useId, useRef, useState } from "react";
import type { ReactNode } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  /** Titre accessible, lu par les lecteurs d'écran. */
  label?: string;
  /** Largeur maximale du panneau. */
  className?: string;
  /**
   * Confine la modale à son parent positionné plutôt qu'à la fenêtre.
   * Le parent doit porter `relative` et `overflow-hidden`.
   */
  contained?: boolean;
  /**
   * « fill » occupe la hauteur disponible (défaut, pour un panneau plein) ;
   * « auto » s'ajuste au contenu, pour une boîte de dialogue courte.
   */
  height?: "fill" | "auto";
}

/** Durée des transitions, à garder en phase avec les classes duration-200 ci-dessous. */
const DURATION = 200;

/*
 * Pile des modales ouvertes. Les écouteurs vivant tous sur `document`,
 * stopPropagation ne les départage pas : seule celle du dessus réagit à Échap.
 */
const stack: string[] = [];

/**
 * Modale générique : fond assombri et flouté, panneau en fade + scale.
 * Reste montée le temps de l'animation de sortie avant d'être retirée du DOM.
 */
export function Modal({
  open,
  onClose,
  children,
  label,
  className = "max-w-3xl",
  contained = false,
  height = "fill",
}: ModalProps) {
  const id = useId();
  const [mounted, setMounted] = useState(open);
  const [visible, setVisible] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  // Monte d'abord à l'état fermé, puis bascule une fois le panneau peint.
  // Deux frames sont nécessaires : à la première, le noeud vient d'être inséré
  // et le navigateur n'a pas encore calculé son style de départ — basculer là
  // ferait sauter la transition d'ouverture.
  useEffect(() => {
    if (!open) {
      setVisible(false);
      const timer = setTimeout(() => setMounted(false), DURATION);
      return () => clearTimeout(timer);
    }

    setMounted(true);
    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => setVisible(true));
    });

    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, [open]);

  // Échap ferme, et le défilement de la page est gelé tant que la modale est ouverte.
  useEffect(() => {
    if (!open) return;

    stack.push(id);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      // Seule la modale au sommet de la pile se ferme.
      if (stack[stack.length - 1] !== id) return;
      onClose();
    };
    document.addEventListener("keydown", onKeyDown);

    panelRef.current?.focus();

    if (contained) {
      return () => {
        document.removeEventListener("keydown", onKeyDown);
        stack.splice(stack.indexOf(id), 1);
      };
    }

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      stack.splice(stack.indexOf(id), 1);
      document.body.style.overflow = previous;
    };
  }, [open, onClose, contained, id]);

  if (!mounted) return null;

  return (
    <div
      className={`${contained ? "absolute" : "fixed"} inset-0 z-[100] flex items-center justify-center p-4
        transition-opacity duration-200 ease-out
        ${visible ? "opacity-100" : "opacity-0"}`}
      onClick={(e) => {
        // Le panneau arrête la propagation : tout clic qui remonte jusqu'ici
        // vient donc de l'extérieur (conteneur ou fond assombri).
        if (e.target === e.currentTarget || e.target === backdropRef.current)
          onClose();
      }}
    >
      <div
        ref={backdropRef}
        aria-hidden="true"
        className={`absolute inset-0 bg-black/60 transition-opacity duration-200
          ${visible ? "opacity-100" : "opacity-0"}`}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        aria-label={label}
        tabIndex={-1}
        className={`relative w-full ${className}
          ${
            height === "auto"
              ? contained
                ? "max-h-[86%]"
                : "max-h-[90vh]"
              : contained
                ? "h-[86%]"
                : "h-[90vh]"
          }
          flex flex-col overflow-hidden rounded-[32px]
          border border-white/10 bg-black/80 shadow-screen outline-none backdrop-blur-md
          transition-all duration-200 ease-out motion-reduce:transition-none
          ${visible ? "scale-100 opacity-100 blur-0" : "scale-95 opacity-0 blur-sm"}`}
      >
        {children}
      </div>
    </div>
  );
}
