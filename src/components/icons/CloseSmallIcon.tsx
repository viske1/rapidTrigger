interface IconProps {
  className?: string;
}

/** Croix — fermer. */
export function CloseSmallIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M5 5l6 6M11 5l-6 6" />
    </svg>
  );
}
