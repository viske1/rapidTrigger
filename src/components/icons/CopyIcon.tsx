interface IconProps {
  className?: string;
}

/** Deux feuillets — dupliquer. */
export function CopyIcon({ className }: IconProps) {
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
      <rect x="5.6" y="5.6" width="7.6" height="7.6" rx="1.8" />
      <path d="M10.4 5.6V4.6a1.8 1.8 0 0 0-1.8-1.8H4.6a1.8 1.8 0 0 0-1.8 1.8v4a1.8 1.8 0 0 0 1.8 1.8h1" />
    </svg>
  );
}
