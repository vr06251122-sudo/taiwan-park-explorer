import { describe, it, expect } from "vitest";
import { haversineKm, formatDistance } from "../lib/geo";

describe("Geo utilities", () => {
  it("should return 0 for identical points", () => {
    expect(haversineKm(25.033, 121.5654, 25.033, 121.5654)).toBe(0);
  });

  it("should compute Taipei to Kaohsiung distance (~300km)", () => {
    // 台北車站 → 高雄車站 直線距離約 297 公里
    const d = haversineKm(25.0478, 121.517, 22.6394, 120.3022);
    expect(d).toBeGreaterThan(280);
    expect(d).toBeLessThan(320);
  });

  it("should format distances readably", () => {
    expect(formatDistance(0.85)).toBe("850 m");
    expect(formatDistance(3.24)).toBe("3.2 km");
    expect(formatDistance(12.6)).toBe("13 km");
  });
});
