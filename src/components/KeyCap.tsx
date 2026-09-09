interface KeyCapProps {
  /** Symbole affiché sur la touche, ex. « ⌘ » ou « K ». */
  label: string;
  /** Rend la touche enfoncée (dégradé violet, descendue d'un cran). */
  pressed?: boolean;
}

/** Touche de clavier stylisée, réutilisable hors de la maquette. */
export function KeyCap({ label, pressed = false }: KeyCapProps) {
  return (
    <span className={`key-cap ${pressed ? 'pressed' : ''}`} aria-hidden="true">
      {label}
    </span>
  );
}

/** Emplacement vide du dock, aux mêmes dimensions qu'une touche. */
export function KeySlot() {
  return <span className="key-slot" aria-hidden="true" />;
}
