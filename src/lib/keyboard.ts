/** Une touche du clavier : son symbole affiché et sa largeur relative. */
export interface KeyDef {
  /** Libellé visible. */
  label: string;
  /**
   * Symbole tel qu'il apparaît dans une combinaison, quand il diffère du
   * libellé. Absent pour les touches qui ne servent pas aux raccourcis.
   */
  combo?: string;
  /** Largeur en unités de touche (1 = touche carrée). */
  w?: number;
}

/**
 * Disposition AZERTY compacte, dans l'esprit d'un clavier Mac.
 * Les largeurs suivent celles du matériel : Tab 1.5, Maj 2.25, espace 6.25…
 */
export const KEYBOARD: KeyDef[][] = [
  [
    { label: "esc", combo: "Esc", w: 1.5 },
    { label: "1", combo: "1" }, { label: "2", combo: "2" }, { label: "3", combo: "3" },
    { label: "4", combo: "4" }, { label: "5", combo: "5" }, { label: "6", combo: "6" },
    { label: "7", combo: "7" }, { label: "8", combo: "8" }, { label: "9", combo: "9" },
    { label: "0", combo: "0" },
    { label: "⌫", combo: "⌫", w: 1.5 },
  ],
  [
    { label: "⇥", combo: "Tab", w: 1.5 },
    { label: "A", combo: "A" }, { label: "Z", combo: "Z" }, { label: "E", combo: "E" },
    { label: "R", combo: "R" }, { label: "T", combo: "T" }, { label: "Y", combo: "Y" },
    { label: "U", combo: "U" }, { label: "I", combo: "I" }, { label: "O", combo: "O" },
    { label: "P", combo: "P" },
    { label: "^", combo: "^", w: 1.5 },
  ],
  [
    { label: "⇪", w: 1.75 },
    { label: "Q", combo: "Q" }, { label: "S", combo: "S" }, { label: "D", combo: "D" },
    { label: "F", combo: "F" }, { label: "G", combo: "G" }, { label: "H", combo: "H" },
    { label: "J", combo: "J" }, { label: "K", combo: "K" }, { label: "L", combo: "L" },
    { label: "M", combo: "M" },
    { label: "↩", combo: "↩", w: 1.25 },
  ],
  [
    { label: "⇧", combo: "⇧", w: 2.25 },
    { label: "W", combo: "W" }, { label: "X", combo: "X" }, { label: "C", combo: "C" },
    { label: "V", combo: "V" }, { label: "B", combo: "B" }, { label: "N", combo: "N" },
    { label: ",", combo: "," }, { label: ";", combo: ";" }, { label: ":", combo: ":" },
    { label: "⇧", combo: "⇧", w: 2.25 },
  ],
  [
    { label: "fn", w: 1.25 },
    { label: "⌃", combo: "⌃", w: 1.25 },
    { label: "⌥", combo: "⌥", w: 1.25 },
    { label: "⌘", combo: "⌘", w: 1.5 },
    { label: "", combo: "Espace", w: 5.5 },
    { label: "⌘", combo: "⌘", w: 1.5 },
    { label: "⌥", combo: "⌥", w: 1.25 },
    { label: "←", combo: "←" }, { label: "↑", combo: "↑" },
    { label: "↓", combo: "↓" }, { label: "→", combo: "→" },
  ],
];
