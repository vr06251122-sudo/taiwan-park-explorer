import { useState, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  Platform,
  Linking,
} from "react-native";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";
import { SkeletonParkList } from "@/components/skeleton";
import { PullToRefresh } from "@/components/pull-to-refresh";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useUserLocation } from "@/lib/location-context";
import { haversineKm, formatDistance } from "@/lib/geo";
import { trpc } from "@/lib/trpc";
import {
  CITIES,
  type Park,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  CATEGORY_DARK_COLORS,
  CATEGORY_ICONS,
} from "@/data/parks";

export default function MapScreen() {
  const colors = useColors();
  const { coords } = useUserLocation();
  const [selectedCity, setSelectedCity] = useState("全部");
  const scrollOffset = useRef(0);

  // 有定位且選「附近」時直接列離你最近的公園;選了縣市則照縣市搜尋
  const useNearby = !!coords && selectedCity === "全部";
  const nearbyQuery = trpc.parks.nearby.useQuery(
    { latitude: coords?.latitude ?? 0, longitude: coords?.longitude ?? 0 },
    { enabled: useNearby, staleTime: 5 * 60 * 1000 }
  );
  const cityQuery = trpc.parks.search.useQuery(
    { city: selectedCity, latitude: coords?.latitude, longitude: coords?.longitude },
    { enabled: !useNearby, staleTime: 5 * 60 * 1000, placeholderData: (prev) => prev }
  );
  const activeQuery = useNearby ? nearbyQuery : cityQuery;
  const filteredParks = activeQuery.data ?? [];

  const handleNavigate = (park: Park) => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Linking.openURL(park.googleMapsUrl);
  };

  const renderParkItem = ({ item }: { item: Park }) => (
    <View style={[styles.parkItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.parkItemHeader}>
        <Text style={[styles.parkName, { color: colors.foreground }]} numberOfLines={1}>
          {item.name}
        </Text>
        <View style={styles.ratingBadge}>
          <IconSymbol name="star.fill" size={14} color={colors.warning} />
          <Text style={[styles.ratingText, { color: colors.foreground }]}>
            {item.funRating.toFixed(1)}
          </Text>
        </View>
      </View>
      <View style={styles.locationRow}>
        <IconSymbol name="mappin.and.ellipse" size={13} color={colors.muted} />
        <Text style={[styles.locationText, { color: colors.muted }]} numberOfLines={1}>
          {item.city} {item.district}
        </Text>
        {coords && (
          <Text style={[styles.distanceText, { color: colors.primary }]}>
            {formatDistance(haversineKm(coords.latitude, coords.longitude, item.latitude, item.longitude))}
          </Text>
        )}
      </View>
      <View style={styles.categoriesRow}>
        {item.categories.map((cat) => (
          <View
            key={cat}
            style={[styles.catTag, { backgroundColor: CATEGORY_COLORS[cat] + "22" }]}
          >
            <IconSymbol
              name={CATEGORY_ICONS[cat] as any}
              size={11}
              color={CATEGORY_DARK_COLORS[cat]}
            />
            <Text style={[styles.catText, { color: CATEGORY_DARK_COLORS[cat] }]}>
              {CATEGORY_LABELS[cat]}
            </Text>
          </View>
        ))}
      </View>
      <Pressable
        onPress={() => handleNavigate(item)}
        style={({ pressed }) => [
          styles.navButton,
          { backgroundColor: colors.primary },
          pressed && { opacity: 0.85 },
        ]}
      >
        <IconSymbol name="location.north.fill" size={18} color="#FFFFFF" />
        <Text style={styles.navButtonText}>帶我去</Text>
      </Pressable>
    </View>
  );

  return (
    <ScreenContainer className="px-4">
      <PullToRefresh scrollOffset={scrollOffset}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.foreground }]}>地圖導航</Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          選擇地區，一鍵導航至公園
        </Text>
      </View>

      <FlatList
        style={styles.cityListBar}
        data={CITIES}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => {
              if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setSelectedCity(item);
            }}
            style={({ pressed }) => [
              styles.cityChip,
              {
                backgroundColor: item === selectedCity ? colors.primary : colors.surface,
                borderColor: item === selectedCity ? colors.primary : colors.border,
              },
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text
              style={[
                styles.cityChipText,
                { color: item === selectedCity ? "#FFFFFF" : colors.foreground },
              ]}
            >
              {item === "全部" && coords ? "附近" : item}
            </Text>
          </Pressable>
        )}
        keyExtractor={(item) => item}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.cityList}
      />

      {activeQuery.isLoading ? (
        <SkeletonParkList count={4} />
      ) : (
        <FlatList
          style={styles.parkListArea}
          data={filteredParks}
          renderItem={renderParkItem}
          keyExtractor={(item) => item.id}
          onScroll={(e) => (scrollOffset.current = e.nativeEvent.contentOffset.y)}
          scrollEventThrottle={32}
          contentContainerStyle={styles.parkList}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <IconSymbol name="map.fill" size={48} color={colors.muted} />
              <Text style={[styles.emptyText, { color: colors.muted }]}>
                此地區尚無公園資料
              </Text>
            </View>
          }
        />
      )}
      </PullToRefresh>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 16,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
  // 橫向選單列必須固定高度且不可壓縮,否則會被下方的長列表擠扁蓋住
  cityListBar: {
    flexGrow: 0,
    flexShrink: 0,
    height: 56,
  },
  parkListArea: {
    flex: 1,
  },
  cityList: {
    gap: 8,
    paddingBottom: 16,
    alignItems: "flex-start",
  },
  cityChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  cityChipText: {
    fontSize: 14,
    fontWeight: "500",
  },
  parkList: {
    paddingBottom: 24,
  },
  parkItem: {
    borderRadius: 16,
    borderWidth: 0.5,
    padding: 16,
    marginBottom: 12,
  },
  parkItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  parkName: {
    fontSize: 17,
    fontWeight: "600",
    flex: 1,
    marginRight: 8,
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    fontSize: 15,
    fontWeight: "600",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 10,
  },
  locationText: {
    fontSize: 13,
    flexShrink: 1,
  },
  distanceText: {
    fontSize: 13,
    fontWeight: "600",
    marginLeft: 6,
  },
  categoriesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 12,
  },
  catTag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  catText: {
    fontSize: 12,
    fontWeight: "500",
  },
  navButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  navButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 8,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
