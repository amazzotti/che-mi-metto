/** Il logo: una gruccia con un sole, disegnata in SVG. */
export function Logo({ dimensione = 64 }: { dimensione?: number }) {
  return (
    <svg width={dimensione} height={dimensione} viewBox="0 0 64 64" aria-hidden="true" className="logo">
      <rect width="64" height="64" rx="16" fill="var(--terracotta)" />
      <circle cx="44" cy="19" r="7" fill="#f6d28b" />
      <path
        d="M32 21a4 4 0 1 1 4-4M32 21v3L12 38a3 3 0 0 0 1.7 5.4h36.6A3 3 0 0 0 52 38L32 24"
        fill="none"
        stroke="#fffaf3"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
