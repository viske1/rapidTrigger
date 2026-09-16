interface IconProps {
  className?: string;
}

/** Deux barres verticales — suspendre. */
export function PauseIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className={className} aria-hidden="true">
      <rect x="4" y="3" width="2.8" height="10" rx="1.2" />
      <rect x="9.2" y="3" width="2.8" height="10" rx="1.2" />
    </svg>
  );
}
