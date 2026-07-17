import { getApiBaseUrl } from "@/constants/oauth";

/** 把 Google 照片資源名稱轉成經自家 server 轉發的圖片網址(金鑰不外露) */
export function getPhotoUrl(photoName: string, width = 400): string {
  return `${getApiBaseUrl()}/api/photo?name=${encodeURIComponent(photoName)}&w=${width}`;
}
