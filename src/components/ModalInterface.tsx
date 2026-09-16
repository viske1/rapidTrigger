import { useEffect, useId, useRef, useState } from "react";
import type { ReactNode } from "react";

interface ModalInterfaceProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  /** Titre accessible, lu par les lecteurs d'écran. */
  label?: string;
  /** Largeur maximale du panneau. */
  className?: string;
  /**
   * « fill » occupe la hauteur disponible (défaut, pour un panneau plein) ;
   * « auto » s'ajuste au contenu, pour une boîte de dialogue courte.
   */
  height?: "fill" | "auto";
  /**
   * « stable » place la modale au tiers supérieur plutôt qu'au centre : un
   * contenu qui se déploie l'agrandit alors vers le bas, sans décaler ce qui
   * le précède comme le ferait un centrage recalculé.
   */
  anchor?: "center" | "stable";
}

/** Durée des transitions, à garder en phase avec les classes duration-200 ci-dessous. */
const DURATION = 200;

/*
 * Pile des modales ouvertes. Les écouteurs vivant tous sur `document`,
 * stopPropagation ne les départage pas : seule celle du dessus réagit à Échap.
 */
const stack: string[] = [];

/*
 * Un champ peut avoir besoin d'Échap pour son propre usage — effacer une
 * combinaison en cours de capture, par exemple. Il le signale ici, et la
 * modale laisse alors passer la touche sans se fermer.
 */
let escapeHeldBy = 0;

/** À appeler tant qu'un champ capture Échap pour son propre compte. */
export function holdEscape(): () => void {
  escapeHeldBy += 1;
  return () => {
    escapeHeldBy -= 1;
  };
}

/**
 * Modale de l'interface : fond assombri, panneau en fade + scale. Toujours
 * confinée à son parent positionné, qui doit porter `relative` et
 * `overflow-hidden` — l'assombrissement ne déborde donc pas sur la maquette.
 *
 * Jumelle de Modal, qui sert au panneau ouvert depuis la barre macOS et peut
 * couvrir la fenêtre entière. Les deux évoluent séparément.
 */
export function ModalInterface({
  open,
  onClose,
  children,
  label,
  className = "max-w-3xl",
  height = "fill",
  anchor = "center",
}: ModalInterfaceProps) {
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

  // Échap ferme la modale du dessus de la pile.
  useEffect(() => {
    if (!open) return;

    stack.push(id);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || escapeHeldBy > 0) return;
      // Seule la modale au sommet de la pile se ferme.
      if (stack[stack.length - 1] !== id) return;
      onClose();
    };
    document.addEventListener("keydown", onKeyDown);

    panelRef.current?.focus();

    /*
     * Le défilement de la page n'est pas gelé : la modale vit dans le panneau,
     * dont le contenu doit rester manipulable derrière elle.
     */
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      stack.splice(stack.indexOf(id), 1);
    };
  }, [open, onClose, id]);

  if (!mounted) return null;

  return (
    <div
      className={`absolute inset-0 z-[100] flex justify-center p-4
        ${anchor === "stable" ? "items-start pt-[22%]" : "items-center"}
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
          ${height === "auto" ? "max-h-[78%]" : "h-[78%]"}
          flex flex-col overflow-hidden rounded-[20px] 
        bg-[#111113] shadow-screen outline-none backdrop-blur-sm
          transition-all duration-200 ease-out motion-reduce:transition-none
          ${visible ? "scale-100 opacity-100 blur-0" : "scale-95 opacity-0 blur-sm"}`}
      >
        {children}
      </div>
    </div>
  );
}
