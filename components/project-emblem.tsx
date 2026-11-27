// A drawn emblem used when a project has no image yet: a glowing figure-eight loop.
export function ProjectEmblem({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} role="img" aria-label="Figure-eight knot emblem">
      <defs>
        <radialGradient id="emblem-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(150,180,255,0.35)" />
          <stop offset="100%" stopColor="rgba(150,180,255,0)" />
        </radialGradient>
      </defs>
      <rect width="200" height="200" fill="url(#emblem-glow)" />
      <path
        d="M100 30 C150 30 150 100 100 100 C50 100 50 170 100 170 C150 170 150 100 100 100 C50 100 50 30 100 30 Z"
        fill="none"
        stroke="rgba(235,242,255,0.9)"
        strokeWidth="7"
        strokeLinecap="round"
        style={{ filter: "drop-shadow(0 0 8px rgba(170,200,255,0.7))" }}
      />
      <path d="M100 170 L100 192" stroke="rgba(235,242,255,0.9)" strokeWidth="7" strokeLinecap="round" />
    </svg>
  )
}
