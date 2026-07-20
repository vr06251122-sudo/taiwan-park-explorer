import { useThemeContext } from "@/lib/theme-provider";

/**
 * Web 版與原生版一致:一律讀 ThemeProvider 的主題(目前鎖定淺色)。
 * 之前這裡在 hydration 後改讀系統深色設定,導致深色模式手機
 * 「載入時是淺色、一秒後跳成深色」的閃跳問題。
 */
export function useColorScheme() {
  return useThemeContext().colorScheme;
}
