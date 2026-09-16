export type TagVariant = "neutral" | "accent" | "warn" | "danger";

interface TagProps {
  /** Texte de l'étiquette. */
  label: string;
  variant?: TagVariant;
}

const VARIANTS: Record<TagVariant, string> = {
  neutral: "bg-line text-muted dark:bg-line-dark dark:text-muted-dark",
  accent: "bg-accent/[.16] text-accent",
  warn: "bg-warn/[.16] text-warn",
  danger: "bg-danger/[.16] text-danger",
};

/** Étiquette courte : type de raccourci, état « modifié », « conflit »… */
export function Tag({ label, variant = "neutral" }: TagProps) {
  return (
    <span
      className={`rounded-[12px] px-2 text-[11px] font-medium tracking-[-0.1px]
        ${VARIANTS[variant]}`}
    >
      <span>{label}</span>
    </span>
  );
}
