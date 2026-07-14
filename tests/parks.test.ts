import { describe, it, expect } from "vitest";
import {
  TAIWAN_PARKS,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  CITIES,
  type ParkCategory,
} from "../data/parks";

describe("Park Data", () => {
  it("should have parks defined", () => {
    expect(TAIWAN_PARKS.length).toBeGreaterThan(0);
  });

  it("should have all required fields for each park", () => {
    TAIWAN_PARKS.forEach((park) => {
      expect(park.id).toBeTruthy();
      expect(park.name).toBeTruthy();
      expect(park.city).toBeTruthy();
      expect(park.district).toBeTruthy();
      expect(park.address).toBeTruthy();
      expect(park.categories.length).toBeGreaterThan(0);
      expect(park.funRating).toBeGreaterThanOrEqual(1);
      expect(park.funRating).toBeLessThanOrEqual(5);
      expect(park.description).toBeTruthy();
      expect(park.facilities.length).toBeGreaterThan(0);
      expect(park.googleMapsUrl).toBeTruthy();
      expect(park.reviews).toBeDefined();
    });
  });

  it("should have unique park IDs", () => {
    const ids = TAIWAN_PARKS.map((p) => p.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("should have valid categories", () => {
    const validCategories: ParkCategory[] = ["walk", "inclusive", "slide", "pet", "bike"];
    TAIWAN_PARKS.forEach((park) => {
      park.categories.forEach((cat) => {
        expect(validCategories).toContain(cat);
      });
    });
  });

  it("should have all 5 category labels", () => {
    expect(Object.keys(CATEGORY_LABELS).length).toBe(5);
    expect(CATEGORY_LABELS.walk).toBe("單純散步");
    expect(CATEGORY_LABELS.inclusive).toBe("共融式");
    expect(CATEGORY_LABELS.slide).toBe("簡單溜滑梯");
    expect(CATEGORY_LABELS.pet).toBe("寵物");
    expect(CATEGORY_LABELS.bike).toBe("滑步車");
  });

  it("should have category colors for all categories", () => {
    expect(Object.keys(CATEGORY_COLORS).length).toBe(5);
  });

  it("should have cities list with 全部 option", () => {
    expect(CITIES[0]).toBe("全部");
    expect(CITIES.length).toBeGreaterThan(10);
  });

  it("should have reviews with valid ratings", () => {
    TAIWAN_PARKS.forEach((park) => {
      park.reviews.forEach((review) => {
        expect(review.rating).toBeGreaterThanOrEqual(1);
        expect(review.rating).toBeLessThanOrEqual(5);
        expect(review.author).toBeTruthy();
        expect(review.comment).toBeTruthy();
      });
    });
  });

  it("should have parks from multiple cities", () => {
    const cities = new Set(TAIWAN_PARKS.map((p) => p.city));
    expect(cities.size).toBeGreaterThanOrEqual(3);
  });

  it("should have at least one park per category", () => {
    const allCategories = new Set<string>();
    TAIWAN_PARKS.forEach((p) => p.categories.forEach((c) => allCategories.add(c)));
    expect(allCategories.size).toBe(5);
  });
});
