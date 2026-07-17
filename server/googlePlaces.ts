// Google Places API (New) 轉接層
// 金鑰只存在於伺服器端(.env 的 GOOGLE_PLACES_API_KEY),前端一律透過 tRPC 呼叫
// 文件:https://developers.google.com/maps/documentation/places/web-service/op-overview

import type { Park, ParkCategory, ParkReview } from "../shared/parks";
import { CITIES } from "../shared/parks";

const BASE_URL = "https://places.googleapis.com/v1";

// 各分類對應的 Google 搜尋關鍵字 — 這是本 App 的「策展」核心
export const CATEGORY_QUERIES: Record<ParkCategory, string> = {
  walk: "適合散步的公園",
  inclusive: "共融式遊戲場",
  slide: "有溜滑梯的公園",
  pet: "寵物友善公園",
  bike: "滑步車練習場地",
};

const LIST_FIELD_MASK = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.location",
  "places.rating",
  "places.userRatingCount",
  "places.editorialSummary",
  "places.googleMapsUri",
  "places.types",
].join(",");

const DETAIL_FIELD_MASK = [
  "id",
  "displayName",
  "formattedAddress",
  "location",
  "rating",
  "userRatingCount",
  "editorialSummary",
  "googleMapsUri",
  "types",
  "reviews",
].join(",");

interface GooglePlace {
  id: string;
  displayName?: { text?: string };
  formattedAddress?: string;
  location?: { latitude?: number; longitude?: number };
  rating?: number;
  userRatingCount?: number;
  editorialSummary?: { text?: string };
  googleMapsUri?: string;
  types?: string[];
  reviews?: {
    name?: string;
    rating?: number;
    text?: { text?: string };
    authorAttribution?: { displayName?: string };
    relativePublishTimeDescription?: string;
    publishTime?: string;
  }[];
}

function getApiKey(): string {
  const key = process.env.GOOGLE_PLACES_API_KEY ?? "";
  if (!key) {
    throw new Error("GOOGLE_PLACES_API_KEY 未設定,請在 .env 中加入");
  }
  return key;
}

/** 從 Google 的完整地址解析出縣市與行政區,例如「10491台灣臺北市中山區龍江街6號」 */
export function parseAddress(address: string): { city: string; district: string } {
  const normalized = address.replace(/臺/g, "台");
  const city = CITIES.find((c) => c !== "全部" && normalized.includes(c)) ?? "";
  let district = "";
  if (city) {
    const after = normalized.slice(normalized.indexOf(city) + city.length);
    const m = after.match(/^(.{1,3}?(?:區|鄉|鎮|市))/);
    district = m ? m[1] : "";
  }
  return { city, district };
}

/** 從 Google 的 place types 推斷分類(搜尋時會再依查詢的分類補上標籤) */
function inferCategories(types: string[] | undefined): ParkCategory[] {
  const cats = new Set<ParkCategory>();
  if (types?.includes("dog_park")) cats.add("pet");
  if (types?.includes("playground")) cats.add("slide");
  if (cats.size === 0) cats.add("walk");
  return [...cats];
}

function toPark(place: GooglePlace, taggedCategories: ParkCategory[] = []): Park {
  const address = place.formattedAddress ?? "";
  const { city, district } = parseAddress(address);
  const inferred = inferCategories(place.types);
  const categories = [...new Set([...taggedCategories, ...inferred])];

  const reviews: ParkReview[] = (place.reviews ?? []).map((r, i) => ({
    id: r.name ?? `review_${i}`,
    author: r.authorAttribution?.displayName ?? "Google 使用者",
    rating: r.rating ?? 0,
    comment: r.text?.text ?? "",
    date: r.relativePublishTimeDescription ?? (r.publishTime ?? "").slice(0, 10),
  }));

  return {
    id: place.id,
    name: place.displayName?.text ?? "未命名地點",
    city,
    district,
    address: address.replace(/^\d+\s*/, ""), // 去掉開頭郵遞區號
    latitude: place.location?.latitude ?? 0,
    longitude: place.location?.longitude ?? 0,
    categories,
    funRating: place.rating ?? 0,
    reviewCount: place.userRatingCount ?? 0,
    description: place.editorialSummary?.text ?? "",
    facilities: [],
    googleMapsUrl: place.googleMapsUri ?? "",
    reviews,
  };
}

async function placesRequest(path: string, options: RequestInit, fieldMask: string) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": getApiKey(),
      "X-Goog-FieldMask": fieldMask,
      ...options.headers,
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Google Places API ${res.status}: ${body.slice(0, 300)}`);
  }
  return res.json();
}

async function textSearch(textQuery: string): Promise<GooglePlace[]> {
  const data = await placesRequest(
    "/places:searchText",
    {
      method: "POST",
      body: JSON.stringify({
        textQuery,
        languageCode: "zh-TW",
        regionCode: "TW",
        maxResultCount: 15,
      }),
    },
    LIST_FIELD_MASK
  );
  return data.places ?? [];
}

export interface SearchParksInput {
  text?: string;
  city?: string;
  categories?: ParkCategory[];
}

/** 搜尋公園:依分類各發一個關鍵字查詢,合併去重,並標上該分類 */
export async function searchParks({ text, city, categories }: SearchParksInput): Promise<Park[]> {
  const cityPart = city && city !== "全部" ? city : "台灣";
  const textPart = text?.trim() ?? "";

  const queries: { q: string; cat?: ParkCategory }[] =
    categories && categories.length > 0
      ? categories.map((cat) => ({
          q: `${cityPart} ${CATEGORY_QUERIES[cat]} ${textPart}`.trim(),
          cat,
        }))
      : [{ q: `${cityPart} ${textPart || "公園"}`.trim() }];

  const resultSets = await Promise.all(queries.map(({ q }) => textSearch(q)));

  const merged = new Map<string, Park>();
  resultSets.forEach((places, i) => {
    const cat = queries[i].cat;
    for (const place of places) {
      const existing = merged.get(place.id);
      if (existing) {
        if (cat && !existing.categories.includes(cat)) existing.categories.push(cat);
      } else {
        merged.set(place.id, toPark(place, cat ? [cat] : []));
      }
    }
  });
  return [...merged.values()];
}

/** 依座標找附近的公園,由近到遠 */
export async function nearbyParks(latitude: number, longitude: number): Promise<Park[]> {
  const data = await placesRequest(
    "/places:searchNearby",
    {
      method: "POST",
      body: JSON.stringify({
        includedTypes: ["park"],
        languageCode: "zh-TW",
        regionCode: "TW",
        maxResultCount: 12,
        rankPreference: "DISTANCE",
        locationRestriction: {
          circle: { center: { latitude, longitude }, radius: 15000 },
        },
      }),
    },
    LIST_FIELD_MASK
  );
  return ((data.places ?? []) as GooglePlace[]).map((p) => toPark(p));
}

/** 單一公園完整資訊(含最多 5 則 Google 評論) */
export async function parkDetails(placeId: string): Promise<Park> {
  const data = await placesRequest(
    `/places/${encodeURIComponent(placeId)}?languageCode=zh-TW&regionCode=TW`,
    { method: "GET" },
    DETAIL_FIELD_MASK
  );
  return toPark(data as GooglePlace);
}

/** 批次取得多個公園(收藏頁用),單筆失敗不影響其他 */
export async function parksByIds(ids: string[]): Promise<Park[]> {
  const results = await Promise.allSettled(ids.map((id) => parkDetails(id)));
  return results
    .filter((r): r is PromiseFulfilledResult<Park> => r.status === "fulfilled")
    .map((r) => r.value);
}
