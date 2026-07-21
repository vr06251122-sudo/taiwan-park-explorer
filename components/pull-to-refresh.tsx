import React, { useRef, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import { useColors } from "@/hooks/use-colors";

const TRIGGER_DISTANCE = 90;

interface PullToRefreshProps {
  /** 頁面捲動位置(由頁面的 onScroll 持續更新);在頂端時才允許下拉觸發 */
  scrollOffset: React.MutableRefObject<number>;
  children: React.ReactNode;
}

/**
 * 下拉重新整理:在列表頂端往下拉超過門檻,
 * 就重新抓取畫面上所有 react-query 資料(公園、天氣)。
 * RN-web 沒有內建 RefreshControl,這裡用觸控事件自製,web 與原生都適用。
 */
export function PullToRefresh({ scrollOffset, children }: PullToRefreshProps) {
  const colors = useColors();
  const queryClient = useQueryClient();
  const startY = useRef<number | null>(null);
  const triggered = useRef(false);
  const [state, setState] = useState<"idle" | "pulling" | "refreshing">("idle");

  return (
    <View
      style={{ flex: 1 }}
      onTouchStart={(e) => {
        if (scrollOffset.current <= 1) {
          startY.current = e.nativeEvent.pageY;
          triggered.current = false;
        } else {
          startY.current = null;
        }
      }}
      onTouchMove={(e) => {
        if (startY.current == null || triggered.current) return;
        const dy = e.nativeEvent.pageY - startY.current;
        if (dy > TRIGGER_DISTANCE) {
          triggered.current = true;
          setState("refreshing");
          queryClient
            .invalidateQueries()
            .finally(() => {
              setState("idle");
              startY.current = null;
              triggered.current = false;
            });
        } else if (dy > 24 && state === "idle") {
          setState("pulling");
        }
      }}
      onTouchEnd={() => {
        if (state === "pulling") setState("idle");
        startY.current = null;
      }}
    >
      {state !== "idle" && (
        <View style={styles.bar}>
          {state === "refreshing" && <ActivityIndicator size="small" color={colors.primary} />}
          <Text style={[styles.text, { color: colors.muted }]}>
            {state === "refreshing" ? "更新中..." : "繼續下拉重新整理"}
          </Text>
        </View>
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 8,
  },
  text: {
    fontSize: 13,
  },
});
