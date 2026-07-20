import { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  StyleSheet,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";
import { ParkCard } from "@/components/park-card";
import { ParkMap } from "@/components/park-map";
import { CategoryPill } from "@/components/category-pill";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useUserLocation } from "@/lib/location-context";
import { useDebounce } from "@/hooks/use-debounce";
import { haversineKm } from "@/lib/geo";
import { trpc } from "@/lib/trpc";
import { CITIES, PARK_CATEGORIES, type ParkCategory } from "@/data/parks";

export default function SearchScreen() {
  const colors = useColors();
  const params = useLocalSearchParams<{ category?: string; sort?: string }>();
  const { coords, requestLocation } = useUserLocation();

  const [searchText, setSearchText] = useState("");
  const [selectedCity, setSelectedCity] = useState("全部");
  const [selectedCategories, setSelectedCategories] = useState<ParkCategory[]>(
    params.category ? [params.category as ParkCategory] : []
  );
  const [minRating, setMinRating] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [sortByDistance, setSortByDistance] = useState(params.sort === "distance");
  const [viewMode, setViewMode] = useState<"list" | "map">("list");

  const debouncedText = useDebounce(searchText.trim(), 600);

  // 即時向 Google Places 搜尋(經由自家 server 轉發)
  // 有定位且未指定縣市時,結果以使用者位置為中心
  const searchQuery = trpc.parks.search.useQuery(
    {
      text: debouncedText || undefined,
      city: selectedCity,
      categories: selectedCategories.length > 0 ? selectedCategories : undefined,
      latitude: coords?.latitude,
      longitude: coords?.longitude,
    },
    {
      staleTime: 5 * 60 * 1000,
      placeholderData: (prev) => prev, // 換條件時保留舊結果,避免畫面閃爍
    }
  );

  const toggleCategory = useCallback((cat: ParkCategory) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  }, []);

  const filteredParks = useMemo(() => {
    return (searchQuery.data ?? []).filter((park) => park.funRating >= minRating);
  }, [searchQuery.data, minRating]);

  // 附上與使用者的距離,並依需求排序
  const resultParks = useMemo(() => {
    const withDistance = filteredParks.map((park) => ({
      park,
      distanceKm: coords
        ? haversineKm(coords.latitude, coords.longitude, park.latitude, park.longitude)
        : undefined,
    }));
    if (sortByDistance && coords) {
      withDistance.sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));
    }
    return withDistance;
  }, [filteredParks, coords, sortByDistance]);

  const toggleDistanceSort = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!coords) {
      // 還沒有定位就先請求;取得後排序自動生效
      requestLocation();
    }
    setSortByDistance((prev) => !prev);
  };

  const toggleViewMode = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setViewMode((prev) => (prev === "list" ? "map" : "list"));
  };

  const handleCitySelect = (city: string) => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedCity(city);
    setShowCityPicker(false);
  };

  const clearAll = () => {
    setSearchText("");
    setSelectedCity("全部");
    setSelectedCategories([]);
    setMinRating(0);
  };

  return (
    <ScreenContainer className="px-4">
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.foreground }]}>搜尋公園</Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          資料即時來自 Google 地圖
        </Text>
      </View>

      <View style={[styles.searchBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <IconSymbol name="magnifyingglass" size={20} color={colors.muted} />
        <TextInput
          style={[styles.searchInput, { color: colors.foreground }]}
          placeholder="今天想去哪玩?"
          placeholderTextColor={colors.muted}
          value={searchText}
          onChangeText={setSearchText}
          returnKeyType="done"
        />
        {searchText.length > 0 && (
          <Pressable onPress={() => setSearchText("")}>
            <IconSymbol name="xmark.circle.fill" size={18} color={colors.muted} />
          </Pressable>
        )}
      </View>

      <Pressable
        onPress={() => {
          if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setShowCityPicker(!showCityPicker);
        }}
        style={({ pressed }) => [
          styles.cityButton,
          { backgroundColor: colors.surface, borderColor: colors.border },
          pressed && { opacity: 0.7 },
        ]}
      >
        <IconSymbol name="mappin.and.ellipse" size={16} color={colors.primary} />
        <Text style={[styles.cityText, { color: colors.foreground }]}>{selectedCity}</Text>
        <IconSymbol
          name={showCityPicker ? "chevron.up" : "chevron.down"}
          size={16}
          color={colors.muted}
        />
      </Pressable>

      {showCityPicker && (
        <View style={[styles.cityPicker, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <FlatList
            data={CITIES}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => handleCitySelect(item)}
                style={({ pressed }) => [
                  styles.cityOption,
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Text
                  style={[
                    styles.cityOptionText,
                    {
                      color: item === selectedCity ? colors.primary : colors.foreground,
                      fontWeight: item === selectedCity ? "600" : "400",
                    },
                  ]}
                >
                  {item}
                </Text>
                {item === selectedCity && (
                  <IconSymbol name="checkmark" size={16} color={colors.primary} />
                )}
              </Pressable>
            )}
            keyExtractor={(item) => item}
            scrollEnabled={false}
          />
        </View>
      )}

      <View style={styles.categoriesContainer}>
        <FlatList
          data={PARK_CATEGORIES}
          renderItem={({ item }) => (
            <CategoryPill
              category={item}
              selected={selectedCategories.includes(item)}
              onPress={toggleCategory}
            />
          )}
          keyExtractor={(item) => item}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        />
      </View>

      <Pressable
        onPress={() => {
          if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setShowFilters(!showFilters);
        }}
        style={({ pressed }) => [
          styles.filterToggle,
          { borderColor: colors.border },
          pressed && { opacity: 0.7 },
        ]}
      >
        <IconSymbol name="slider.horizontal.3" size={16} color={colors.foreground} />
        <Text style={[styles.filterToggleText, { color: colors.foreground }]}>
          Google 星等篩選
        </Text>
        <IconSymbol
          name={showFilters ? "chevron.up" : "chevron.down"}
          size={14}
          color={colors.muted}
        />
      </Pressable>

      {showFilters && (
        <View style={[styles.filterPanel, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {[0, 3, 4, 4.5].map((r) => (
            <Pressable
              key={r}
              onPress={() => {
                if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setMinRating(r);
              }}
              style={({ pressed }) => [
                styles.ratingOption,
                {
                  backgroundColor: minRating === r ? colors.primary + "22" : "transparent",
                  borderColor: minRating === r ? colors.primary : colors.border,
                },
                pressed && { opacity: 0.7 },
              ]}
            >
              <Text style={[styles.ratingText, { color: colors.foreground }]}>
                {r === 0 ? "全部" : `${r} 星以上`}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      <View style={styles.resultsHeader}>
        <Text style={[styles.resultsCount, { color: colors.muted }]}>
          {searchQuery.isFetching ? "搜尋中..." : `共 ${filteredParks.length} 個公園`}
        </Text>
        <View style={styles.resultsActions}>
          <Pressable
            onPress={toggleDistanceSort}
            style={[
              styles.actionPill,
              {
                backgroundColor: sortByDistance ? colors.primary + "22" : "transparent",
                borderColor: sortByDistance ? colors.primary : colors.border,
              },
            ]}
          >
            <IconSymbol
              name="arrow.triangle.turn.up.right.fill"
              size={13}
              color={sortByDistance ? colors.primary : colors.muted}
            />
            <Text
              style={[
                styles.actionPillText,
                { color: sortByDistance ? colors.primary : colors.muted },
              ]}
            >
              距離
            </Text>
          </Pressable>
          <Pressable
            onPress={toggleViewMode}
            style={[
              styles.actionPill,
              {
                backgroundColor: viewMode === "map" ? colors.primary + "22" : "transparent",
                borderColor: viewMode === "map" ? colors.primary : colors.border,
              },
            ]}
          >
            <IconSymbol
              name={viewMode === "map" ? "list.bullet" : "map.fill"}
              size={13}
              color={viewMode === "map" ? colors.primary : colors.muted}
            />
            <Text
              style={[
                styles.actionPillText,
                { color: viewMode === "map" ? colors.primary : colors.muted },
              ]}
            >
              {viewMode === "map" ? "列表" : "地圖"}
            </Text>
          </Pressable>
          {(searchText || selectedCity !== "全部" || selectedCategories.length > 0 || minRating > 0) && (
            <Pressable onPress={clearAll}>
              <Text style={[styles.clearText, { color: colors.primary }]}>清除</Text>
            </Pressable>
          )}
        </View>
      </View>

      {searchQuery.isLoading ? (
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.emptySubtext, { color: colors.muted }]}>
            正在向 Google 地圖搜尋公園...
          </Text>
        </View>
      ) : searchQuery.isError ? (
        <View style={styles.emptyState}>
          <IconSymbol name="info.circle" size={48} color={colors.muted} />
          <Text style={[styles.emptyText, { color: colors.muted }]}>搜尋失敗</Text>
          <Text style={[styles.emptySubtext, { color: colors.muted }]}>
            請確認網路連線與 API 伺服器是否啟動
          </Text>
        </View>
      ) : viewMode === "map" ? (
        <View style={styles.mapContainer}>
          <ParkMap parks={filteredParks} userCoords={coords} />
        </View>
      ) : (
        <FlatList
          data={resultParks}
          renderItem={({ item }) => (
            <ParkCard park={item.park} distanceKm={item.distanceKm} />
          )}
          keyExtractor={(item) => item.park.id}
          contentContainerStyle={styles.resultsList}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <IconSymbol name="magnifyingglass" size={48} color={colors.muted} />
              <Text style={[styles.emptyText, { color: colors.muted }]}>
                找不到符合條件的公園
              </Text>
              <Text style={[styles.emptySubtext, { color: colors.muted }]}>
                試試調整搜尋條件
              </Text>
            </View>
          }
        />
      )}
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
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 0.5,
    gap: 10,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0,
  },
  cityButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 0.5,
    gap: 8,
    marginBottom: 8,
  },
  cityText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
  },
  cityPicker: {
    borderRadius: 12,
    borderWidth: 0.5,
    padding: 8,
    marginBottom: 12,
  },
  cityOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  cityOptionText: {
    fontSize: 15,
  },
  categoriesContainer: {
    marginBottom: 12,
    flexShrink: 0,
    height: 40,
  },
  categoriesList: {
    gap: 8,
  },
  filterToggle: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    gap: 8,
    borderTopWidth: 0.5,
    borderBottomWidth: 0.5,
    marginBottom: 12,
  },
  filterToggleText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
  },
  filterPanel: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 0.5,
    marginBottom: 12,
  },
  ratingOption: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: "500",
  },
  resultsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  resultsCount: {
    fontSize: 14,
  },
  clearText: {
    fontSize: 14,
    fontWeight: "500",
  },
  resultsActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actionPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  actionPillText: {
    fontSize: 13,
    fontWeight: "500",
  },
  mapContainer: {
    flex: 1,
    minHeight: 380,
    marginBottom: 16,
  },
  resultsList: {
    paddingBottom: 24,
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
  emptySubtext: {
    fontSize: 14,
  },
});
