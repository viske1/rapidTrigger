interface KeyCapProps {
  /** Symbole affiché sur la touche, ex. « ⌘ » ou « K ». */
  label: string;
  /** Rend la touche enfoncée (dégradé violet, descendue d'un cran). */
  pressed?: boolean;
}

const BASE =
  "grid h-[64px] w-[64px] place-items-center rounded-[20px] text-[22px] font-bold";

/** Touche de clavier stylisée, réutilisable hors de la maquette. */
export function KeyCap({ label, pressed = false }: KeyCapProps) {
  return (
    <span
      aria-hidden="true"
      className={`${BASE} border border-black text-white shadow-key transition-all duration-150
        ${
          pressed
            ? "translate-y-[3px] bg-gradient-to-b from-[#e6c9ff] to-[#a071e8] text-[#1b1b1e] shadow-key-pressed"
            : "bg-[#1b1b1e]"
        }
        motion-reduce:transition-none`}
    >
      {label}
    </span>
  );
}

/** Emplacement vide du dock, aux mêmes dimensions qu'une touche. */
export function KeySlot() {
  return <span aria-hidden="true" className={`${BASE} bg-white/[.16]`} />;
}
