import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Platform,
  Linking,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { getPhotoUrl } from "@/lib/photos";
import { PhotoPlaceholder } from "@/components/photo-placeholder";
import { ScreenContainer } from "@/components/screen-container";
import { StarRating } from "@/components/star-rating";
import { WeatherCard } from "@/components/weather-card";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useFavorites } from "@/lib/favorites-context";
import { trpc } from "@/lib/trpc";
import {
  type ParkReview,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  CATEGORY_ICONS,
} from "@/data/parks";

export default function ParkDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useColors();
  const { isFavorite, toggleFavorite } = useFavorites();

  // 公園完整資訊(含最多 5 則 Google 評論)即時來自 Google Places
  const parkQuery = trpc.parks.details.useQuery(
    { id: id ?? "" },
    { enabled: !!id, staleTime: 10 * 60 * 1000 }
  );
  const park = parkQuery.data;

  if (parkQuery.isLoading) {
    return (
      <ScreenContainer className="px-4">
        <View style={styles.notFound}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.notFoundText, { color: colors.muted }]}>
            正在載入公園資訊...
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  if (!park) {
    return (
      <ScreenContainer className="px-4">
        <View style={styles.notFound}>
          <Text style={[styles.notFoundText, { color: colors.foreground }]}>
            找不到此公園
          </Text>
          <Pressable onPress={() => router.back()}>
            <Text style={{ color: colors.primary }}>返回</Text>
          </Pressable>
        </View>
      </ScreenContainer>
    );
  }

  const fav = isFavorite(park.id);

  const handleFavorite = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleFavorite(park.id);
  };

  const handleNavigate = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Linking.openURL(park.googleMapsUrl);
  };

  // 評論寫在 Google 地圖上(Google 不開放 API 寫入,官方作法是深層連結)
  const handleWriteReview = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Linking.openURL(`https://search.google.com/local/writereview?placeid=${park.id}`);
  };

  const renderReviewItem = ({ item }: { item: ParkReview }) => (
    <View style={[styles.reviewItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.reviewHeader}>
        <View style={styles.reviewAuthorRow}>
          <View style={[styles.reviewAvatar, { backgroundColor: colors.primary + "22" }]}>
            <IconSymbol name="person.fill" size={18} color={colors.primary} />
          </View>
          <View>
            <Text style={[styles.reviewAuthor, { color: colors.foreground }]}>{item.author}</Text>
            <Text style={[styles.reviewDate, { color: colors.muted }]}>{item.date}</Text>
          </View>
        </View>
        <StarRating rating={item.rating} size={14} />
      </View>
      <Text style={[styles.reviewComment, { color: colors.foreground }]}>{item.comment}</Text>
    </View>
  );

  return (
    <ScreenContainer edges={["top", "left", "right"]} className="px-0">
      <View style={[styles.topBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.6 }]}
        >
          <IconSymbol name="chevron.left" size={24} color={colors.foreground} />
        </Pressable>
        <Pressable
          onPress={handleFavorite}
          style={({ pressed }) => [styles.favBtn, pressed && { opacity: 0.6 }]}
        >
          <IconSymbol
            name={fav ? "heart.fill" : "heart"}
            size={24}
            color={fav ? colors.error : colors.muted}
          />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {park.photoNames.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.photoStrip}
            style={styles.photoStripWrap}
          >
            {park.photoNames.map((name) => (
              <Image
                key={name}
                source={{ uri: getPhotoUrl(name, 640) }}
                style={styles.photo}
                contentFit="cover"
                transition={250}
              />
            ))}
          </ScrollView>
        ) : (
          <PhotoPlaceholder style={[styles.photo, styles.photoStripWrap, { width: "100%" }]} emojiSize={56} />
        )}

        <View style={styles.titleSection}>
          <Text style={[styles.parkName, { color: colors.foreground }]}>{park.name}</Text>
          <View style={styles.locationRow}>
            <IconSymbol name="mappin.and.ellipse" size={15} color={colors.muted} />
            <Text style={[styles.locationText, { color: colors.muted }]}>
              {park.address}
            </Text>
          </View>
        </View>

        <View style={[styles.ratingCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.ratingLeft}>
            <Text style={[styles.ratingNumber, { color: colors.foreground }]}>
              {park.funRating > 0 ? park.funRating.toFixed(1) : "—"}
            </Text>
            <StarRating rating={park.funRating} size={16} />
            <Text style={[styles.ratingCount, { color: colors.muted }]}>
              {park.reviewCount} 則 Google 評論
            </Text>
          </View>
          <View style={[styles.ratingDivider, { backgroundColor: colors.border }]} />
          <View style={styles.ratingRight}>
            <Text style={[styles.funLabel, { color: colors.muted }]}>好玩指數</Text>
            <Text style={[styles.funValue, { color: colors.warning }]}>
              {park.funRating >= 4.5 ? "超好玩" : park.funRating >= 4 ? "很好玩" : park.funRating >= 3 ? "還不錯" : park.funRating > 0 ? "普通" : "尚無評分"}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>即時天氣</Text>
          <WeatherCard
            latitude={park.latitude}
            longitude={park.longitude}
            locationName={`${park.city}${park.district}`}
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>公園類型</Text>
          <View style={styles.categoriesRow}>
            {park.categories.map((cat) => (
              <View
                key={cat}
                style={[styles.categoryTag, { backgroundColor: CATEGORY_COLORS[cat] + "22" }]}
              >
                <IconSymbol
                  name={CATEGORY_ICONS[cat] as any}
                  size={14}
                  color={CATEGORY_COLORS[cat]}
                />
                <Text style={[styles.categoryText, { color: CATEGORY_COLORS[cat] }]}>
                  {CATEGORY_LABELS[cat]}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {park.description.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>特色介紹</Text>
            <Text style={[styles.description, { color: colors.muted }]}>
              {park.description}
            </Text>
          </View>
        )}

        <Pressable
          onPress={handleNavigate}
          style={({ pressed }) => [
            styles.navButton,
            { backgroundColor: colors.primary },
            pressed && { opacity: 0.85 },
          ]}
        >
          <IconSymbol name="location.north.fill" size={22} color="#FFFFFF" />
          <Text style={styles.navButtonText}>帶我去</Text>
        </Pressable>

        <View style={styles.section}>
          <View style={styles.reviewsHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Google 評論
            </Text>
            <Pressable onPress={handleWriteReview}>
              <Text style={[styles.addReviewText, { color: colors.primary }]}>
                留個評價
              </Text>
            </Pressable>
          </View>

          <FlatList
            data={park.reviews}
            renderItem={renderReviewItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            contentContainerStyle={styles.reviewsList}
            ListEmptyComponent={
              <Text style={[styles.emptyReviews, { color: colors.muted }]}>
                尚無評論，到 Google 地圖成為第一位評論者！
              </Text>
            }
          />

          <Pressable
            onPress={handleWriteReview}
            style={({ pressed }) => [
              styles.writeReviewBtn,
              { borderColor: colors.primary },
              pressed && { opacity: 0.7 },
            ]}
          >
            <IconSymbol name="star.fill" size={16} color={colors.primary} />
            <Text style={[styles.writeReviewText, { color: colors.primary }]}>
              去過了?留個評價吧
            </Text>
          </Pressable>
          <Text style={[styles.reviewNote, { color: colors.muted }]}>
            評論由 Google 地圖提供(最多顯示 5 則精選),你的評論會發布在 Google 地圖上
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
  },
  backBtn: {
    padding: 4,
  },
  favBtn: {
    padding: 4,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  photoStripWrap: {
    marginBottom: 20,
    flexGrow: 0,
    flexShrink: 0,
  },
  photoStrip: {
    gap: 10,
  },
  photo: {
    width: 280,
    height: 180,
    borderRadius: 16,
    backgroundColor: "#E5EAE2",
  },
  titleSection: {
    marginBottom: 20,
  },
  parkName: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  locationText: {
    fontSize: 14,
    flex: 1,
  },
  ratingCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 0.5,
    padding: 16,
    marginBottom: 24,
  },
  ratingLeft: {
    flex: 1,
    alignItems: "center",
  },
  ratingNumber: {
    fontSize: 36,
    fontWeight: "700",
    marginBottom: 4,
  },
  ratingCount: {
    fontSize: 13,
    marginTop: 4,
  },
  ratingDivider: {
    width: 1,
    height: 50,
    marginHorizontal: 16,
  },
  ratingRight: {
    flex: 1,
    alignItems: "center",
  },
  funLabel: {
    fontSize: 13,
    marginBottom: 4,
  },
  funValue: {
    fontSize: 20,
    fontWeight: "700",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  categoriesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryTag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 6,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "500",
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
  },
  navButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 14,
    gap: 10,
    marginBottom: 24,
  },
  navButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600",
  },
  reviewsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  addReviewText: {
    fontSize: 15,
    fontWeight: "600",
  },
  writeReviewBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 16,
  },
  writeReviewText: {
    fontSize: 15,
    fontWeight: "600",
  },
  reviewNote: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: 8,
    textAlign: "center",
  },
  reviewsList: {
    gap: 12,
  },
  reviewItem: {
    borderRadius: 14,
    borderWidth: 0.5,
    padding: 14,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  reviewAuthorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  reviewAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  reviewAuthor: {
    fontSize: 15,
    fontWeight: "600",
  },
  reviewDate: {
    fontSize: 12,
  },
  reviewComment: {
    fontSize: 14,
    lineHeight: 20,
  },
  emptyReviews: {
    fontSize: 14,
    textAlign: "center",
    paddingVertical: 20,
  },
  notFound: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  notFoundText: {
    fontSize: 18,
    fontWeight: "600",
  },
});
