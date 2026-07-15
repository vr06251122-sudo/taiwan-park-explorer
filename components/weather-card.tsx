import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { fetchWeather, describeWeather } from "@/lib/weather";

interface WeatherCardProps {
  latitude: number;
  longitude: number;
  /** 顯示在卡片上的地點名稱,例如「大安區」 */
  locationName: string;
}

export function WeatherCard({ latitude, longitude, locationName }: WeatherCardProps) {
  const colors = useColors();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["weather", latitude, longitude],
    queryFn: () => fetchWeather(latitude, longitude),
    staleTime: 10 * 60 * 1000, // 10 分鐘內不重抓
  });

  if (isLoading) {
    return (
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.muted }]}>載入天氣資訊...</Text>
      </View>
    );
  }

  if (isError || !data) {
    return (
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <IconSymbol name="info.circle" size={18} color={colors.muted} />
        <Text style={[styles.loadingText, { color: colors.muted }]}>
          暫時無法取得天氣資訊
        </Text>
      </View>
    );
  }

  const { label, icon } = describeWeather(data.weatherCode, data.isDay);
  const rainy = data.precipitationProbability >= 60 || (data.weatherCode >= 61 && data.weatherCode <= 99);
  const suggestion = rainy
    ? "降雨機率偏高,建議帶傘或改天前往"
    : data.precipitationProbability >= 30
      ? "可能有短暫降雨,出門前留意天況"
      : "天氣不錯,適合前往!";

  return (
    <View style={[styles.card, styles.cardColumn, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.topRow}>
        <View style={styles.mainInfo}>
          <IconSymbol name={icon as any} size={36} color={rainy ? "#4A90D9" : colors.warning} />
          <View>
            <Text style={[styles.temperature, { color: colors.foreground }]}>
              {Math.round(data.temperature)}°C
            </Text>
            <Text style={[styles.weatherLabel, { color: colors.muted }]}>
              {locationName} · {label} · 體感 {Math.round(data.apparentTemperature)}°C
            </Text>
          </View>
        </View>
        <View style={styles.rainInfo}>
          <View style={styles.rainRow}>
            <IconSymbol name="umbrella.fill" size={14} color="#4A90D9" />
            <Text style={[styles.rainValue, { color: colors.foreground }]}>
              {data.precipitationProbability}%
            </Text>
          </View>
          <Text style={[styles.rainLabel, { color: colors.muted }]}>降雨機率</Text>
        </View>
      </View>
      <View
        style={[
          styles.suggestionBar,
          { backgroundColor: (rainy ? "#4A90D9" : "#2D7A3E") + "15" },
        ]}
      >
        <Text style={[styles.suggestionText, { color: rainy ? "#4A90D9" : "#2D7A3E" }]}>
          {suggestion}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 14,
    borderRadius: 16,
    borderWidth: 0.5,
  },
  cardColumn: {
    flexDirection: "column",
    alignItems: "stretch",
    gap: 10,
  },
  loadingText: {
    fontSize: 14,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  mainInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  temperature: {
    fontSize: 24,
    fontWeight: "700",
  },
  weatherLabel: {
    fontSize: 13,
  },
  rainInfo: {
    alignItems: "flex-end",
  },
  rainRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  rainValue: {
    fontSize: 18,
    fontWeight: "600",
  },
  rainLabel: {
    fontSize: 12,
  },
  suggestionBar: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  suggestionText: {
    fontSize: 13,
    fontWeight: "500",
  },
});
