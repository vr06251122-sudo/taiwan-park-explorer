import { ScrollView, View, Text, Pressable, StyleSheet } from "react-native";
import { SkeletonParkList } from "@/components/skeleton";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { ParkCard } from "@/components/park-card";
import { TodayCard } from "@/components/today-card";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useUserLocation } from "@/lib/location-context";
import { haversineKm } from "@/lib/geo";
import { trpc } from "@/lib/trpc";
import {
  type ParkCategory,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  CATEGORY_EMOJI,
  PARK_CATEGORIES,
} from "@/data/parks";

export default function HomeScreen() {
  const router = useRouter();
  const colors = useColors();
  const { coords } = useUserLocation();

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

  const renderCategoryCard = (item: ParkCategory) => (
    <Pressable
      key={item}
      onPress={() => handleCategoryPress(item)}
      style={({ pressed }) => [
        styles.categoryCard,
        { backgroundColor: CATEGORY_COLORS[item] + "18", borderColor: CATEGORY_COLORS[item] + "40" },
        pressed && { opacity: 0.7 },
      ]}
    >
      <View style={[styles.categoryIcon, { backgroundColor: CATEGORY_COLORS[item] + "26" }]}>
        <Text style={styles.categoryEmoji}>{CATEGORY_EMOJI[item]}</Text>
      </View>
      <Text style={[styles.categoryLabel, { color: colors.foreground }]}>
        {CATEGORY_LABELS[item]}
      </Text>
    </Pressable>
  );

  const renderLoading = <SkeletonParkList count={3} />;

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
          全台公園即時資訊,想去哪就搜哪
        </Text>
      </View>

      <TodayCard
        nearest={nearbyParks[0]}
        loadingNearby={nearbyQuery.isLoading}
      />

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          想怎麼玩?
        </Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryList}
        style={styles.categoryListBar}
      >
        {PARK_CATEGORIES.map(renderCategoryCard)}
      </ScrollView>

      {coords && (
        <>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              就在你附近
            </Text>
            <Pressable onPress={() => router.push("/search?sort=distance" as any)}>
              <Text style={[styles.seeAll, { color: colors.primary }]}>看更多</Text>
            </Pressable>
          </View>

          {nearbyQuery.isLoading ? (
            renderLoading
          ) : (
            <View style={styles.parkList}>
              {nearbyParks.map((item) => (
                <ParkCard key={item.park.id} park={item.park} distanceKm={item.distanceKm} />
              ))}
            </View>
          )}
        </>
      )}

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          大家都在去
        </Text>
        <Pressable onPress={() => router.push("/search" as any)}>
          <Text style={[styles.seeAll, { color: colors.primary }]}>看更多</Text>
        </Pressable>
      </View>

      {popularQuery.isLoading ? (
        renderLoading
      ) : (
        <View style={styles.parkList}>
          {popularParks.map((park) => (
            <ParkCard key={park.id} park={park} />
          ))}
        </View>
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
  categoryListBar: {
    flexGrow: 0,
    flexShrink: 0,
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
  categoryEmoji: {
    fontSize: 26,
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  parkList: {
    paddingBottom: 24,
  },
});
