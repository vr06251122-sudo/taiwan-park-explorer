// NativeWind(react-native-css-interop)在建置「過程中」才會產生 .cache 下的樣式檔,
// 但 Metro 啟動時沒看到這些檔案就會報 "Failed to get the SHA-1" 而中斷(CI 常見)。
// 解法:建置前先把這些檔案建成空檔,讓 Metro 一開始就能索引到。
// (本機開發不受影響;檔案已存在時不會動到內容)

import fs from "node:fs";
import path from "node:path";

const cacheDir = path.resolve("node_modules/react-native-css-interop/.cache");
const files = ["web.css", "android.js", "ios.js", "macos.js", "native.js", "windows.js"];

fs.mkdirSync(cacheDir, { recursive: true });
for (const file of files) {
  const p = path.join(cacheDir, file);
  if (!fs.existsSync(p)) fs.writeFileSync(p, "");
}
console.log("[ensure-css-cache] css-interop cache files ready");
