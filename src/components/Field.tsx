import type { ReactNode } from "react";

interface FieldProps {
  label: string;
  children: ReactNode;
}

/** Relief du bloc : lueur diffuse, puis arête haute plus claire. */
const RELIEF =
  "inset 0 0 4px 0 rgba(255,255,255,.1), inset 0 1.2px 0 0 rgba(255,255,255,.10)";

/** Bloc de saisie en relief : un intitulé, puis le champ. */
export function Field({ label, children }: FieldProps) {
  return (
    <div
      style={{ boxShadow: RELIEF }}
      className="flex w-full flex-col items-start justify-center rounded-[18px]
        border border-black bg-white/5 p-3"
    >
      <span className="mb-2 pl-1 text-[13px] font-medium tracking-[-0.1px] text-white">
        {label}
      </span>
      {children}
    </div>
  );
}

/** Classe commune aux contrôles placés dans un Field. */
export const FIELD_INPUT =
  `h-[34px] w-full rounded-[10px] border-0 bg-black/[.04] px-3 text-[13px]
   font-medium tracking-[-0.1px] text-content outline-none transition-all
   duration-200 placeholder:text-content/40 focus:ring-2 focus:ring-black/10
   dark:bg-white/[.06] dark:text-content-dark
   dark:placeholder:text-content-dark/40 dark:focus:ring-white/15`;
