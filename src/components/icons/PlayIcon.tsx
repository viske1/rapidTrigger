interface IconProps {
  className?: string;
}

/** Triangle — reprendre. */
export function PlayIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className={className} aria-hidden="true">
      <path d="M5.2 3.4a1 1 0 0 1 1.53-.85l6.1 4.6a1 1 0 0 1 0 1.7l-6.1 4.6A1 1 0 0 1 5.2 12.6V3.4Z" />
    </svg>
  );
}
