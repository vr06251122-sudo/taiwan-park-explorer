import { describe, it, expect } from "vitest";
import { CATEGORY_LABELS, CATEGORY_COLORS, CITIES } from "../data/parks";
import { parseAddress, CATEGORY_QUERIES } from "../server/googlePlaces";

describe("Category constants", () => {
  it("should have all 5 category labels", () => {
    expect(Object.keys(CATEGORY_LABELS).length).toBe(5);
    expect(CATEGORY_LABELS.walk).toBe("散步放空");
    expect(CATEGORY_LABELS.inclusive).toBe("共融遊戲場");
    expect(CATEGORY_LABELS.slide).toBe("溜滑梯");
    expect(CATEGORY_LABELS.pet).toBe("遛狗放風");
    expect(CATEGORY_LABELS.bike).toBe("滑步車");
  });

  it("should have category colors for all categories", () => {
    expect(Object.keys(CATEGORY_COLORS).length).toBe(5);
  });

  it("should have a Google search query for every category", () => {
    expect(Object.keys(CATEGORY_QUERIES).length).toBe(5);
    Object.values(CATEGORY_QUERIES).forEach((q) => expect(q.length).toBeGreaterThan(0));
  });

  it("should have cities list with 全部 option", () => {
    expect(CITIES[0]).toBe("全部");
    expect(CITIES.length).toBeGreaterThan(10);
  });
});

describe("parseAddress", () => {
  it("should parse city and district from Google formatted address", () => {
    expect(parseAddress("10491台灣台北市中山區龍江街6號")).toEqual({
      city: "台北市",
      district: "中山區",
    });
  });

  it("should normalize 臺 to 台", () => {
    expect(parseAddress("407台灣臺中市西屯區中科路2966號")).toEqual({
      city: "台中市",
      district: "西屯區",
    });
  });

  it("should handle townships (鄉/鎮)", () => {
    expect(parseAddress("264台灣宜蘭縣員山鄉員山路一段")).toEqual({
      city: "宜蘭縣",
      district: "員山鄉",
    });
  });

  it("should return empty strings for unrecognized address", () => {
    expect(parseAddress("Somewhere in Tokyo, Japan")).toEqual({ city: "", district: "" });
  });
});
