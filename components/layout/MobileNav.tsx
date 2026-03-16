"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { KjvBadge } from "@/components/layout/KjvBadge";
import { NAV_LINKS } from "@/components/layout/nav-links";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

/**
 * Mobile slide-out navigation drawer using shadcn Sheet.
 * Includes all nav links, theme toggle, and KJV badge.
 */
export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        className={cn(
          "inline-flex items-center justify-center rounded-md p-2 lg:hidden",
          "text-muted-foreground hover:text-foreground hover:bg-accent",
          "transition-colors focus-visible:outline-none",
          "focus-visible:ring-2 focus-visible:ring-ring"
        )}
        aria-label="Open navigation menu"
      >
        <Menu className="h-6 w-6" />
      </SheetTrigger>

      <SheetContent>
        <nav
          className="flex flex-col h-full pt-12 pb-6 px-6"
          aria-label="Mobile navigation"
        >
          {/* Logo */}
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="font-cormorant text-xl font-semibold text-gold mb-8"
          >
            The Living Word
          </Link>

          {/* Nav links */}
          <ul className="flex flex-col gap-1 flex-1" role="list">
            {NAV_LINKS.map(({ label, href, icon: Icon }) => {
              const isActive = pathname?.startsWith(href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-3",
                      "text-sm font-source-sans font-medium",
                      "transition-colors duration-150 touch-target",
                      isActive
                        ? "bg-gold/10 text-gold"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    )}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Bottom section */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <ThemeToggle />
            <KjvBadge />
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
