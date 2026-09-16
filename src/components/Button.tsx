import { forwardRef } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant = "ghost" | "flat" | "solid";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  /**
   * « ghost » : rien au repos, le fond n'apparaît qu'au survol.
   * « flat » : fond discret permanent.
   * « solid » : fond marqué, pour l'action principale.
   */
  variant?: ButtonVariant;
  /** Maintient l'état de survol, par exemple tant qu'un menu est ouvert. */
  active?: boolean;
  /** Icône placée devant le libellé. */
  icon?: ReactNode;
}

/** Relief des variantes à fond : lueur diffuse, puis arête haute plus claire. */
const RELIEF =
  "inset 0 0 4px 0 rgba(255,255,255,.1), inset 0 1.2px 0 0 rgba(255,255,255,.10)";

const VARIANTS: Record<ButtonVariant, string> = {
  // Comme IconButton : la pastille hover-pop porte seule le survol.
  ghost:
    "hover-pop hover-pop-surface text-content/70 hover:text-content " +
    "dark:text-content-dark/70 dark:hover:text-content-dark",
  flat:
    "bg-black/[.05] text-content hover:bg-black/[.08] " +
    "dark:bg-white/[.07] dark:text-content-dark dark:hover:bg-white/[.1]",
  solid:
    "bg-gradient-to-b from-accent to-accent-strong text-white " +
    "hover:brightness-110 border border-black",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      children,
      variant = "ghost",
      active = false,
      icon,
      className = "",
      style,
      ...props
    },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type="button"
        data-active={active || undefined}
        style={variant === "ghost" ? style : { boxShadow: RELIEF, ...style }}
        className={`inline-flex h-[30px] shrink-0 items-center justify-center gap-1.5
          rounded-[10px] px-3 text-[13px] font-medium tracking-[-0.1px]
          transition-colors duration-150 focus-visible:outline-none
          disabled:pointer-events-none disabled:opacity-40
          motion-reduce:transition-none
          ${VARIANTS[variant]} ${className}`}
        {...props}
      >
        {icon && <span className="shrink-0">{icon}</span>}
        {children}
      </button>
    );
  },
);
