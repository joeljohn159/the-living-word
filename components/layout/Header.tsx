"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { KjvBadge } from "@/components/layout/KjvBadge";
import { MobileNav } from "@/components/layout/MobileNav";
import { HeaderSearch } from "@/components/layout/HeaderSearch";
import { NAV_LINKS } from "@/components/layout/nav-links";
import { cn } from "@/lib/utils";

/**
 * Site-wide header with logo, main navigation, theme toggle, KJV badge,
 * and mobile hamburger menu. Dark museum-quality aesthetic with gold accents.
 */
export function Header() {
  const pathname = usePathname();

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full",
        "bg-background/95 backdrop-blur-sm",
        "border-b border-border"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo / Site Title */}
        <Link
          href="/"
          className={cn(
            "font-cormorant text-xl sm:text-2xl font-semibold",
            "text-gold hover:text-gold-light transition-colors",
            "tracking-wide"
          )}
          aria-label="The Living Word — Home"
        >
          The Living Word
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
          {NAV_LINKS.map(({ label, href, icon: Icon }) => {
            const isActive = pathname?.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md px-3 py-2",
                  "text-sm font-source-sans font-medium",
                  "transition-colors duration-150",
                  isActive
                    ? "text-gold bg-gold/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Right section: search, badge, theme toggle, mobile menu */}
        <div className="flex items-center gap-2 sm:gap-3">
          <HeaderSearch className="hidden sm:inline-flex" />
          <KjvBadge className="hidden sm:inline-flex" />
          <ThemeToggle className="hidden sm:inline-flex" />
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
