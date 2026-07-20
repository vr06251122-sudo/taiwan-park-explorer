// 台灣公園探索 - 前端 UI 常數
// 公園資料已改為即時向 Google Places API 撈取(見 server/googlePlaces.ts),
// 型別定義統一放在 shared/parks.ts,這裡只留畫面用的分類常數。

export type { Park, ParkReview, ParkCategory } from "../shared/parks";
export { CITIES, PARK_CATEGORIES } from "../shared/parks";

import type { ParkCategory } from "../shared/parks";

export const CATEGORY_LABELS: Record<ParkCategory, string> = {
  walk: "散步放空",
  inclusive: "共融遊戲場",
  slide: "溜滑梯",
  pet: "遛狗放風",
  bike: "滑步車",
};

export const CATEGORY_EMOJI: Record<ParkCategory, string> = {
  walk: "🚶",
  inclusive: "🤝",
  slide: "🛝",
  pet: "🐾",
  bike: "🚲",
};

// 柔和版分類色:降低飽和度,視覺更溫和(用於淡色背景、圖示)
export const CATEGORY_COLORS: Record<ParkCategory, string> = {
  walk: "#6AA379",
  inclusive: "#7BABD9",
  slide: "#E3B05E",
  pet: "#B08D6C",
  bike: "#D98B85",
};

// 深色版分類色:用於文字與需要襯白字的底色,確保可讀性
export const CATEGORY_DARK_COLORS: Record<ParkCategory, string> = {
  walk: "#3E7050",
  inclusive: "#3F6FA3",
  slide: "#96691C",
  pet: "#7A5B3C",
  bike: "#A34E47",
};

export const CATEGORY_ICONS: Record<ParkCategory, string> = {
  walk: "directions-walk",
  inclusive: "accessible",
  slide: "child-care",
  pet: "pets",
  bike: "directions-bike",
};
