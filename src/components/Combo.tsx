import { KEY_CAP, KEY_CAP_MUTED } from "../lib/keyStyle";

interface ComboProps {
  combo: string;
}

/** Même gabarit que les touches du clavier de synthèse, en plus compact. */
const KBD =
  "inline-grid h-[24px] min-w-[24px] place-items-center rounded-[6px] px-1.5 " +
  "font-sans text-[11px] font-medium leading-none";

/** Affiche une combinaison sous forme de touches, ou l'état « non assigné ». */
export function Combo({ combo }: ComboProps) {
  if (!combo) {
    return (
      <span className="flex items-center gap-1">
        <kbd className={`${KBD} ${KEY_CAP_MUTED} px-2 italic`}>non assigné</kbd>
      </span>
    );
  }

  return (
    <span className="flex items-center gap-1">
      {combo.split(" ").map((key, i) => (
        <kbd key={i} className={`${KBD} ${KEY_CAP}`}>
          {key}
        </kbd>
      ))}
    </span>
  );
}
