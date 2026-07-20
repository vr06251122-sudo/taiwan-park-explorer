// 正式環境時由同一個 Express 伺服器供應前端網頁(expo export 的產物)
// 這讓整個 App(前端 + API)可以部署成單一服務(例如 Render 免費方案)。
// 開發時 web-dist 不存在,此函式不做任何事,不影響本機開發流程。

import path from "path";
import fs from "fs";
import express, { type Express } from "express";

export function registerWebStatic(app: Express) {
  const webDist = path.resolve(process.cwd(), "web-dist");
  if (!fs.existsSync(path.join(webDist, "index.html"))) return;

  // HTML 不快取(每次都拿最新版,部署後手機不會卡舊畫面);
  // 帶 hash 檔名的 _expo 資源永久快取(檔名變了才會重新下載)
  app.use(
    express.static(webDist, {
      setHeaders: (res, filePath) => {
        if (filePath.endsWith(".html")) {
          res.setHeader("Cache-Control", "no-cache");
        } else if (filePath.includes(`${path.sep}_expo${path.sep}`)) {
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        }
      },
    })
  );

  // SPA fallback:非 /api 的路徑(例如 /park/xxx)一律回 index.html,
  // 由前端的 expo-router 依網址渲染正確頁面
  app.use((req, res, next) => {
    if (req.path.startsWith("/api")) {
      next();
      return;
    }
    res.setHeader("Cache-Control", "no-cache");
    res.sendFile(path.join(webDist, "index.html"));
  });

  console.log("[web] serving static web build from web-dist/");
}
