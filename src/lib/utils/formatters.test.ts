import { describe, it, expect } from "vitest";
import {
  formatNumber,
  formatDistance,
  formatTime,
  formatPercentage,
} from "./formatters";

describe("formatNumber", () => {
  it("formats integers with locale separators", () => {
    expect(formatNumber(1000)).toBe("1,000");
    expect(formatNumber(1000000)).toBe("1,000,000");
  });

  it("handles zero and small numbers", () => {
    expect(formatNumber(0)).toBe("0");
    expect(formatNumber(42)).toBe("42");
  });
});

describe("formatDistance", () => {
  it("uses meters under 1 km", () => {
    expect(formatDistance(0.5)).toBe("500 m");
    expect(formatDistance(0.123)).toBe("123 m");
  });

  it("uses one decimal km under 100 km", () => {
    expect(formatDistance(12.345)).toBe("12.3 km");
    expect(formatDistance(99.9)).toBe("99.9 km");
  });

  it("rounds and formats km above 100", () => {
    expect(formatDistance(1234)).toBe("1,234 km");
    expect(formatDistance(100.6)).toBe("101 km");
  });
});

describe("formatTime", () => {
  it("pads seconds with leading zero", () => {
    expect(formatTime(65)).toBe("1:05");
    expect(formatTime(9)).toBe("0:09");
  });

  it("handles exact minutes", () => {
    expect(formatTime(0)).toBe("0:00");
    expect(formatTime(120)).toBe("2:00");
  });
});

describe("formatPercentage", () => {
  it("returns 0% when total is zero", () => {
    expect(formatPercentage(5, 0)).toBe("0%");
  });

  it("rounds to whole percentages", () => {
    expect(formatPercentage(1, 3)).toBe("33%");
    expect(formatPercentage(2, 3)).toBe("67%");
    expect(formatPercentage(10, 10)).toBe("100%");
  });
});
