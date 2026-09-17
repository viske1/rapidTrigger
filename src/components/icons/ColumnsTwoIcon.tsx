interface IconProps {
  className?: string;
}

/** Deux colonnes de bandes — liste sur deux colonnes. */
export function ColumnsTwoIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className={className} aria-hidden="true">
      <rect x="2" y="3" width="5.4" height="2.6" rx="1.1" />
      <rect x="8.6" y="3" width="5.4" height="2.6" rx="1.1" />
      <rect x="2" y="6.7" width="5.4" height="2.6" rx="1.1" />
      <rect x="8.6" y="6.7" width="5.4" height="2.6" rx="1.1" />
      <rect x="2" y="10.4" width="5.4" height="2.6" rx="1.1" />
      <rect x="8.6" y="10.4" width="5.4" height="2.6" rx="1.1" />
    </svg>
  );
}
