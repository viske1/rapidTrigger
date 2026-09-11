interface IconProps {
  className?: string;
}

/** Horloge fléchée — historique des modifications. */
export function HistoryIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M2.4 8a5.6 5.6 0 1 0 1.7-4" />
      <path d="M2.2 2.6v2.6h2.6" />
      <path d="M8 5.1V8l2.1 1.3" />
    </svg>
  );
}
