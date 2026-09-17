interface IconProps {
  className?: string;
}

/** Clavier — raccourci. */
export function KeyboardIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="1.6" y="3.6" width="12.8" height="8.8" rx="1.8" />
      <path d="M4.2 6.2h.01M6.6 6.2h.01M9 6.2h.01M11.4 6.2h.01" strokeWidth="1.5" />
      <path d="M4.2 8.6h.01M6.6 8.6h.01M9 8.6h.01M11.4 8.6h.01" strokeWidth="1.5" />
      <path d="M5.4 10.9h5.2" />
    </svg>
  );
}
