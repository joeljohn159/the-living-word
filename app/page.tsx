import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="max-w-2xl text-center animate-fade-in">
        <h1 className="heading text-5xl md:text-7xl tracking-wide text-gold mb-6">
          The Living Word
        </h1>
        <p className="font-source-sans text-lg md:text-xl text-[var(--text-secondary)] mb-4">
          The King James Bible — Illuminated with History, Art, and Evidence
        </p>
        <p className="scripture text-xl md:text-2xl italic text-scripture mb-10 leading-relaxed">
          &ldquo;In the beginning God created the heaven and the earth.&rdquo;
        </p>
        <p className="text-sm text-[var(--text-muted)] mb-8">
          Genesis 1:1 KJV
        </p>
        <Link
          href="/bible"
          className="inline-flex items-center gap-2 bg-gold text-[var(--bg-primary)] px-8 py-3 rounded-lg font-source-sans font-semibold text-lg hover:bg-gold-light transition-colors"
          aria-label="Begin reading the Bible"
        >
          Begin Reading &rarr;
        </Link>
      </div>
    </main>
  );
}
