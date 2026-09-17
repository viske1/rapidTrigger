/**
 * Apparence commune aux touches — clavier de synthèse et combinaisons de la
 * liste. Le relief vient d'un dégradé vertical, d'une arête haute claire et
 * d'une ombre portée, plutôt que d'une transformation.
 */
export const KEY_CAP =
  "bg-gradient-to-b from-white/[.09] to-white/[.04] text-white/85 " +
  "shadow-[0_1px_0_0_rgba(0,0,0,.5),inset_0_1px_0_0_rgba(255,255,255,.08)]";

/** Touche éteinte, pour un emplacement non assigné. */
export const KEY_CAP_MUTED =
  "bg-gradient-to-b from-white/[.05] to-white/[.02] text-white/35 " +
  "shadow-[0_1px_0_0_rgba(0,0,0,.35),inset_0_1px_0_0_rgba(255,255,255,.05)]";
