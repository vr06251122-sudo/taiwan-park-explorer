# 開發歷程:從 Manus 原型到上線產品

這份文件記錄「台灣公園探索」如何從 Manus 匯出的原型,一步步變成可日常使用的線上 App。給未來的自己(或協作者)回顧用。

## 起點

- Manus 匯出到 GitHub 的 Expo(React Native)專案,可跑 Web / iOS / Android
- 技術棧:Expo Router(檔案式路由)+ NativeWind(Tailwind)+ tRPC/Express 後端 + Drizzle ORM
- **原型的真相**:20 筆公園資料寫死在前端(`data/parks.ts`),收藏/評論存手機本地 AsyncStorage,後端只是模板腳手架(有 auth + MySQL 架構但沒被功能用到)

## 開發階段(依時間)

### 1. 找到並 clone
用 GitHub 公開 API 依 email/使用者名稱找到帳號 → 確認 repo(私有需設 Public 或登入 gh CLI)→ clone 到本機 → 讀懂架構、讀 todo.md → 產出架構總結。

### 2. 三個前端功能(免金鑰服務優先)
- **使用者定位**:`expo-location` + Haversine 距離計算,首頁「離你最近」、搜尋依距離排序
- **天氣整合**:Open-Meteo API(免金鑰),詳情頁顯示即時天氣與降雨機率
- **地圖模式**:自製 OpenStreetMap 圖磚元件(免金鑰),分類專屬圖示標記

### 3. 改接真實資料(Google Places API)
關鍵決策:**不自建資料庫**,把 App 定位成「Google 地圖公園資訊彙總器」。
- 公園、星等、評論即時來自 Google Places API (New)
- **金鑰安全**:只存 server 端 `.env`(gitignore),前端經 tRPC 轉發(`server/googlePlaces.ts`)
- 評論寫入走 Google 深層連結(Google 不開放 API 寫評論)
- 五大分類靠中文關鍵字搜尋策略策展(這是相對於 Google 地圖的附加價值)
- 照片經 `/api/photo` 轉發(金鑰不出後端,圖片由 Google CDN 供應)

### 4. 部署上線(Render 免費方案)
- 讓 Express 在正式環境同時供應前端網頁(`server/webStatic.ts`)+ API
- `render.yaml` Blueprint 連 GitHub main 自動部署,金鑰設環境變數
- 網址:`https://taiwan-park-explorer.onrender.com`

### 5. 產品化收尾
- 暖米白主題(綠色只留按鈕/強調),鎖定淺色避免深色手機破版
- 文字對比:深色版分類色(`CATEGORY_DARK_COLORS`)
- 定位優先:搜尋/導航頁預設以使用者位置為中心
- PWA 加入主畫面、骨架屏載入、下拉重新整理
- UptimeRobot 每 5 分鐘 ping `/api/health` 防休眠

## 踩過的坑(給未來的自己)

| 症狀 | 原因 | 解法 |
|------|------|------|
| Expo 啟動崩潰 `fetch failed` | 連不上 api.expo.dev 做版本檢查 | `expo start --offline` |
| `${EXPO_PORT:-8081}` 沒展開 | POSIX 語法在 Windows PowerShell 不通 | 直接寫死 port 或用 bash |
| Render `EROFS unlink /usr/bin/pnpm` | corepack enable 想寫唯讀系統目錄 | 移除 corepack,靠 package.json 的 packageManager |
| Render `Failed to get SHA-1 web.css` | NativeWind 快取檔建置中途才生成 | `scripts/ensure-css-cache.mjs` 預建空檔 |
| Render「部署成功但內容是舊版」 | 建置快取殘留舊產物 | Clear build cache & deploy;`scripts/clean-build.mjs` 預清 |
| 手機深色模式半深半淺破版 | 網頁版 hook 跟隨系統深色 | 鎖定淺色(theme-provider + use-color-scheme.web.ts) |
| 配色改柔和後文字看不清 | 文字用了柔和色 | 淡色只當背景,文字/標籤用深色版 |
| 手機滑動卡頓/誤觸 | 捲動容器包捲動清單(FlatList in ScrollView) | 改單純排版 |

## 架構總結

```
手機/PWA
  → Render(單一 Express 服務)
      ├── 供應前端網頁(web-dist,Expo 靜態匯出)
      └── /api/trpc → Google Places API(金鑰藏後端)
          /api/photo → Google 照片轉發
  → 天氣直連 Open-Meteo(免金鑰)
  → 地圖直連 OpenStreetMap 圖磚(免金鑰)
  → 收藏存手機 AsyncStorage(只存 place id)
```

**零資料庫、金鑰不外洩、免費額度內運作、GitHub push 自動部署。**
