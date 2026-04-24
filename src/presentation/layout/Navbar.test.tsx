import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Navbar } from "./Navbar";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    onClick,
    className,
  }: {
    children: React.ReactNode;
    href: string;
    onClick?: (e: React.MouseEvent) => void;
    className?: string;
  }) => (
    <a href={href} onClick={onClick} className={className}>
      {children}
    </a>
  ),
}));

vi.mock("@/presentation/providers/AuthProvider", () => ({
  useAuth: () => ({ user: null, loading: false }),
}));

// Make AnimatePresence synchronous — unmounts immediately instead of
// running an exit animation. Keeps assertions deterministic without
// faking timers. motion.div is passed through as a plain div.
vi.mock("framer-motion", () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  motion: new Proxy(
    {},
    {
      get: () => {
        return ({
          children,
          // strip framer-only props so they don't hit the DOM
          initial: _initial,
          animate: _animate,
          exit: _exit,
          transition: _transition,
          layoutId: _layoutId,
          ...rest
        }: Record<string, unknown> & { children?: React.ReactNode }) => (
          <div {...(rest as React.HTMLAttributes<HTMLDivElement>)}>{children}</div>
        );
      },
    }
  ),
}));

function getGamesButton(): HTMLElement {
  const btn = screen
    .getAllByRole("button")
    .find((b) => b.textContent?.includes("Games"));
  if (!btn) throw new Error("Games button not found");
  return btn;
}

describe("Navbar games dropdown", () => {
  it("hides game links by default", () => {
    render(<Navbar />);
    expect(screen.queryByText("Worldle")).not.toBeInTheDocument();
    expect(screen.queryByText("Name All")).not.toBeInTheDocument();
  });

  it("shows all seven game links when Games is clicked", () => {
    render(<Navbar />);
    fireEvent.click(getGamesButton());

    expect(screen.getByText("Shape Quiz")).toBeInTheDocument();
    expect(screen.getByText("Capitals Quiz")).toBeInTheDocument();
    expect(screen.getByText("Flag Quiz")).toBeInTheDocument();
    expect(screen.getByText("Name All")).toBeInTheDocument();
    expect(screen.getByText("Worldle")).toBeInTheDocument();
    expect(screen.getByText("Population")).toBeInTheDocument();
    expect(screen.getByText("Street View")).toBeInTheDocument();
  });

  it("closes the dropdown when a game link is clicked", () => {
    render(<Navbar />);
    fireEvent.click(getGamesButton());
    expect(screen.getByText("Worldle")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Worldle"));

    expect(screen.queryByText("Worldle")).not.toBeInTheDocument();
  });

  it("toggles closed when Games is clicked a second time", () => {
    render(<Navbar />);
    const btn = getGamesButton();
    fireEvent.click(btn);
    expect(screen.getByText("Worldle")).toBeInTheDocument();

    fireEvent.click(btn);

    expect(screen.queryByText("Worldle")).not.toBeInTheDocument();
  });

  it("does not use a hardcoded w-[480px] width on the dropdown panel", () => {
    // Regression guard: the old fixed width overflowed the viewport on
    // small tablets / landscape phones. The dropdown must scale to the
    // viewport. If this assertion fails, verify the new width is
    // actually responsive (e.g. uses min() or a max-w cap).
    const { container } = render(<Navbar />);
    fireEvent.click(getGamesButton());
    expect(container.innerHTML).not.toMatch(/w-\[480px\]/);
  });
});
