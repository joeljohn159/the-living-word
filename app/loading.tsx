/**
 * Global route-level loading — open Bible with light.
 */
export default function Loading() {
  return (
    <div
      className="flex flex-col items-center justify-center min-h-[60vh] px-4"
      role="status"
      aria-label="Loading content"
    >
      <div className="relative">
        <div className="absolute -inset-16 loader-atmosphere" />
        <svg
          width="120"
          height="110"
          viewBox="0 0 200 180"
          fill="none"
          className="relative z-10"
        >
          <defs>
            <radialGradient id="rlGlow" cx="50%" cy="40%" r="50%">
              <stop offset="0%" stopColor="var(--accent-gold)" stopOpacity="0.5" />
              <stop offset="100%" stopColor="var(--accent-gold)" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="rlCoverL" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="var(--accent-gold)" stopOpacity="0.7" />
              <stop offset="100%" stopColor="var(--accent-gold)" stopOpacity="0.4" />
            </linearGradient>
            <linearGradient id="rlCoverR" x1="1" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent-gold)" stopOpacity="0.7" />
              <stop offset="100%" stopColor="var(--accent-gold)" stopOpacity="0.4" />
            </linearGradient>
            <linearGradient id="rlPage" x1="0.5" y1="0" x2="0.5" y2="1">
              <stop offset="0%" stopColor="var(--text-primary)" stopOpacity="0.12" />
              <stop offset="100%" stopColor="var(--text-primary)" stopOpacity="0.04" />
            </linearGradient>
            <linearGradient id="rlBeam" x1="0.5" y1="1" x2="0.5" y2="0">
              <stop offset="0%" stopColor="var(--accent-gold)" stopOpacity="0.25" />
              <stop offset="100%" stopColor="var(--accent-gold)" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="rlCross" x1="0.5" y1="0" x2="0.5" y2="1">
              <stop offset="0%" stopColor="var(--accent-gold)" stopOpacity="0.85" />
              <stop offset="100%" stopColor="var(--accent-gold)" stopOpacity="0.4" />
            </linearGradient>
            <filter id="rlSoftGlow"><feGaussianBlur stdDeviation="6" /></filter>
          </defs>

          {/* Glow */}
          <ellipse cx="100" cy="100" rx="80" ry="50" fill="url(#rlGlow)" filter="url(#rlSoftGlow)" className="loader-halo" />

          {/* Light beam */}
          <polygon points="80,95 120,95 112,10 88,10" fill="url(#rlBeam)" className="loader-beam" />

          {/* Cross */}
          <g className="loader-figure" style={{ transformOrigin: "100px 45px" }}>
            <rect x="97.5" y="25" width="5" height="30" rx="1.5" fill="url(#rlCross)" />
            <rect x="88" y="33" width="24" height="5" rx="1.5" fill="url(#rlCross)" />
          </g>

          {/* Book */}
          <rect x="98" y="88" width="4" height="55" rx="1" fill="var(--accent-gold)" opacity="0.3" />
          <path d="M100 90 C90 88 55 86 38 88 C34 88.5 32 90 32 93 L32 138 C32 141 34 143 38 143 L100 145 Z" fill="url(#rlCoverL)" stroke="var(--accent-gold)" strokeWidth="0.5" opacity="0.8" />
          <path d="M100 90 C110 88 145 86 162 88 C166 88.5 168 90 168 93 L168 138 C168 141 166 143 162 143 L100 145 Z" fill="url(#rlCoverR)" stroke="var(--accent-gold)" strokeWidth="0.5" opacity="0.8" />
          <path d="M100 92 C92 90.5 62 89 44 90.5 C40 91 38 92 38 94 L38 136 C38 138 40 139.5 44 139.5 L100 142 Z" fill="url(#rlPage)" />
          <path d="M100 92 C108 90.5 138 89 156 90.5 C160 91 162 92 162 94 L162 136 C162 138 160 139.5 156 139.5 L100 142 Z" fill="url(#rlPage)" />

          {/* Particles */}
          {[90, 110, 96, 104, 86].map((cx, i) => (
            <circle key={i} cx={cx} cy="92" r="0.8" fill="var(--accent-gold)" className="loader-particle" style={{ animationDelay: `${i * 0.7}s` }} />
          ))}
        </svg>
      </div>

      <p className="relative z-10 font-source-sans text-xs tracking-widest text-[var(--text-muted)] mt-2 uppercase opacity-50 animate-pulse">
        Loading
      </p>
    </div>
  );
}
