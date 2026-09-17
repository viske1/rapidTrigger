interface IconProps {
  className?: string;
}

/** Trois bandes pleine largeur — liste sur une colonne. */
export function ColumnsOneIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className={className} aria-hidden="true">
      <rect x="2" y="3" width="12" height="2.6" rx="1.1" />
      <rect x="2" y="6.7" width="12" height="2.6" rx="1.1" />
      <rect x="2" y="10.4" width="12" height="2.6" rx="1.1" />
    </svg>
  );
}
