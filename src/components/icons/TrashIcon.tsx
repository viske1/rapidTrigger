interface IconProps {
  className?: string;
}

/** Corbeille — supprimer. */
export function TrashIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M2.8 4.3h10.4" />
      <path d="M6.4 4.3V3.1a1 1 0 0 1 1-1h1.2a1 1 0 0 1 1 1v1.2" />
      <path d="M4.2 4.3l.6 8.3a1.2 1.2 0 0 0 1.2 1.1h4a1.2 1.2 0 0 0 1.2-1.1l.6-8.3" />
      <path d="M6.7 6.8v4.4M9.3 6.8v4.4" />
    </svg>
  );
}
