import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useBreakpoint } from "./useBreakpoint";

type Listener = (event: MediaQueryListEvent) => void;

interface MockMediaQueryList {
  matches: boolean;
  media: string;
  addEventListener: (type: "change", listener: Listener) => void;
  removeEventListener: (type: "change", listener: Listener) => void;
  dispatchEvent: (event: Event) => boolean;
  onchange: null;
  addListener: (listener: Listener) => void;
  removeListener: (listener: Listener) => void;
}

function createMatchMediaMock(initialWidth: number) {
  const listeners = new Map<string, Set<Listener>>();
  let currentWidth = initialWidth;

  const getMatches = (query: string): boolean => {
    const minMatch = query.match(/\(min-width:\s*(\d+)px\)/);
    if (minMatch) return currentWidth >= Number(minMatch[1]);
    const maxMatch = query.match(/\(max-width:\s*(\d+)px\)/);
    if (maxMatch) return currentWidth <= Number(maxMatch[1]);
    return false;
  };

  const matchMedia = (query: string): MockMediaQueryList => ({
    media: query,
    get matches() {
      return getMatches(query);
    },
    addEventListener: (_type, listener) => {
      if (!listeners.has(query)) listeners.set(query, new Set());
      listeners.get(query)!.add(listener);
    },
    removeEventListener: (_type, listener) => {
      listeners.get(query)?.delete(listener);
    },
    dispatchEvent: () => true,
    onchange: null,
    addListener: (listener) => {
      if (!listeners.has(query)) listeners.set(query, new Set());
      listeners.get(query)!.add(listener);
    },
    removeListener: (listener) => {
      listeners.get(query)?.delete(listener);
    },
  });

  const setWidth = (width: number) => {
    currentWidth = width;
    for (const [query, set] of listeners.entries()) {
      const event = { matches: getMatches(query), media: query } as MediaQueryListEvent;
      for (const l of set) l(event);
    }
  };

  return { matchMedia, setWidth, listeners };
}

describe("useBreakpoint", () => {
  let mock: ReturnType<typeof createMatchMediaMock>;

  beforeEach(() => {
    mock = createMatchMediaMock(1280);
    vi.stubGlobal("matchMedia", mock.matchMedia);
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      configurable: true,
      value: mock.matchMedia,
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("reports desktop at >= 1024px", () => {
    mock.setWidth(1280);
    const { result } = renderHook(() => useBreakpoint());
    expect(result.current.isMobile).toBe(false);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.isDesktop).toBe(true);
  });

  it("reports tablet between 768px and 1023px", () => {
    mock.setWidth(900);
    const { result } = renderHook(() => useBreakpoint());
    expect(result.current.isMobile).toBe(false);
    expect(result.current.isTablet).toBe(true);
    expect(result.current.isDesktop).toBe(false);
  });

  it("reports mobile below 768px", () => {
    mock.setWidth(375);
    const { result } = renderHook(() => useBreakpoint());
    expect(result.current.isMobile).toBe(true);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.isDesktop).toBe(false);
  });

  it("treats exactly 768px as tablet (md boundary inclusive)", () => {
    mock.setWidth(768);
    const { result } = renderHook(() => useBreakpoint());
    expect(result.current.isMobile).toBe(false);
    expect(result.current.isTablet).toBe(true);
  });

  it("treats exactly 1024px as desktop (lg boundary inclusive)", () => {
    mock.setWidth(1024);
    const { result } = renderHook(() => useBreakpoint());
    expect(result.current.isDesktop).toBe(true);
    expect(result.current.isTablet).toBe(false);
  });

  it("updates when viewport crosses a breakpoint", () => {
    mock.setWidth(1280);
    const { result } = renderHook(() => useBreakpoint());
    expect(result.current.isDesktop).toBe(true);

    act(() => {
      mock.setWidth(400);
    });
    expect(result.current.isMobile).toBe(true);
    expect(result.current.isDesktop).toBe(false);

    act(() => {
      mock.setWidth(800);
    });
    expect(result.current.isTablet).toBe(true);
  });

  it("cleans up listeners on unmount", () => {
    mock.setWidth(1280);
    const { unmount } = renderHook(() => useBreakpoint());
    const beforeUnmount = Array.from(mock.listeners.values()).reduce(
      (sum, s) => sum + s.size,
      0
    );
    expect(beforeUnmount).toBeGreaterThan(0);

    unmount();

    const afterUnmount = Array.from(mock.listeners.values()).reduce(
      (sum, s) => sum + s.size,
      0
    );
    expect(afterUnmount).toBe(0);
  });
});
