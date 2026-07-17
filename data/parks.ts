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

export const CATEGORY_COLORS: Record<ParkCategory, string> = {
  walk: "#2D7A3E",
  inclusive: "#4A90D9",
  slide: "#F5A623",
  pet: "#8B5E3C",
  bike: "#E8554E",
};

export const CATEGORY_ICONS: Record<ParkCategory, string> = {
  walk: "directions-walk",
  inclusive: "accessible",
  slide: "child-care",
  pet: "pets",
  bike: "directions-bike",
};
