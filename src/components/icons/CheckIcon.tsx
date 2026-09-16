interface IconProps {
  className?: string;
}

/** Coche — élément sélectionné. */
export function CheckIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M3 8.4 6.3 11.7 13 5" />
    </svg>
  );
}
