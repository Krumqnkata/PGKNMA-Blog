import { describe, expect, it } from "vitest";

import { formatSiteDateTime, siteDateKey } from "./date-time";

describe("Bulgarian site time", () => {
  it("uses winter daylight offset", () => {
    expect(formatSiteDateTime("2026-01-15T12:00:00Z")).toContain("14:00");
  });

  it("uses summer daylight offset", () => {
    expect(formatSiteDateTime("2026-08-15T12:00:00Z")).toContain("15:00");
  });

  it("builds calendar keys in Europe/Sofia", () => {
    expect(siteDateKey("2026-08-31T21:30:00Z")).toBe("2026-09-01");
  });
});
