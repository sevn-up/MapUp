import { describe, it, expect } from "vitest";
import {
  getMobileTopPanelHeight,
  DEFAULT_MOBILE_TOP_PANEL_HEIGHT,
} from "./gameLayoutConfig";

describe("getMobileTopPanelHeight", () => {
  it("returns the configured height for known game paths", () => {
    expect(getMobileTopPanelHeight("/worldle")).toBe("25dvh");
    expect(getMobileTopPanelHeight("/population")).toBe("20dvh");
    expect(getMobileTopPanelHeight("/name-all")).toBe("45dvh");
    expect(getMobileTopPanelHeight("/capitals")).toBe("30dvh");
    expect(getMobileTopPanelHeight("/flag-quiz")).toBe("30dvh");
    expect(getMobileTopPanelHeight("/country-shape")).toBe("30dvh");
  });

  it("falls back to the default for unknown paths", () => {
    expect(getMobileTopPanelHeight("/")).toBe(DEFAULT_MOBILE_TOP_PANEL_HEIGHT);
    expect(getMobileTopPanelHeight("/street-view")).toBe(
      DEFAULT_MOBILE_TOP_PANEL_HEIGHT
    );
    expect(getMobileTopPanelHeight("/something-unknown")).toBe(
      DEFAULT_MOBILE_TOP_PANEL_HEIGHT
    );
  });

  it("returns values in dvh so iOS Safari's address bar doesn't cause flicker", () => {
    expect(getMobileTopPanelHeight("/worldle")).toMatch(/dvh$/);
    expect(getMobileTopPanelHeight("/")).toMatch(/dvh$/);
  });
});
