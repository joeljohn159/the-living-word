import type { Metadata } from "next";
import Link from "next/link";
import {
  generatePageMetadata,
  buildBreadcrumbJsonLd,
  jsonLdScriptProps,
} from "@/lib/seo";

export const metadata: Metadata = generatePageMetadata({
  title: "Privacy Policy",
  description:
    "Privacy policy for The Living Word — a free, open Bible application with no tracking, no ads, and no data collection.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <article className="pb-16">
      <script
        {...jsonLdScriptProps(
          buildBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Privacy Policy", path: "/privacy" },
          ])
        )}
      />

      {/* Hero Banner */}
      <header className="border-b border-border bg-card py-12 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
          <p className="font-source-sans text-xs uppercase tracking-[0.3em] text-gold mb-3">
            Legal
          </p>
          <h1 className="heading text-3xl sm:text-4xl md:text-5xl text-gold mb-4">
            Privacy Policy
          </h1>
          <p className="font-source-sans text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Your privacy matters. The Living Word is built with respect for your
            data and your reading experience.
          </p>
          <div
            className="mx-auto mt-6 h-px w-24 bg-gold/40"
            aria-hidden="true"
          />
        </div>
      </header>

      {/* Policy Content */}
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12 sm:py-16 space-y-12">
        <PolicySection title="Overview">
          <p>
            The Living Word is a free, open-source Bible application. We are
            committed to protecting your privacy. This policy explains what
            data we collect (very little) and how we handle it.
          </p>
        </PolicySection>

        <PolicySection title="Data We Do Not Collect">
          <ul className="list-disc list-inside space-y-2">
            <li>We do not use cookies for tracking or advertising.</li>
            <li>We do not collect personal information such as names, emails, or addresses.</li>
            <li>We do not use third-party analytics or advertising services.</li>
            <li>We do not sell or share any user data.</li>
          </ul>
        </PolicySection>

        <PolicySection title="Local Storage">
          <p>
            The Living Word may store your reading preferences (such as your
            selected theme, bookmarks, or last-read chapter) in your
            browser&apos;s local storage. This data never leaves your device
            and is not transmitted to any server.
          </p>
        </PolicySection>

        <PolicySection title="External Resources">
          <p>
            Some artwork images are loaded from external sources such as
            Wikimedia Commons. These requests are made directly by your browser
            and are subject to the privacy policies of those services. We do
            not control or have access to any data collected by those third
            parties.
          </p>
        </PolicySection>

        <PolicySection title="Open Source">
          <p>
            The source code for The Living Word is open source. You are welcome
            to review the codebase to verify our privacy practices.
          </p>
        </PolicySection>

        <PolicySection title="Changes to This Policy">
          <p>
            We may update this privacy policy from time to time. Any changes
            will be reflected on this page. This policy was last updated on
            March 16, 2026.
          </p>
        </PolicySection>

        <PolicySection title="Contact">
          <p>
            If you have questions about this privacy policy, please visit our{" "}
            <Link
              href="/about"
              className="text-gold hover:text-gold-light underline underline-offset-4 transition-colors"
            >
              About page
            </Link>{" "}
            for more information.
          </p>
        </PolicySection>
      </div>
    </article>
  );
}

interface PolicySectionProps {
  title: string;
  children: React.ReactNode;
}

function PolicySection({ title, children }: PolicySectionProps) {
  return (
    <section aria-labelledby={`policy-${title.toLowerCase().replace(/\s+/g, "-")}`}>
      <h2
        id={`policy-${title.toLowerCase().replace(/\s+/g, "-")}`}
        className="heading text-xl sm:text-2xl text-gold mb-4"
      >
        {title}
      </h2>
      <div className="font-source-sans text-base text-muted-foreground leading-relaxed space-y-3">
        {children}
      </div>
    </section>
  );
}
