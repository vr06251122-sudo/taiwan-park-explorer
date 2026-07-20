import { useEffect, useRef } from "react";
import { Animated, View, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { useColors } from "@/hooks/use-colors";

/** 呼吸閃爍的灰色佔位方塊 */
export function SkeletonBlock({ style }: { style?: StyleProp<ViewStyle> }) {
  const colors = useColors();
  const opacity = useRef(new Animated.Value(0.45)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.9, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.45, duration: 700, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[styles.block, { backgroundColor: colors.border, opacity }, style]}
    />
  );
}

/** 公園卡片的骨架:縮圖 + 三行文字,載入時代替轉圈圈 */
export function SkeletonParkCard() {
  const colors = useColors();
  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <SkeletonBlock style={styles.thumb} />
      <View style={styles.lines}>
        <SkeletonBlock style={styles.lineWide} />
        <SkeletonBlock style={styles.lineMid} />
        <SkeletonBlock style={styles.lineNarrow} />
      </View>
    </View>
  );
}

/** 一次排 N 張卡片骨架 */
export function SkeletonParkList({ count = 3 }: { count?: number }) {
  return (
    <View>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonParkCard key={i} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    borderRadius: 8,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 0.5,
    marginBottom: 10,
    padding: 10,
    gap: 12,
  },
  thumb: {
    width: 84,
    height: 84,
    borderRadius: 10,
  },
  lines: {
    flex: 1,
    gap: 10,
  },
  lineWide: {
    height: 16,
    width: "70%",
  },
  lineMid: {
    height: 12,
    width: "90%",
  },
  lineNarrow: {
    height: 12,
    width: "45%",
  },
});
