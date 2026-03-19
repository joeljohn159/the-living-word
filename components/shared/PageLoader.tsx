"use client";

import { useState, useEffect } from "react";

export function PageLoader({ children }: { children: React.ReactNode }) {
  const [loaded, setLoaded] = useState(false);
  const [visible, setVisible] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const onReady = () => {
      setLoaded(true);
      setTimeout(() => setVisible(false), 900);
    };

    if (document.readyState === "complete") {
      requestAnimationFrame(() => onReady());
    } else {
      window.addEventListener("load", onReady);
      return () => window.removeEventListener("load", onReady);
    }
  }, [mounted]);

  return (
    <>
      {visible && (
        <div
          className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[var(--bg-primary)] transition-opacity duration-900 ${
            loaded ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
          aria-hidden={loaded}
          suppressHydrationWarning
        >
          <div className="relative flex flex-col items-center">
            <div className="absolute -inset-24 loader-atmosphere" />

            <svg
              width="200"
              height="180"
              viewBox="0 0 200 180"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="relative z-10"
            >
              <defs>
                {/* Light glow from open book */}
                <radialGradient id="pgGlow" cx="50%" cy="40%" r="50%">
                  <stop offset="0%" stopColor="var(--accent-gold)" stopOpacity="0.5" />
                  <stop offset="40%" stopColor="var(--accent-gold)" stopOpacity="0.1" />
                  <stop offset="100%" stopColor="var(--accent-gold)" stopOpacity="0" />
                </radialGradient>
                {/* Book cover gradient */}
                <linearGradient id="pgCoverL" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="var(--accent-gold)" stopOpacity="0.7" />
                  <stop offset="100%" stopColor="var(--accent-gold)" stopOpacity="0.4" />
                </linearGradient>
                <linearGradient id="pgCoverR" x1="1" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--accent-gold)" stopOpacity="0.7" />
                  <stop offset="100%" stopColor="var(--accent-gold)" stopOpacity="0.4" />
                </linearGradient>
                {/* Page color */}
                <linearGradient id="pgPage" x1="0.5" y1="0" x2="0.5" y2="1">
                  <stop offset="0%" stopColor="var(--text-primary)" stopOpacity="0.12" />
                  <stop offset="100%" stopColor="var(--text-primary)" stopOpacity="0.04" />
                </linearGradient>
                {/* Turning page */}
                <linearGradient id="pgTurn" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="var(--accent-gold)" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="var(--text-primary)" stopOpacity="0.08" />
                </linearGradient>
                {/* Light beam upward */}
                <linearGradient id="pgBeam" x1="0.5" y1="1" x2="0.5" y2="0">
                  <stop offset="0%" stopColor="var(--accent-gold)" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="var(--accent-gold)" stopOpacity="0" />
                </linearGradient>
                {/* Cross */}
                <linearGradient id="pgCross" x1="0.5" y1="0" x2="0.5" y2="1">
                  <stop offset="0%" stopColor="var(--accent-gold)" stopOpacity="0.85" />
                  <stop offset="100%" stopColor="var(--accent-gold)" stopOpacity="0.4" />
                </linearGradient>
                <filter id="pgSoftGlow"><feGaussianBlur stdDeviation="6" /></filter>
                <filter id="pgBlur"><feGaussianBlur stdDeviation="2" /></filter>
              </defs>

              {/* Atmospheric glow behind book */}
              <ellipse cx="100" cy="100" rx="80" ry="50" fill="url(#pgGlow)" filter="url(#pgSoftGlow)" className="loader-halo" />

              {/* Light beam rising from book */}
              <polygon points="80,95 120,95 112,10 88,10" fill="url(#pgBeam)" className="loader-beam" />

              {/* Small cross in the light */}
              <g className="loader-figure" style={{ transformOrigin: "100px 45px" }}>
                <rect x="97.5" y="25" width="5" height="30" rx="1.5" fill="url(#pgCross)" />
                <rect x="88" y="33" width="24" height="5" rx="1.5" fill="url(#pgCross)" />
              </g>

              {/* ── OPEN BOOK ── */}
              <g>
                {/* Book spine shadow */}
                <rect x="98" y="88" width="4" height="55" rx="1" fill="var(--accent-gold)" opacity="0.3" />

                {/* Left cover */}
                <path
                  d="M100 90 C90 88 55 86 38 88 C34 88.5 32 90 32 93 L32 138 C32 141 34 143 38 143 L100 145 Z"
                  fill="url(#pgCoverL)"
                  stroke="var(--accent-gold)"
                  strokeWidth="0.5"
                  opacity="0.8"
                />

                {/* Right cover */}
                <path
                  d="M100 90 C110 88 145 86 162 88 C166 88.5 168 90 168 93 L168 138 C168 141 166 143 162 143 L100 145 Z"
                  fill="url(#pgCoverR)"
                  stroke="var(--accent-gold)"
                  strokeWidth="0.5"
                  opacity="0.8"
                />

                {/* Left page */}
                <path
                  d="M100 92 C92 90.5 62 89 44 90.5 C40 91 38 92 38 94 L38 136 C38 138 40 139.5 44 139.5 L100 142 Z"
                  fill="url(#pgPage)"
                />

                {/* Right page */}
                <path
                  d="M100 92 C108 90.5 138 89 156 90.5 C160 91 162 92 162 94 L162 136 C162 138 160 139.5 156 139.5 L100 142 Z"
                  fill="url(#pgPage)"
                />

                {/* Left page text lines */}
                {[98, 103, 108, 113, 118, 123, 128, 133].map((y, i) => (
                  <line
                    key={`tl${i}`}
                    x1={48 + i * 0.5}
                    y1={y}
                    x2={94 - i * 0.3}
                    y2={y}
                    stroke="var(--accent-gold)"
                    strokeWidth="0.5"
                    opacity={0.12 - i * 0.008}
                  />
                ))}

                {/* Right page text lines */}
                {[98, 103, 108, 113, 118, 123, 128, 133].map((y, i) => (
                  <line
                    key={`tr${i}`}
                    x1={106 + i * 0.3}
                    y1={y}
                    x2={152 - i * 0.5}
                    y2={y}
                    stroke="var(--accent-gold)"
                    strokeWidth="0.5"
                    opacity={0.12 - i * 0.008}
                  />
                ))}

                {/* Turning page — animates left to right */}
                <path
                  d="M100 92 C108 91 130 90 148 91 C152 91.5 154 92.5 154 94 L154 134 C154 136 152 137.5 148 137 L100 142 Z"
                  fill="url(#pgTurn)"
                  className="loader-page-turn"
                />
              </g>

              {/* Light particles rising from pages */}
              {[
                { cx: 90, d: 0 }, { cx: 110, d: 0.8 }, { cx: 96, d: 1.6 },
                { cx: 104, d: 0.4 }, { cx: 86, d: 2.2 }, { cx: 114, d: 1.2 },
              ].map(({ cx, d }, i) => (
                <circle key={i} cx={cx} cy="92" r="0.8" fill="var(--accent-gold)" className="loader-particle" style={{ animationDelay: `${d}s` }} />
              ))}
            </svg>

            <h1 className="relative z-10 font-cormorant text-xl sm:text-2xl font-semibold tracking-[0.25em] text-[var(--accent-gold)] mt-2 mb-4 opacity-80">
              THE LIVING WORD
            </h1>

            <div className="relative z-10 w-32 h-px bg-[var(--border)] rounded-full overflow-hidden opacity-60">
              <div className="h-full bg-[var(--accent-gold)] rounded-full animate-[loadBar_2.2s_ease-in-out_infinite]" />
            </div>
          </div>
        </div>
      )}

      <div className={`transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}>
        {children}
      </div>
    </>
  );
}
