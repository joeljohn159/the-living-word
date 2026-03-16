import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

// Mock next/link
vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Mock the seo module
vi.mock("@/lib/seo", () => ({
  generatePageMetadata: vi.fn(() => ({})),
  buildBreadcrumbJsonLd: vi.fn(() => ({})),
  jsonLdScriptProps: vi.fn(() => ({
    type: "application/ld+json",
    dangerouslySetInnerHTML: { __html: "{}" },
  })),
}));

import PrivacyPage from "../page";

describe("PrivacyPage", () => {
  it("renders the page header with title", () => {
    render(<PrivacyPage />);
    expect(
      screen.getByRole("heading", { level: 1, name: "Privacy Policy" })
    ).toBeInTheDocument();
  });

  it("displays the 'Legal' section label", () => {
    render(<PrivacyPage />);
    expect(screen.getByText("Legal")).toBeInTheDocument();
  });

  it("displays the introductory description", () => {
    render(<PrivacyPage />);
    expect(
      screen.getByText(/Your privacy matters/)
    ).toBeInTheDocument();
  });

  it("renders all expected policy sections", () => {
    render(<PrivacyPage />);
    const expectedSections = [
      "Overview",
      "Data We Do Not Collect",
      "Local Storage",
      "External Resources",
      "Open Source",
      "Changes to This Policy",
      "Contact",
    ];

    expectedSections.forEach((title) => {
      expect(
        screen.getByRole("heading", { name: title })
      ).toBeInTheDocument();
    });
  });

  it("renders the Overview content", () => {
    render(<PrivacyPage />);
    expect(
      screen.getByText(/free, open-source Bible application/)
    ).toBeInTheDocument();
  });

  it("lists data collection disclaimers", () => {
    render(<PrivacyPage />);
    expect(
      screen.getByText(/do not use cookies for tracking/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/do not collect personal information/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/do not use third-party analytics/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/do not sell or share any user data/)
    ).toBeInTheDocument();
  });

  it("explains local storage usage", () => {
    render(<PrivacyPage />);
    expect(
      screen.getByText(/reading preferences.*local storage/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/never leaves your device/)
    ).toBeInTheDocument();
  });

  it("mentions external resources like Wikimedia Commons", () => {
    render(<PrivacyPage />);
    expect(
      screen.getByText(/Wikimedia Commons/)
    ).toBeInTheDocument();
  });

  it("mentions open source availability", () => {
    render(<PrivacyPage />);
    expect(
      screen.getByText(/source code.*is open source/i)
    ).toBeInTheDocument();
  });

  it("includes a link to the About page", () => {
    render(<PrivacyPage />);
    const aboutLink = screen.getByRole("link", { name: "About page" });
    expect(aboutLink).toBeInTheDocument();
    expect(aboutLink).toHaveAttribute("href", "/about");
  });

  it("each policy section has proper aria-labelledby", () => {
    const { container } = render(<PrivacyPage />);
    const sections = container.querySelectorAll("section[aria-labelledby]");
    // 7 policy sections
    expect(sections.length).toBe(7);

    sections.forEach((section) => {
      const labelledBy = section.getAttribute("aria-labelledby");
      expect(labelledBy).toBeTruthy();
      const heading = section.querySelector(`#${CSS.escape(labelledBy!)}`);
      expect(heading).toBeInTheDocument();
    });
  });

  it("renders the last updated date", () => {
    render(<PrivacyPage />);
    expect(
      screen.getByText(/last updated on March 16, 2026/)
    ).toBeInTheDocument();
  });
});
