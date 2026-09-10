interface ComboProps {
  combo: string;
}

const KBD = `inline-block min-w-[24px] rounded-md border border-b-2 border-line bg-panel
  px-[7px] py-[3px] text-center font-sans text-xs
  dark:border-line-dark dark:bg-panel-dark`;

/** Affiche une combinaison sous forme de touches, ou l'état « non assigné ». */
export function Combo({ combo }: ComboProps) {
  if (!combo) {
    return (
      <span className="flex items-center gap-1">
        <kbd className={`${KBD} italic opacity-50`}>non assigné</kbd>
      </span>
    );
  }

  return (
    <span className="flex items-center gap-1">
      {combo.split(' ').map((key, i) => <kbd key={i} className={KBD}>{key}</kbd>)}
    </span>
  );
}
