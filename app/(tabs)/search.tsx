import { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  StyleSheet,
  Platform,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";
import { ParkCard } from "@/components/park-card";
import { CategoryPill } from "@/components/category-pill";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import {
  TAIWAN_PARKS,
  CITIES,
  type ParkCategory,
  CATEGORY_LABELS,
} from "@/data/parks";

const ALL_CATEGORIES: ParkCategory[] = ["walk", "inclusive", "slide", "pet", "bike"];

export default function SearchScreen() {
  const colors = useColors();
  const params = useLocalSearchParams<{ category?: string }>();

  const [searchText, setSearchText] = useState("");
  const [selectedCity, setSelectedCity] = useState("全部");
  const [selectedCategories, setSelectedCategories] = useState<ParkCategory[]>(
    params.category ? [params.category as ParkCategory] : []
  );
  const [minRating, setMinRating] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [showCityPicker, setShowCityPicker] = useState(false);

  const toggleCategory = useCallback((cat: ParkCategory) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  }, []);

  const filteredParks = useMemo(() => {
    return TAIWAN_PARKS.filter((park) => {
      if (searchText.trim()) {
        const q = searchText.trim().toLowerCase();
        const matchName = park.name.toLowerCase().includes(q);
        const matchDesc = park.description.toLowerCase().includes(q);
        const matchCity = park.city.toLowerCase().includes(q);
        const matchDistrict = park.district.toLowerCase().includes(q);
        if (!matchName && !matchDesc && !matchCity && !matchDistrict) return false;
      }
      if (selectedCity !== "全部" && park.city !== selectedCity) return false;
      if (selectedCategories.length > 0) {
        const hasCat = selectedCategories.some((c) => park.categories.includes(c));
        if (!hasCat) return false;
      }
      if (park.funRating < minRating) return false;
      return true;
    });
  }, [searchText, selectedCity, selectedCategories, minRating]);

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
          依名稱、地區或類型篩選
        </Text>
      </View>

      <View style={[styles.searchBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <IconSymbol name="magnifyingglass" size={20} color={colors.muted} />
        <TextInput
          style={[styles.searchInput, { color: colors.foreground }]}
          placeholder="輸入公園名稱或地區..."
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
          data={ALL_CATEGORIES}
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
          好玩指數篩選
        </Text>
        <IconSymbol
          name={showFilters ? "chevron.up" : "chevron.down"}
          size={14}
          color={colors.muted}
        />
      </Pressable>

      {showFilters && (
        <View style={[styles.filterPanel, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {[0, 3, 4, 5].map((r) => (
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
          共 {filteredParks.length} 個公園
        </Text>
        {(searchText || selectedCity !== "全部" || selectedCategories.length > 0 || minRating > 0) && (
          <Pressable onPress={clearAll}>
            <Text style={[styles.clearText, { color: colors.primary }]}>清除篩選</Text>
          </Pressable>
        )}
      </View>

      <FlatList
        data={filteredParks}
        renderItem={({ item }) => <ParkCard park={item} />}
        keyExtractor={(item) => item.id}
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
