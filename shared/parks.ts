// 公園資料的共用型別:前端畫面與後端 Google Places 轉接層都使用這個格式

export type ParkCategory = "walk" | "inclusive" | "slide" | "pet" | "bike";

export const PARK_CATEGORIES: ParkCategory[] = ["walk", "inclusive", "slide", "pet", "bike"];

export interface ParkReview {
  id: string;
  author: string;
  rating: number; // 1-5
  comment: string;
  date: string; // 顯示用,例如「2 週前」或 ISO 日期
}

export interface Park {
  id: string; // Google Place ID
  name: string;
  city: string;
  district: string;
  address: string;
  latitude: number;
  longitude: number;
  categories: ParkCategory[];
  funRating: number; // Google 星等 1-5(0 表示無評分)
  reviewCount: number;
  description: string;
  facilities: string[];
  googleMapsUrl: string;
  reviews: ParkReview[];
}

export const CITIES = [
  "全部", "台北市", "新北市", "桃園市", "台中市", "台南市", "高雄市",
  "基隆市", "新竹市", "新竹縣", "苗栗縣", "彰化縣", "南投縣",
  "雲林縣", "嘉義市", "嘉義縣", "屏東縣", "宜蘭縣", "花蓮縣", "台東縣",
  "澎湖縣", "金門縣", "連江縣",
];
