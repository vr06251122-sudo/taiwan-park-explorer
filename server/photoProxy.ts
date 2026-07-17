// Google Places 照片轉發:前端請求 /api/photo?name=places/xxx/photos/yyy&w=400
// server 用金鑰向 Google 換取實際圖片網址(googleusercontent,不含金鑰)後轉址過去。
// 這樣金鑰不會出現在前端,而圖片本身仍由 Google CDN 直接供應。

import type { Express } from "express";

const uriCache = new Map<string, { uri: string; expires: number }>();
const CACHE_TTL_MS = 30 * 60 * 1000;

export function registerPhotoProxy(app: Express) {
  app.get("/api/photo", async (req, res) => {
    try {
      const name = String(req.query.name ?? "");
      const width = Math.min(parseInt(String(req.query.w ?? "400"), 10) || 400, 1600);

      if (!/^places\/[^/]+\/photos\/[^/]+$/.test(name)) {
        res.status(400).json({ error: "invalid photo name" });
        return;
      }
      const key = process.env.GOOGLE_PLACES_API_KEY ?? "";
      if (!key) {
        res.status(500).json({ error: "GOOGLE_PLACES_API_KEY not configured" });
        return;
      }

      const cacheKey = `${name}@${width}`;
      const hit = uriCache.get(cacheKey);
      if (hit && hit.expires > Date.now()) {
        res.redirect(hit.uri);
        return;
      }

      const r = await fetch(
        `https://places.googleapis.com/v1/${name}/media?maxWidthPx=${width}&skipHttpRedirect=true&key=${key}`
      );
      if (!r.ok) {
        res.status(502).json({ error: `photo fetch failed: ${r.status}` });
        return;
      }
      const data = (await r.json()) as { photoUri?: string };
      if (!data.photoUri) {
        res.status(502).json({ error: "no photoUri in response" });
        return;
      }
      uriCache.set(cacheKey, { uri: data.photoUri, expires: Date.now() + CACHE_TTL_MS });
      res.redirect(data.photoUri);
    } catch (err) {
      res.status(500).json({ error: String(err) });
    }
  });
}
