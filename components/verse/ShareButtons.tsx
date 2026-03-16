"use client";

import { useState } from "react";
import { Link2, Twitter, Facebook, Mail, Check } from "lucide-react";

interface ShareButtonsProps {
  bookName: string;
  chapter: number;
  verse: number;
  text: string;
  url: string;
}

/** Share buttons for copying link and sharing to social media. */
export function ShareButtons({ bookName, chapter, verse, text, url }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const reference = `${bookName} ${chapter}:${verse} (KJV)`;
  const shareText = `"${text}" — ${reference}`;

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const input = document.createElement("input");
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
  const emailUrl = `mailto:?subject=${encodeURIComponent(reference)}&body=${encodeURIComponent(shareText + "\n\n" + url)}`;

  const buttonClass = `inline-flex items-center gap-2 px-4 py-2 text-sm rounded-lg
    border border-[var(--border)] text-[var(--text-secondary)]
    hover:border-[var(--accent-gold)] hover:text-[var(--accent-gold)]
    transition-colors`;

  return (
    <section aria-label="Share this verse" className="mt-10">
      <h2 className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)] mb-4 text-center">
        Share This Verse
      </h2>
      <div className="flex flex-wrap justify-center gap-3">
        <button
          onClick={handleCopyLink}
          className={buttonClass}
          aria-label={copied ? "Link copied" : "Copy link to clipboard"}
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              Copied!
            </>
          ) : (
            <>
              <Link2 className="w-4 h-4" />
              Copy Link
            </>
          )}
        </button>

        <a
          href={twitterUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonClass}
          aria-label="Share on Twitter"
        >
          <Twitter className="w-4 h-4" />
          Twitter
        </a>

        <a
          href={facebookUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonClass}
          aria-label="Share on Facebook"
        >
          <Facebook className="w-4 h-4" />
          Facebook
        </a>

        <a
          href={emailUrl}
          className={buttonClass}
          aria-label="Share via email"
        >
          <Mail className="w-4 h-4" />
          Email
        </a>
      </div>
    </section>
  );
}
