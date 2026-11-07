export default function ReelLogo({
  className = "h-7 w-7",
}: {
  className?: string;
}) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={className}>
      <rect width="64" height="64" rx="14" fill="#141414" />
      <circle cx="32" cy="32" r="24" fill="#F5B301" />
      <g fill="#141414">
        <circle cx="32" cy="32" r="4.5" />
        <circle cx="32" cy="18.5" r="5.2" />
        <circle cx="44.84" cy="27.83" r="5.2" />
        <circle cx="39.94" cy="42.92" r="5.2" />
        <circle cx="24.06" cy="42.92" r="5.2" />
        <circle cx="19.16" cy="27.83" r="5.2" />
      </g>
    </svg>
  );
}