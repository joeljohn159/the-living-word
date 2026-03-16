import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

const ROOT = path.resolve(__dirname, "../..");

/**
 * Tests verifying the project scaffold structure is correct:
 * - Required directories exist
 * - Required config files exist
 * - package.json has correct dependencies
 * - tsconfig has path aliases
 * - CSS custom properties are defined for all three themes
 */

describe("Project folder structure", () => {
  const requiredDirs = [
    "app",
    "components",
    "lib",
    "hooks",
    "stores",
    "data",
    "public",
  ];

  requiredDirs.forEach((dir) => {
    it(`has required directory: ${dir}/`, () => {
      const dirPath = path.join(ROOT, dir);
      expect(fs.existsSync(dirPath)).toBe(true);
      expect(fs.statSync(dirPath).isDirectory()).toBe(true);
    });
  });
});

describe("Configuration files exist", () => {
  const requiredFiles = [
    "package.json",
    "tsconfig.json",
    "tailwind.config.ts",
    "next.config.mjs",
    "postcss.config.mjs",
    ".env.example",
    "app/layout.tsx",
    "app/globals.css",
  ];

  requiredFiles.forEach((file) => {
    it(`has required config file: ${file}`, () => {
      expect(fs.existsSync(path.join(ROOT, file))).toBe(true);
    });
  });
});

describe("package.json — core dependencies", () => {
  const pkg = JSON.parse(
    fs.readFileSync(path.join(ROOT, "package.json"), "utf-8"),
  );

  it("has project name 'the-living-word'", () => {
    expect(pkg.name).toBe("the-living-word");
  });

  const coreDeps = [
    "next",
    "react",
    "react-dom",
    "tailwind-merge",
    "drizzle-orm",
    "better-sqlite3",
    "zustand",
    "framer-motion",
    "lucide-react",
  ];

  coreDeps.forEach((dep) => {
    it(`includes dependency: ${dep}`, () => {
      expect(pkg.dependencies[dep] || pkg.devDependencies[dep]).toBeDefined();
    });
  });

  it("uses Next.js 14.x", () => {
    expect(pkg.dependencies.next).toMatch(/^14\./);
  });

  it("includes TypeScript as dev dependency", () => {
    expect(pkg.devDependencies.typescript).toBeDefined();
  });

  it("includes Tailwind CSS as dev dependency", () => {
    expect(pkg.devDependencies.tailwindcss).toBeDefined();
  });
});

describe("tsconfig.json — path aliases", () => {
  const tsconfig = JSON.parse(
    fs.readFileSync(path.join(ROOT, "tsconfig.json"), "utf-8"),
  );

  it("has @/* path alias pointing to ./*", () => {
    expect(tsconfig.compilerOptions.paths["@/*"]).toEqual(["./*"]);
  });

  it("has strict mode enabled", () => {
    expect(tsconfig.compilerOptions.strict).toBe(true);
  });
});

describe(".env.example — environment variables", () => {
  const envContent = fs.readFileSync(
    path.join(ROOT, ".env.example"),
    "utf-8",
  );

  it("contains DATABASE_URL", () => {
    expect(envContent).toContain("DATABASE_URL");
  });

  it("contains NEXT_PUBLIC_SITE_URL", () => {
    expect(envContent).toContain("NEXT_PUBLIC_SITE_URL");
  });
});

describe("globals.css — color palette custom properties", () => {
  const css = fs.readFileSync(
    path.join(ROOT, "app/globals.css"),
    "utf-8",
  );

  describe("dark theme (default)", () => {
    it("defines --bg-primary", () => {
      expect(css).toContain("--bg-primary:");
    });

    it("defines --accent-gold", () => {
      expect(css).toContain("--accent-gold:");
    });

    it("defines --scripture-text", () => {
      expect(css).toContain("--scripture-text:");
    });

    it("defines --verse-number", () => {
      expect(css).toContain("--verse-number:");
    });
  });

  it("includes .theme-light selector", () => {
    expect(css).toContain(".theme-light");
  });

  it("includes .theme-sepia selector", () => {
    expect(css).toContain(".theme-sepia");
  });

  it("defines all three themes with bg-primary values", () => {
    // Dark: #0F0F1A, Light: #FDFBF7, Sepia: #F4ECD8
    expect(css).toContain("#0F0F1A");
    expect(css).toContain("#FDFBF7");
    expect(css).toContain("#F4ECD8");
  });

  it("includes scripture typography class", () => {
    expect(css).toContain(".scripture");
  });

  it("includes heading typography class", () => {
    expect(css).toContain(".heading");
  });

  it("includes verse-number utility class", () => {
    expect(css).toContain(".verse-number");
  });
});

describe("tailwind.config.ts — theme extensions", () => {
  const configContent = fs.readFileSync(
    path.join(ROOT, "tailwind.config.ts"),
    "utf-8",
  );

  it("extends colors with CSS custom properties", () => {
    expect(configContent).toContain("var(--background)");
    expect(configContent).toContain("var(--foreground)");
    expect(configContent).toContain("var(--primary)");
  });

  it("defines cormorant font family", () => {
    expect(configContent).toContain("cormorant");
    expect(configContent).toContain("--font-cormorant");
  });

  it("defines source-sans font family", () => {
    expect(configContent).toContain("source-sans");
    expect(configContent).toContain("--font-source-sans");
  });

  it("defines scripture font size", () => {
    expect(configContent).toContain("scripture");
    expect(configContent).toContain("1.25rem");
  });

  it("includes gold color variants", () => {
    expect(configContent).toContain("var(--accent-gold)");
    expect(configContent).toContain("var(--accent-gold-light)");
    expect(configContent).toContain("var(--accent-gold-dark)");
  });
});

describe("Root layout — app/layout.tsx", () => {
  const layout = fs.readFileSync(
    path.join(ROOT, "app/layout.tsx"),
    "utf-8",
  );

  it("imports Cormorant_Garamond from next/font/google", () => {
    expect(layout).toContain("Cormorant_Garamond");
    expect(layout).toContain("next/font/google");
  });

  it("imports Source_Sans_3 from next/font/google", () => {
    expect(layout).toContain("Source_Sans_3");
  });

  it("sets lang='en' on html element", () => {
    expect(layout).toContain('lang="en"');
  });

  it("applies theme-dark class by default", () => {
    expect(layout).toContain('className="theme-dark"');
  });

  it("includes font CSS variables on body", () => {
    expect(layout).toContain("cormorant.variable");
    expect(layout).toContain("sourceSans.variable");
  });

  it("wraps content in ThemeProvider", () => {
    expect(layout).toContain("<ThemeProvider>");
    expect(layout).toContain("</ThemeProvider>");
  });

  it("includes skip-to-content accessibility link", () => {
    expect(layout).toContain("Skip to content");
    expect(layout).toContain("#main-content");
  });

  it("includes main element with id='main-content'", () => {
    expect(layout).toContain('id="main-content"');
  });

  it("includes Header and Footer components", () => {
    expect(layout).toContain("<Header");
    expect(layout).toContain("<Footer");
  });

  it("sets suppressHydrationWarning on html for theme switching", () => {
    expect(layout).toContain("suppressHydrationWarning");
  });
});
