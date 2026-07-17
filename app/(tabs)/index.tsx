import { FlatList, ScrollView, View, Text, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { ParkCard } from "@/components/park-card";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useUserLocation } from "@/lib/location-context";
import { haversineKm } from "@/lib/geo";
import { trpc } from "@/lib/trpc";
import {
  type ParkCategory,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  CATEGORY_ICONS,
  PARK_CATEGORIES,
} from "@/data/parks";

export default function HomeScreen() {
  const router = useRouter();
  const colors = useColors();
  const { coords, status, requestLocation } = useUserLocation();

  // 離你最近:Google Nearby Search,由近到遠
  const nearbyQuery = trpc.parks.nearby.useQuery(
    { latitude: coords?.latitude ?? 0, longitude: coords?.longitude ?? 0 },
    { enabled: !!coords, staleTime: 5 * 60 * 1000 }
  );
  const nearbyParks = (nearbyQuery.data ?? [])
    .map((park) => ({
      park,
      distanceKm: coords
        ? haversineKm(coords.latitude, coords.longitude, park.latitude, park.longitude)
        : 0,
    }))
    .slice(0, 4);

  // 熱門公園:全台特色公園,依 Google 星等排序
  const popularQuery = trpc.parks.search.useQuery(
    { text: "特色公園" },
    { staleTime: 10 * 60 * 1000 }
  );
  const popularParks = [...(popularQuery.data ?? [])]
    .sort((a, b) => b.funRating * Math.log10(b.reviewCount + 1) - a.funRating * Math.log10(a.reviewCount + 1))
    .slice(0, 6);

  const handleCategoryPress = (cat: ParkCategory) => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/search?category=${cat}` as any);
  };

  const renderCategoryCard = ({ item }: { item: ParkCategory }) => (
    <Pressable
      onPress={() => handleCategoryPress(item)}
      style={({ pressed }) => [
        styles.categoryCard,
        { backgroundColor: CATEGORY_COLORS[item] + "18", borderColor: CATEGORY_COLORS[item] + "40" },
        pressed && { opacity: 0.7 },
      ]}
    >
      <View style={[styles.categoryIcon, { backgroundColor: CATEGORY_COLORS[item] }]}>
        <IconSymbol
          name={CATEGORY_ICONS[item] as any}
          size={26}
          color="#FFFFFF"
        />
      </View>
      <Text style={[styles.categoryLabel, { color: colors.foreground }]}>
        {CATEGORY_LABELS[item]}
      </Text>
    </Pressable>
  );

  const renderLoading = (
    <View style={styles.loadingBox}>
      <ActivityIndicator size="small" color={colors.primary} />
    </View>
  );

  return (
    <ScreenContainer className="px-4">
      <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={[styles.greeting, { color: colors.muted }]}>探索台灣</Text>
            <Text style={[styles.title, { color: colors.foreground }]}>公園導航</Text>
          </View>
          <View style={[styles.logoBadge, { backgroundColor: colors.primary }]}>
            <IconSymbol name="tree.fill" size={24} color="#FFFFFF" />
          </View>
        </View>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          即時彙整 Google 地圖公園資訊：共融遊戲場、寵物友善空間與滑步車場地
        </Text>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          公園類型
        </Text>
      </View>
      <FlatList
        data={PARK_CATEGORIES}
        renderItem={renderCategoryCard}
        keyExtractor={(item) => item}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryList}
      />

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          離你最近
        </Text>
        {coords && (
          <Pressable onPress={() => router.push("/search?sort=distance" as any)}>
            <Text style={[styles.seeAll, { color: colors.primary }]}>查看全部</Text>
          </Pressable>
        )}
      </View>

      {coords ? (
        nearbyQuery.isLoading ? (
          renderLoading
        ) : (
          <FlatList
            data={nearbyParks}
            renderItem={({ item }) => <ParkCard park={item.park} distanceKm={item.distanceKm} />}
            keyExtractor={(item) => item.park.id}
            scrollEnabled={false}
            contentContainerStyle={styles.parkList}
          />
        )
      ) : (
        <Pressable
          onPress={requestLocation}
          disabled={status === "loading"}
          style={({ pressed }) => [
            styles.locationPrompt,
            { backgroundColor: colors.surface, borderColor: colors.border },
            pressed && { opacity: 0.7 },
          ]}
        >
          <IconSymbol name="location.circle.fill" size={28} color={colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.locationPromptTitle, { color: colors.foreground }]}>
              {status === "loading" ? "正在取得你的位置..." : "開啟定位,推薦附近的公園"}
            </Text>
            <Text style={[styles.locationPromptSub, { color: colors.muted }]}>
              {status === "denied"
                ? "定位權限被拒絕,請在瀏覽器或系統設定中允許後再試一次"
                : "允許定位後,這裡會顯示離你最近的公園"}
            </Text>
          </View>
        </Pressable>
      )}

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          熱門公園
        </Text>
        <Pressable onPress={() => router.push("/search" as any)}>
          <Text style={[styles.seeAll, { color: colors.primary }]}>查看全部</Text>
        </Pressable>
      </View>

      {popularQuery.isLoading ? (
        renderLoading
      ) : (
        <FlatList
          data={popularParks}
          renderItem={({ item }) => <ParkCard park={item} />}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          contentContainerStyle={styles.parkList}
        />
      )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 16,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  greeting: {
    fontSize: 14,
    marginBottom: 2,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
  },
  logoBadge: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  seeAll: {
    fontSize: 14,
    fontWeight: "500",
  },
  categoryList: {
    gap: 12,
    paddingBottom: 20,
  },
  categoryCard: {
    width: 110,
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  parkList: {
    paddingBottom: 24,
  },
  loadingBox: {
    paddingVertical: 32,
    alignItems: "center",
  },
  locationPrompt: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 0.5,
    marginBottom: 20,
  },
  locationPromptTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 2,
  },
  locationPromptSub: {
    fontSize: 13,
    lineHeight: 18,
  },
});
