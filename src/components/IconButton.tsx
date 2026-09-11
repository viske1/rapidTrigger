import { forwardRef } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Libellé accessible : le bouton n'a pas de texte visible. */
  label: string;
  children: ReactNode;
  /** Côté de la zone cliquable, en pixels. */
  size?: number;
  /** Rayon de la pastille de survol, en pixels. */
  radius?: number;
}

/**
 * Bouton porté par une seule icône : rien au repos, la pastille hover-pop
 * n'apparaît qu'au survol. L'icône est fournie par l'appelant, qui fixe sa
 * taille — 14 px convient à la taille par défaut de 20 px.
 */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton(
    { label, children, size = 30, radius = 10, className = "", ...props },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type="button"
        aria-label={label}
        style={{ width: size, height: size, borderRadius: radius }}
        className={`hover-pop hover-pop-surface grid shrink-0 place-items-center
          text-content/70 transition-colors duration-150
          hover:text-content focus-visible:outline-none
          disabled:pointer-events-none disabled:opacity-40
          dark:text-content-dark/70 dark:hover:text-content-dark
          motion-reduce:transition-none ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  },
);
