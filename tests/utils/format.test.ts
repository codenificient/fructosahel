import { describe, it, expect } from "vitest";
import {
  formatCurrency,
  formatDateString,
  formatRelativeDate,
  formatNumber,
  formatHectares,
  formatPercentage,
} from "@/lib/utils/format";

describe("formatCurrency", () => {
  it("formats currency in West African CFA Franc", () => {
    const result = formatCurrency(150000);
    expect(result).toContain("150");
    expect(result).toContain("000");
  });

  it("formats zero correctly", () => {
    const result = formatCurrency(0);
    expect(result).toContain("0");
  });

  it("formats negative amounts", () => {
    const result = formatCurrency(-5000);
    expect(result).toContain("5");
    expect(result).toContain("000");
  });

  it("formats large amounts correctly", () => {
    const result = formatCurrency(1000000);
    expect(result).toContain("1");
  });
});

describe("formatDateString", () => {
  it("formats a Date object with default format", () => {
    const date = new Date("2024-01-15T10:30:00");
    const result = formatDateString(date);
    expect(result).toBeTruthy();
    expect(typeof result).toBe("string");
  });

  it("formats a date string", () => {
    const result = formatDateString("2024-01-15");
    expect(result).toBeTruthy();
    expect(typeof result).toBe("string");
  });

  it("formats with custom format string", () => {
    const date = new Date("2024-01-15T12:00:00Z");
    const result = formatDateString(date, "yyyy-MM-dd");
    expect(result).toContain("2024-01");
  });

  it("formats with different format patterns", () => {
    const date = new Date("2024-01-15T10:30:00");
    const result = formatDateString(date, "MMMM d, yyyy");
    expect(result).toContain("2024");
    expect(result).toContain("15");
  });
});

describe("formatRelativeDate", () => {
  it('returns "just now" for dates less than a minute ago', () => {
    const date = new Date(Date.now() - 30 * 1000); // 30 seconds ago
    const result = formatRelativeDate(date);
    expect(result).toBe("just now");
  });

  it("returns minutes for recent dates", () => {
    const date = new Date(Date.now() - 5 * 60 * 1000); // 5 minutes ago
    const result = formatRelativeDate(date);
    expect(result).toContain("5 minutes ago");
  });

  it("returns hours for dates within 24 hours", () => {
    const date = new Date(Date.now() - 3 * 60 * 60 * 1000); // 3 hours ago
    const result = formatRelativeDate(date);
    expect(result).toContain("3 hours ago");
  });

  it('returns "yesterday" for dates 1 day ago', () => {
    const date = new Date(Date.now() - 24 * 60 * 60 * 1000); // 1 day ago
    const result = formatRelativeDate(date);
    expect(result).toBe("yesterday");
  });

  it("returns days for dates within a week", () => {
    const date = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000); // 3 days ago
    const result = formatRelativeDate(date);
    expect(result).toContain("3 days ago");
  });

  it("returns weeks for dates within a month", () => {
    const date = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000); // 2 weeks ago
    const result = formatRelativeDate(date);
    expect(result).toContain("2 weeks ago");
  });

  it("returns months for dates within a year", () => {
    const date = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000); // ~2 months ago
    const result = formatRelativeDate(date);
    expect(result).toContain("months ago");
  });

  it("returns years for dates over a year ago", () => {
    const date = new Date(Date.now() - 400 * 24 * 60 * 60 * 1000); // ~1 year ago
    const result = formatRelativeDate(date);
    expect(result).toContain("year");
    expect(result).toContain("ago");
  });

  it("handles string dates", () => {
    const date = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
    const result = formatRelativeDate(date);
    expect(result).toContain("2 days ago");
  });

  it("handles singular hour", () => {
    const date = new Date(Date.now() - 60 * 60 * 1000); // 1 hour ago
    const result = formatRelativeDate(date);
    expect(result).toBe("1 hour ago");
  });

  it("handles singular minute", () => {
    const date = new Date(Date.now() - 60 * 1000); // 1 minute ago
    const result = formatRelativeDate(date);
    expect(result).toBe("1 minute ago");
  });
});

describe("formatNumber", () => {
  it("formats a number with thousand separators", () => {
    const result = formatNumber(1234567);
    expect(result).toBeTruthy();
    expect(typeof result).toBe("string");
  });

  it("formats zero correctly", () => {
    const result = formatNumber(0);
    expect(result).toContain("0");
  });

  it("formats negative numbers", () => {
    const result = formatNumber(-1234);
    expect(result).toBeTruthy();
  });

  it("formats decimal numbers", () => {
    const result = formatNumber(1234.56);
    expect(result).toBeTruthy();
  });
});

describe("formatHectares", () => {
  it("formats hectares with default decimals", () => {
    const result = formatHectares(10.5);
    expect(result).toBe("10.50 ha");
  });

  it("formats with custom decimal places", () => {
    const result = formatHectares(10.5, 1);
    expect(result).toBe("10.5 ha");
  });

  it("formats zero hectares", () => {
    const result = formatHectares(0);
    expect(result).toBe("0.00 ha");
  });

  it("formats large hectare values", () => {
    const result = formatHectares(1000.75, 2);
    expect(result).toBe("1000.75 ha");
  });

  it("formats with no decimals", () => {
    const result = formatHectares(10, 0);
    expect(result).toBe("10 ha");
  });
});

describe("formatPercentage", () => {
  it("formats percentage with default decimals", () => {
    const result = formatPercentage(75.5);
    expect(result).toBe("75.5%");
  });

  it("formats with custom decimal places", () => {
    const result = formatPercentage(75.567, 2);
    expect(result).toBe("75.57%");
  });

  it("formats zero percentage", () => {
    const result = formatPercentage(0);
    expect(result).toBe("0.0%");
  });

  it("formats 100%", () => {
    const result = formatPercentage(100);
    expect(result).toBe("100.0%");
  });

  it("formats with no decimals", () => {
    const result = formatPercentage(50, 0);
    expect(result).toBe("50%");
  });

  it("formats small percentages", () => {
    const result = formatPercentage(0.5, 2);
    expect(result).toBe("0.50%");
  });
});
