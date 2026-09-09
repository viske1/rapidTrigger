interface ComboProps {
  combo: string;
}

/** Affiche une combinaison sous forme de touches, ou l'état « non assigné ». */
export function Combo({ combo }: ComboProps) {
  if (!combo) {
    return <span className="combo empty"><kbd>non assigné</kbd></span>;
  }
  return (
    <span className="combo">
      {combo.split(' ').map((key, i) => <kbd key={i}>{key}</kbd>)}
    </span>
  );
}
