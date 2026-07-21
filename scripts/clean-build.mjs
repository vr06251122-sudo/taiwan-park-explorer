// 建置前清除舊產物,避免 CI 快取殘留舊的 web-dist/dist
// 造成「部署成功但內容是舊版」的假象
import fs from "node:fs";

for (const dir of ["web-dist", "dist"]) {
  fs.rmSync(dir, { recursive: true, force: true });
}
console.log("[clean-build] removed stale web-dist/ and dist/");
