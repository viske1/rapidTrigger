interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** Texte affiché à droite de l'interrupteur. */
  label: string;
  disabled?: boolean;
}

/**
 * Interrupteur à bascule.
 *
 * La case native reste dans le DOM, rendue invisible mais focalisable : elle
 * porte l'accessibilité et le clavier, la piste visible n'étant qu'un habillage.
 */
export function Switch({
  checked,
  onChange,
  label,
  disabled = false,
}: SwitchProps) {
  return (
    <label
      className={`group flex items-center gap-2.5 text-[13px] text-muted dark:text-white w-full justify-between
        ${disabled ? "cursor-default opacity-50" : "cursor-pointer"}`}
    >
      <span>{label}</span>

      <input
        type="checkbox"
        role="switch"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="peer sr-only"
      />
      <span
        aria-hidden="true"
        className={`relative h-[18px] w-[30px] shrink-0 rounded-full transition-colors duration-200
          peer-focus-visible:ring-2 peer-focus-visible:ring-accent/60
          motion-reduce:transition-none border
          ${
            checked
              ? "bg-[#00d8c9b9] dark:border-[#14cbbfc3]"
              : "bg-black/15 dark:bg-white/15 group-hover:bg-black/20 dark:group-hover:bg-white/20 dark:border-white/10"
          }`}
      >
        <span
          className={`absolute top-1/2 h-[12px] w-[12px] -translate-y-1/2 rounded-full bg-white
            shadow-sm transition-[left] duration-200 ease-out motion-reduce:transition-none border
            ${checked ? "left-[14px] border-transparent" : "left-[2px] border-transparent"}`}
        />
      </span>
    </label>
  );
}
