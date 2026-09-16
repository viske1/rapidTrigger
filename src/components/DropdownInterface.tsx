import { useEffect, useId, useRef, useState } from "react";
import type { ReactNode } from "react";

interface DropdownInterfaceProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  /** Côté d'alignement par rapport au déclencheur. */
  align?: "left" | "right";
  /**
   * Menu ouvert à l'intérieur d'un autre : il reste hors du registre, sans
   * quoi son ouverture fermerait le menu parent qui le contient.
   */
  nested?: boolean;
  /** Largeur et autres utilitaires du panneau. */
  className?: string;
}

/** Durée des transitions, à garder en phase avec duration-150 ci-dessous. */
const DURATION = 150;

/*
 * Un seul menu ouvert à la fois : celui qui s'ouvre demande aux autres de se
 * fermer. Le registre est partagé par toutes les instances du composant.
 */
let openMenu: string | null = null;
const closers = new Map<string, () => void>();

/**
 * Menu déroulant de l'interface : positionné sous son déclencheur, animé en
 * fade + scale depuis le haut. Le contenu est libre (slot).
 * Le parent doit porter `relative`.
 *
 * Jumeau de Dropdown, qui sert lui à la barre de menu de la maquette macOS
 * et garde son fond sombre. Les deux évoluent séparément.
 */
export function DropdownInterface({
  open,
  onClose,
  children,
  align = "left",
  nested = false,
  className = "w-64",
}: DropdownInterfaceProps) {
  const id = useId();
  const [mounted, setMounted] = useState(open);
  const [visible, setVisible] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Deux frames avant de basculer : à la première, le noeud vient d'être
  // inséré et n'a pas d'état de départ à animer.
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

  useEffect(() => {
    if (nested) return;

    closers.set(id, onClose);
    return () => {
      closers.delete(id);
      if (openMenu === id) openMenu = null;
    };
  }, [id, onClose, nested]);

  useEffect(() => {
    if (nested) return;

    if (!open) {
      if (openMenu === id) openMenu = null;
      return;
    }

    if (openMenu !== null && openMenu !== id) closers.get(openMenu)?.();
    openMenu = id;
  }, [open, id, nested]);

  // Échap ferme, ainsi qu'un clic en dehors du panneau et de son déclencheur.
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };

    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (panelRef.current?.contains(target)) return;
      // Le déclencheur gère lui-même la bascule : l'ignorer évite
      // une fermeture suivie d'une réouverture immédiate.
      if ((target as HTMLElement).closest?.("[data-dropdown-trigger]")) return;
      onClose();
    };

    document.addEventListener("keydown", onKeyDown, true);
    document.addEventListener("pointerdown", onPointerDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open, onClose]);

  if (!mounted) return null;

  return (
    <div
      ref={panelRef}
      role="menu"
      className={`absolute top-full z-50 mt-1.5 ${align === "right" ? "right-0" : "left-0"}
        ${className} origin-top rounded-[16px] p-1.5 shadow-menu
        backdrop-blur-[10px] backdrop-saturate-150
        border-gradient bg-panel/90 dark:bg-black/100
        transition-[opacity,transform] duration-150 ease-out motion-reduce:transition-none
        ${visible ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}
    >
      {children}
    </div>
  );
}
