/**
 * Global Keyboard Shortcuts System
 * =================================
 *
 * A centralized keyboard shortcut handler that provides consistent,
 * discoverable shortcuts across the entire application.
 *
 * ── Shortcut Reference ───────────────────────────────────────────
 *
 * Navigation:
 *   ← (ArrowLeft)   Previous chapter (on chapter pages only)
 *   → (ArrowRight)  Next chapter (on chapter pages only)
 *   B               Open book browser (/bible)
 *   / or Ctrl+K     Focus search (/search)
 *
 * Reading:
 *   D               Toggle dictionary mode
 *   + or =          Increase font size (max 28px, step 2)
 *   -               Decrease font size (min 14px, step 2)
 *
 * Panels & Display:
 *   F               Toggle fullscreen reading (hide/show context panel)
 *   M               Toggle map panel (opens panel if closed)
 *   T               Cycle theme (dark → light → sepia → dark)
 *
 * General:
 *   Esc             Close panels / exit dictionary mode
 *   ?               Show keyboard shortcuts help dialog
 *
 * ── Safety Behavior ──────────────────────────────────────────────
 * Single-key shortcuts are SUPPRESSED when:
 * 1. Focus is inside an <input>, <textarea>, or <select> element
 * 2. Focus is inside a contentEditable element
 * 3. A modifier key (Ctrl/Cmd/Alt) is held (except Ctrl+K)
 *
 * The only shortcut that fires in form fields is Ctrl+K / Cmd+K,
 * matching the universal search convention.
 *
 * ── Architecture ─────────────────────────────────────────────────
 *
 * hooks/useKeyboardShortcuts.ts
 *   - Single keydown event listener on window
 *   - Handles ALL shortcuts in one place (replaces per-feature hooks)
 *   - Uses Zustand store for state-based actions (theme, font, sidebar)
 *   - Uses Next.js router for navigation (search, chapters, book browser)
 *   - Accepts onToggleHelp callback for the ? key
 *   - isTyping() guard prevents shortcuts firing in form fields
 *   - hasModifier() guard prevents conflicts with browser shortcuts
 *   - parseChapterPath() extracts book/chapter from URL for ← → nav
 *
 * components/shared/KeyboardShortcutsProvider.tsx
 *   - Root-level client component rendered inside ThemeProvider
 *   - Manages helpOpen state for the shortcuts dialog
 *   - Calls useKeyboardShortcuts() hook
 *   - Renders KeyboardShortcutsDialog as a portal-style overlay
 *
 * components/shared/KeyboardShortcutsDialog.tsx
 *   - Modal dialog listing all shortcuts grouped by category
 *   - Triggered by pressing '?' key
 *   - Closes on Escape, backdrop click, or close button
 *   - Exports SHORTCUT_GROUPS constant for programmatic access
 *   - Fully accessible: role="dialog", aria-modal, focus management
 *
 * ── Integration Points ───────────────────────────────────────────
 *
 * Root Layout (app/layout.tsx):
 *   <ThemeProvider>
 *     <KeyboardShortcutsProvider>   ← registered here
 *       <Header />
 *       <main>{children}</main>
 *       <Footer />
 *     </KeyboardShortcutsProvider>
 *   </ThemeProvider>
 *
 * Replaced individual hook registrations in:
 *   - ThemeProvider (was: useThemeKeyboard)
 *   - Sidebar (was: useContextPanelKeyboard)
 *   - HeaderSearch (was: useSearchKeyboard)
 *
 * Individual hooks are preserved in hooks/ for backward compatibility
 * but are no longer called from those components.
 *
 * ── Store Integration (stores/preferences.ts) ────────────────────
 *   - cycleTheme()         → T key
 *   - toggleDictionaryMode() → D key
 *   - setDictionaryMode()  → Escape key (exit dict mode)
 *   - toggleSidebar()      → F key, Escape key (close panel)
 *   - setActiveSidebarTab() → M key (set to "map")
 *   - increaseFontSize()   → + key
 *   - decreaseFontSize()   → - key
 *
 * ── Help Dialog Visual Spec ──────────────────────────────────────
 *
 * Layout:
 *   - Centered modal overlay with backdrop blur (bg-black/60)
 *   - Max width: 32rem (max-w-lg), responsive: 90vw on mobile
 *   - Rounded corners (rounded-xl), card background (bg-card)
 *   - Border (border-border), shadow (shadow-2xl)
 *   - Max height: 85vh with overflow scroll
 *
 * Header:
 *   - Title: "Keyboard Shortcuts" (font-source-sans, text-lg, semibold)
 *   - Close button (X icon) with hover/focus states
 *   - Bottom border separator
 *
 * Content:
 *   - Shortcuts grouped by category (Navigation, Reading, Panels, General)
 *   - Category labels: uppercase, tracking-wider, text-xs, muted
 *   - Each row: description (left) + key badges (right)
 *   - Key badges: mono font, border, bg-secondary, rounded, min-w-[1.75rem]
 *   - Multiple keys separated by "or" text
 *
 * Footer:
 *   - Hint text: "Press ? to toggle this dialog"
 *   - Top border separator
 *
 * ── Chapter Navigation (← →) ────────────────────────────────────
 * The arrow key shortcuts only work on chapter pages matching the
 * URL pattern: /bible/[bookSlug]/[chapter]
 *
 * Examples:
 *   /bible/genesis/1  → ← disabled (chapter 1), → goes to /bible/genesis/2
 *   /bible/john/3     → ← goes to /bible/john/2, → goes to /bible/john/4
 *   /bible            → ← and → do nothing (not a chapter page)
 *   /search           → ← and → do nothing (not a chapter page)
 *
 * ── Accessibility ────────────────────────────────────────────────
 * - Help dialog has role="dialog" with aria-modal="true"
 * - Dialog has aria-label="Keyboard shortcuts"
 * - Close button has aria-label="Close shortcuts dialog"
 * - Focus is moved to dialog on open
 * - Escape closes the dialog (captured at capture phase)
 * - Backdrop click closes the dialog
 * - All shortcuts avoid conflicts with screen reader keys
 * - Form field detection prevents accidental shortcut triggers
 *
 * ── CSS Classes Used ─────────────────────────────────────────────
 * All styling uses Tailwind utility classes matching the project's
 * design system:
 *   bg-card, border-border, text-foreground, text-muted-foreground,
 *   bg-secondary, font-mono, font-source-sans
 *
 * No additional CSS is required in globals.css.
 */

// ── Shortcut Definitions (for programmatic use) ──────────────────

export const ALL_SHORTCUTS = [
  { key: "D", description: "Toggle dictionary mode", category: "Reading" },
  { key: "T", description: "Cycle theme", category: "Panels & Display" },
  { key: "F", description: "Toggle fullscreen reading", category: "Panels & Display" },
  { key: "M", description: "Toggle map panel", category: "Panels & Display" },
  { key: "B", description: "Open book browser", category: "Navigation" },
  { key: "+", description: "Increase font size", category: "Reading" },
  { key: "-", description: "Decrease font size", category: "Reading" },
  { key: "?", description: "Show shortcuts help", category: "General" },
  { key: "/", description: "Focus search", category: "Navigation" },
  { key: "Ctrl+K", description: "Focus search (always)", category: "Navigation" },
  { key: "Esc", description: "Close panels / exit modes", category: "General" },
  { key: "←", description: "Previous chapter", category: "Navigation" },
  { key: "→", description: "Next chapter", category: "Navigation" },
];
