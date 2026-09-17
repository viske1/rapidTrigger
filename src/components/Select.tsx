import { useState } from "react";
import { DropdownInterface } from "./DropdownInterface";
import { ButtonOptionInterface } from "./ButtonOptionInterface";
import { UnfoldMoreIcon } from "./icons/UnfoldMoreIcon";
import { CheckIcon } from "./icons/CheckIcon";

export interface SelectOption<T extends string> {
  value: T;
  label: string;
}

interface SelectProps<T extends string> {
  value: T;
  options: SelectOption<T>[];
  onChange: (value: T) => void;
  label?: string;
}

/** Liste déroulante bâtie sur DropdownInterface, en place du select natif. */
export function Select<T extends string>({
  value, options, onChange, label,
}: SelectProps<T>) {
  const [open, setOpen] = useState(false);
  const current = options.find(o => o.value === value);

  return (
    <div className="relative w-full">
      <button
        type="button"
        data-dropdown-trigger
        data-active={open || undefined}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
        onClick={() => setOpen(o => !o)}
        className="flex h-[34px] w-full items-center justify-between gap-2 rounded-[10px]
          border-0 bg-black/[.04] px-3 text-[13px] font-medium tracking-[-0.1px]
          text-content outline-none transition-all duration-200
          focus:ring-2 focus:ring-black/10
          dark:bg-white/[.06] dark:text-content-dark dark:focus:ring-white/15"
      >
        <span className="truncate">{current?.label}</span>
        <UnfoldMoreIcon className="h-4 w-4 shrink-0 text-content/50 dark:text-content-dark/50" />
      </button>

      <DropdownInterface open={open} onClose={() => setOpen(false)} className="w-full">
        {options.map(option => (
          <ButtonOptionInterface
            key={option.value}
            label={option.label}
            icon={
              option.value === value
                ? <CheckIcon className="h-4 w-4" />
                : <span className="block h-4 w-4" />
            }
            onClick={() => {
              onChange(option.value);
              setOpen(false);
            }}
          />
        ))}
      </DropdownInterface>
    </div>
  );
}
