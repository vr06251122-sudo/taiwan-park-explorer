import { View, Text, Pressable, StyleSheet, ActivityIndicator, Platform } from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { useQuery } from "@tanstack/react-query";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useUserLocation } from "@/lib/location-context";
import { fetchWeather, describeWeather } from "@/lib/weather";
import { formatDistance } from "@/lib/geo";
import { StarRating } from "@/components/star-rating";
import type { Park } from "@/data/parks";

interface TodayCardProps {
  nearest?: { park: Park; distanceKm: number };
  loadingNearby?: boolean;
}

/** 首頁頂部的「今天去哪?」情境卡:天氣 + 離你最近的公園,一眼給答案 */
export function TodayCard({ nearest, loadingNearby }: TodayCardProps) {
  const router = useRouter();
  const colors = useColors();
  const { coords, status, requestLocation } = useUserLocation();

  const weatherQuery = useQuery({
    queryKey: ["weather-here", coords?.latitude, coords?.longitude],
    queryFn: () => fetchWeather(coords!.latitude, coords!.longitude),
    enabled: !!coords,
    staleTime: 10 * 60 * 1000,
  });

  // 還沒定位:引導開啟
  if (!coords) {
    return (
      <Pressable
        onPress={requestLocation}
        disabled={status === "loading"}
        style={({ pressed }) => [
          styles.card,
          { backgroundColor: colors.surface, borderColor: colors.border },
          pressed && { opacity: 0.7 },
        ]}
      >
        <View style={styles.promptRow}>
          <IconSymbol name="location.circle.fill" size={28} color={colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.promptTitle, { color: colors.foreground }]}>
              {status === "loading" ? "正在找你在哪..." : "今天想去公園嗎?"}
            </Text>
            <Text style={[styles.promptSub, { color: colors.muted }]}>
              {status === "denied"
                ? "定位被擋住了,到瀏覽器或系統設定允許後再點一次"
                : "開個定位,馬上告訴你天氣和最近的好去處"}
            </Text>
          </View>
        </View>
      </Pressable>
    );
  }

  const weather = weatherQuery.data;
  const rainy =
    !!weather &&
    (weather.precipitationProbability >= 60 ||
      (weather.weatherCode >= 61 && weather.weatherCode <= 99));

  const suggestion = !weather
    ? ""
    : rainy
      ? `降雨機率 ${weather.precipitationProbability}%,今天先收口袋名單,改天再衝`
      : weather.precipitationProbability >= 30
        ? "可能飄點雨,帶把傘再出門"
        : "天氣不錯,出發吧!";

  const { label, icon } = weather
    ? describeWeather(weather.weatherCode, weather.isDay)
    : { label: "", icon: "cloud.fill" };

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.primary + "14", borderColor: colors.primary + "35" },
      ]}
    >
      {/* 天氣列 */}
      {weatherQuery.isLoading ? (
        <View style={styles.weatherRow}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={[styles.suggestion, { color: colors.muted }]}>看看今天天氣...</Text>
        </View>
      ) : weather ? (
        <View style={styles.weatherRow}>
          <IconSymbol name={icon as any} size={30} color={rainy ? "#4A90D9" : colors.warning} />
          <Text style={[styles.temp, { color: colors.foreground }]}>
            {Math.round(weather.temperature)}°
          </Text>
          <Text style={[styles.weatherLabel, { color: colors.muted }]}>{label}</Text>
          <View style={styles.rainChip}>
            <IconSymbol name="umbrella.fill" size={12} color="#4A90D9" />
            <Text style={styles.rainText}>{weather.precipitationProbability}%</Text>
          </View>
        </View>
      ) : null}

      {suggestion.length > 0 && (
        <Text style={[styles.suggestion, { color: colors.foreground }]}>{suggestion}</Text>
      )}

      {/* 最近的公園 */}
      {loadingNearby ? (
        <View style={styles.parkRow}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      ) : nearest ? (
        <Pressable
          onPress={() => {
            if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push(`/park/${nearest.park.id}` as any);
          }}
          style={({ pressed }) => [
            styles.parkRow,
            { backgroundColor: colors.surface, borderColor: colors.border },
            pressed && { opacity: 0.7 },
          ]}
        >
          <View style={[styles.distancePill, { backgroundColor: colors.primary }]}>
            <Text style={styles.distancePillText}>{formatDistance(nearest.distanceKm)}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.parkName, { color: colors.foreground }]} numberOfLines={1}>
              {nearest.park.name}
            </Text>
            <View style={styles.parkMeta}>
              <StarRating rating={nearest.park.funRating} size={12} />
              <Text style={[styles.parkMetaText, { color: colors.muted }]}>
                {nearest.park.funRating > 0 ? nearest.park.funRating.toFixed(1) : "尚無評分"}
              </Text>
            </View>
          </View>
          <IconSymbol name="chevron.right" size={18} color={colors.muted} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    marginBottom: 20,
    gap: 10,
  },
  promptRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  promptTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 2,
  },
  promptSub: {
    fontSize: 13,
    lineHeight: 18,
  },
  weatherRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  temp: {
    fontSize: 26,
    fontWeight: "700",
  },
  weatherLabel: {
    fontSize: 14,
    flex: 1,
  },
  rainChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#4A90D91A",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  rainText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#4A90D9",
  },
  suggestion: {
    fontSize: 15,
    fontWeight: "600",
  },
  parkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 10,
    borderRadius: 12,
    borderWidth: 0.5,
  },
  distancePill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  distancePillText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  parkName: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 2,
  },
  parkMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  parkMetaText: {
    fontSize: 12,
  },
});
