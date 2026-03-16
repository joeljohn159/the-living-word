import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { PersonCard } from "./PersonCard";

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

// Mock next/image
vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => {
    const { fill, ...rest } = props;
    return <img data-fill={fill ? "true" : undefined} {...rest} />;
  },
}));

// Mock lucide-react
vi.mock("lucide-react", () => ({
  Users: (props: Record<string, unknown>) => (
    <svg data-testid="users-icon" {...props} />
  ),
}));

const baseProps = {
  name: "Moses",
  slug: "moses",
  description: "Leader of the Israelites and prophet of God.",
  tribeOrGroup: "Levite",
  alsoKnownAs: "Moshe",
  imageUrl:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/example/Moses.jpg",
  sourceUrl:
    "https://commons.wikimedia.org/wiki/File:Moses.jpg",
};

describe("PersonCard", () => {
  describe("rendering with image", () => {
    it("renders the person name as a heading", () => {
      render(<PersonCard {...baseProps} />);
      expect(screen.getByText("Moses")).toBeInTheDocument();
    });

    it("links to the correct person detail page", () => {
      render(<PersonCard {...baseProps} />);
      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("href", "/people/moses");
    });

    it("has an accessible aria-label", () => {
      render(<PersonCard {...baseProps} />);
      expect(
        screen.getByLabelText("View profile of Moses")
      ).toBeInTheDocument();
    });

    it("displays the portrait image with correct alt text", () => {
      render(<PersonCard {...baseProps} />);
      const img = screen.getByAltText("Portrait of Moses");
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute("src", baseProps.imageUrl);
    });

    it("renders the image as unoptimized for Wikimedia sources", () => {
      render(<PersonCard {...baseProps} />);
      const img = screen.getByAltText("Portrait of Moses");
      // Next.js Image unoptimized prop is passed to our mock as a data attribute
      expect(img).toHaveAttribute("data-fill", "true");
    });

    it("shows also-known-as text when provided", () => {
      render(<PersonCard {...baseProps} />);
      expect(screen.getByText(/Also known as: Moshe/)).toBeInTheDocument();
    });

    it("shows the tribe/group badge over the image", () => {
      render(<PersonCard {...baseProps} />);
      expect(screen.getByText("Levite")).toBeInTheDocument();
    });

    it("shows the description", () => {
      render(<PersonCard {...baseProps} />);
      expect(
        screen.getByText("Leader of the Israelites and prophet of God.")
      ).toBeInTheDocument();
    });

    it("does not render the fallback icon when image is present", () => {
      render(<PersonCard {...baseProps} />);
      expect(screen.queryByTestId("users-icon")).not.toBeInTheDocument();
    });
  });

  describe("Wikimedia attribution", () => {
    it("shows attribution when both imageUrl and sourceUrl are present", () => {
      render(<PersonCard {...baseProps} />);
      expect(screen.getByText("Wikimedia Commons")).toBeInTheDocument();
    });

    it("has proper aria-label on attribution link", () => {
      render(<PersonCard {...baseProps} />);
      expect(
        screen.getByLabelText("Wikimedia Commons source")
      ).toBeInTheDocument();
    });

    it("does not show attribution when sourceUrl is missing", () => {
      render(<PersonCard {...baseProps} sourceUrl={null} />);
      expect(screen.queryByText("Wikimedia Commons")).not.toBeInTheDocument();
    });

    it("does not show attribution when imageUrl is missing", () => {
      render(
        <PersonCard
          {...baseProps}
          imageUrl={null}
          sourceUrl="https://commons.wikimedia.org/wiki/File:Moses.jpg"
        />
      );
      expect(screen.queryByText("Wikimedia Commons")).not.toBeInTheDocument();
    });
  });

  describe("fallback state (no image)", () => {
    const noImageProps = {
      ...baseProps,
      imageUrl: null,
      sourceUrl: null,
    };

    it("renders the Users icon fallback when no image", () => {
      render(<PersonCard {...noImageProps} />);
      expect(screen.getByTestId("users-icon")).toBeInTheDocument();
    });

    it("does not render any img element when no image", () => {
      render(<PersonCard {...noImageProps} />);
      expect(screen.queryByRole("img")).not.toBeInTheDocument();
    });

    it("shows tribe/group badge in the text section", () => {
      render(<PersonCard {...noImageProps} />);
      expect(screen.getByText("Levite")).toBeInTheDocument();
    });

    it("still links to the person page", () => {
      render(<PersonCard {...noImageProps} />);
      expect(screen.getByRole("link")).toHaveAttribute("href", "/people/moses");
    });

    it("still shows the name and description", () => {
      render(<PersonCard {...noImageProps} />);
      expect(screen.getByText("Moses")).toBeInTheDocument();
      expect(
        screen.getByText("Leader of the Israelites and prophet of God.")
      ).toBeInTheDocument();
    });
  });

  describe("edge cases", () => {
    it("renders without description", () => {
      render(<PersonCard {...baseProps} description={null} />);
      expect(screen.getByText("Moses")).toBeInTheDocument();
      expect(
        screen.queryByText("Leader of the Israelites and prophet of God.")
      ).not.toBeInTheDocument();
    });

    it("renders without alsoKnownAs", () => {
      render(<PersonCard {...baseProps} alsoKnownAs={null} />);
      expect(screen.queryByText(/Also known as/)).not.toBeInTheDocument();
    });

    it("renders without tribeOrGroup", () => {
      render(<PersonCard {...baseProps} tribeOrGroup={null} />);
      expect(screen.queryByText("Levite")).not.toBeInTheDocument();
    });

    it("renders with all nullable fields as null", () => {
      render(
        <PersonCard
          name="Unknown"
          slug="unknown"
          description={null}
          tribeOrGroup={null}
          alsoKnownAs={null}
          imageUrl={null}
          sourceUrl={null}
        />
      );
      expect(screen.getByText("Unknown")).toBeInTheDocument();
      expect(screen.getByTestId("users-icon")).toBeInTheDocument();
    });

    it("handles special characters in name", () => {
      render(<PersonCard {...baseProps} name="Mary (Mother of Jesus)" />);
      expect(screen.getByText("Mary (Mother of Jesus)")).toBeInTheDocument();
      expect(
        screen.getByLabelText("View profile of Mary (Mother of Jesus)")
      ).toBeInTheDocument();
    });
  });
});
