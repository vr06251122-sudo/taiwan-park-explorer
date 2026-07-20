import { ScrollViewStyleReset } from "expo-router/html";
import type { PropsWithChildren } from "react";

/**
 * 網頁版靜態匯出的 HTML 外殼。
 * 這裡加上 PWA 所需的 manifest 與 iOS「加入主畫面」的 meta,
 * 讓手機可以把 App 安裝到主畫面、以全螢幕獨立視窗開啟。
 */
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="zh-Hant-TW">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover"
        />
        <title>台灣公園探索</title>
        <meta
          name="description"
          content="即時彙整 Google 地圖公園資訊:共融遊戲場、寵物友善空間與滑步車場地"
        />

        {/* PWA */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#4E8C61" />

        {/* iOS 加入主畫面 */}
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="公園導航" />

        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}
