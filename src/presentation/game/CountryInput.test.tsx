import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CountryInput } from "./CountryInput";

function setup(overrides: Partial<React.ComponentProps<typeof CountryInput>> = {}) {
  const onSubmit = vi.fn();
  const utils = render(
    <CountryInput onSubmit={onSubmit} autoFocus={false} {...overrides} />
  );
  const input = screen.getByPlaceholderText(/type a country/i) as HTMLInputElement;
  return { onSubmit, input, ...utils };
}

function getSuggestionButtons(): HTMLElement[] {
  // Suggestion buttons are rendered beneath the input. Each contains a
  // country name inside a child div.
  return Array.from(
    document.querySelectorAll<HTMLElement>("button[type='button']")
  );
}

describe("CountryInput — filtering & display", () => {
  it("renders the input with placeholder", () => {
    setup();
    expect(screen.getByPlaceholderText(/type a country/i)).toBeInTheDocument();
  });

  it("shows no suggestions when input is empty", () => {
    setup();
    expect(getSuggestionButtons()).toHaveLength(0);
  });

  it("shows matching suggestions when typing", () => {
    const { input } = setup();
    fireEvent.change(input, { target: { value: "Alg" } });
    const buttons = getSuggestionButtons();
    expect(buttons.length).toBeGreaterThan(0);
    expect(buttons.some((b) => b.textContent?.includes("Algeria"))).toBe(true);
  });

  it("caps suggestions at 8", () => {
    const { input } = setup();
    // Single letter matches many countries
    fireEvent.change(input, { target: { value: "a" } });
    expect(getSuggestionButtons().length).toBeLessThanOrEqual(8);
  });

  it("excludes codes passed via excludeCodes", () => {
    const { input } = setup({ excludeCodes: ["DZ"] });
    fireEvent.change(input, { target: { value: "Alg" } });
    expect(
      getSuggestionButtons().some((b) => b.textContent?.includes("Algeria"))
    ).toBe(false);
  });
});

describe("CountryInput — keyboard", () => {
  it("submits highlighted suggestion on Enter after ArrowDown", () => {
    const { input, onSubmit } = setup();
    fireEvent.change(input, { target: { value: "Alg" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onSubmit).toHaveBeenCalledWith("Algeria");
  });

  it("ArrowDown moves selection, Enter submits the new selection", () => {
    const { input, onSubmit } = setup();
    fireEvent.change(input, { target: { value: "a" } });
    const buttons = getSuggestionButtons();
    const secondName = buttons[1].textContent;
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onSubmit).toHaveBeenCalledTimes(1);
    // The submitted name should appear in the second suggestion's text
    const submitted = onSubmit.mock.calls[0][0] as string;
    expect(secondName).toContain(submitted);
  });

  it("Escape closes the dropdown", () => {
    const { input } = setup();
    fireEvent.change(input, { target: { value: "Alg" } });
    expect(getSuggestionButtons().length).toBeGreaterThan(0);
    fireEvent.keyDown(input, { key: "Escape" });
    expect(getSuggestionButtons()).toHaveLength(0);
  });

  it("submits raw value on Enter when no suggestions match", () => {
    const { input, onSubmit } = setup();
    fireEvent.change(input, { target: { value: "zzzzz" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onSubmit).toHaveBeenCalledWith("zzzzz");
  });

  it("clears the input after submission", () => {
    const { input } = setup();
    fireEvent.change(input, { target: { value: "Alg" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(input.value).toBe("");
  });
});

describe("CountryInput — pointer / touch", () => {
  it("submits a suggestion when tapped (pointerdown)", () => {
    const { input, onSubmit } = setup();
    fireEvent.change(input, { target: { value: "Alg" } });
    const target = getSuggestionButtons().find((b) =>
      b.textContent?.includes("Algeria")
    )!;
    fireEvent.pointerDown(target);
    expect(onSubmit).toHaveBeenCalledWith("Algeria");
  });

  it("pointerdown prevents default so the input does not blur mid-tap", () => {
    const { input } = setup();
    fireEvent.change(input, { target: { value: "Alg" } });
    const target = getSuggestionButtons()[0];

    const pointerEvent = new Event("pointerdown", {
      bubbles: true,
      cancelable: true,
    });
    const prevented = !target.dispatchEvent(pointerEvent);
    // If the handler called preventDefault(), dispatchEvent returns false
    expect(prevented).toBe(true);
  });
});

describe("CountryInput — tap target sizing", () => {
  it("suggestion buttons meet the 44px minimum tap target", () => {
    const { input } = setup();
    fireEvent.change(input, { target: { value: "Alg" } });
    const buttons = getSuggestionButtons();
    expect(buttons.length).toBeGreaterThan(0);
    for (const b of buttons) {
      // Regression guard: must carry a class enforcing >= 44px height.
      // Allow either `min-h-[44px]` or larger, or `h-11`/`h-12` (44/48px).
      const cls = b.className;
      const ok =
        /min-h-\[(4[4-9]|[5-9]\d)px\]/.test(cls) ||
        /\bh-(1[1-9]|[2-9]\d)\b/.test(cls);
      expect(ok, `button missing adequate tap-target class: ${cls}`).toBe(true);
    }
  });
});
