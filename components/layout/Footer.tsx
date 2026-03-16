"use client";

import Link from "next/link";
import { NAV_LINKS } from "@/components/layout/nav-links";
import { cn } from "@/lib/utils";

const CURRENT_YEAR = new Date().getFullYear();

const VERSION_OPTIONS = ["KJV"] as const;

/**
 * Site-wide footer with navigation links, about blurb, copyright,
 * and version/translation selector. Museum-quality dark aesthetic.
 */
export function Footer() {
  return (
    <footer
      className="w-full border-t border-border bg-card"
      role="contentinfo"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {/* About section */}
          <div className="space-y-3">
            <h2 className="font-cormorant text-lg font-semibold text-gold tracking-wide">
              The Living Word
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Experience the King James Bible illuminated with historical art,
              archaeological evidence, interactive maps, and a built-in archaic
              word dictionary.
            </p>
          </div>

          {/* Navigation links */}
          <nav aria-label="Footer navigation">
            <h3 className="font-source-sans text-sm font-semibold uppercase tracking-wider text-foreground mb-3">
              Explore
            </h3>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-2" role="list">
              {NAV_LINKS.map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className={cn(
                      "text-sm text-muted-foreground",
                      "hover:text-gold transition-colors duration-150"
                    )}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Version selector & links */}
          <div className="space-y-4">
            <div>
              <label
                htmlFor="version-select"
                className="font-source-sans text-sm font-semibold uppercase tracking-wider text-foreground block mb-2"
              >
                Translation
              </label>
              <select
                id="version-select"
                className={cn(
                  "w-full max-w-[200px] rounded-md px-3 py-2",
                  "bg-secondary text-secondary-foreground text-sm",
                  "border border-border",
                  "focus:outline-none focus:ring-2 focus:ring-ring",
                  "font-source-sans"
                )}
                defaultValue="KJV"
                aria-label="Select Bible translation"
              >
                {VERSION_OPTIONS.map((version) => (
                  <option key={version} value={version}>
                    {version} — King James Version
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground mt-1.5">
                More translations coming soon
              </p>
            </div>

            <div className="flex gap-4 text-sm">
              <Link
                href="/about"
                className="text-muted-foreground hover:text-gold transition-colors"
              >
                About
              </Link>
              <Link
                href="/privacy"
                className="text-muted-foreground hover:text-gold transition-colors"
              >
                Privacy
              </Link>
            </div>
          </div>
        </div>

        {/* Copyright bar */}
        <div className="mt-10 pt-6 border-t border-border">
          <p className="text-center text-xs text-muted-foreground">
            &copy; {CURRENT_YEAR} The Living Word. Scripture text is in the
            public domain.
          </p>
        </div>
      </div>
    </footer>
  );
}
