import { useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  StyleSheet,
  Platform,
  Linking,
  FlatList,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";
import { StarRating } from "@/components/star-rating";
import { WeatherCard } from "@/components/weather-card";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useFavorites } from "@/lib/favorites-context";
import {
  TAIWAN_PARKS,
  type ParkReview,
  type ParkCategory,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  CATEGORY_ICONS,
} from "@/data/parks";

export default function ParkDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useColors();
  const { isFavorite, toggleFavorite, addReview, getReviews } = useFavorites();

  const park = TAIWAN_PARKS.find((p) => p.id === id);

  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [showReviewForm, setShowReviewForm] = useState(false);

  const userReviews = park ? getReviews(park.id) : [];
  const allReviews = useMemo(() => {
    if (!park) return [];
    return [...userReviews, ...park.reviews];
  }, [park, userReviews]);

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

  const handleSubmitReview = () => {
    if (newRating === 0 || !newComment.trim()) return;
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const review: ParkReview = {
      id: `user_${Date.now()}`,
      author: authorName.trim() || "匿名使用者",
      rating: newRating,
      comment: newComment.trim(),
      date: new Date().toISOString().split("T")[0],
    };
    addReview(park.id, review);
    setNewRating(0);
    setNewComment("");
    setAuthorName("");
    setShowReviewForm(false);
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
        <View style={styles.titleSection}>
          <Text style={[styles.parkName, { color: colors.foreground }]}>{park.name}</Text>
          <View style={styles.locationRow}>
            <IconSymbol name="mappin.and.ellipse" size={15} color={colors.muted} />
            <Text style={[styles.locationText, { color: colors.muted }]}>
              {park.city} {park.district} · {park.address}
            </Text>
          </View>
        </View>

        <View style={[styles.ratingCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.ratingLeft}>
            <Text style={[styles.ratingNumber, { color: colors.foreground }]}>
              {park.funRating.toFixed(1)}
            </Text>
            <StarRating rating={park.funRating} size={16} />
            <Text style={[styles.ratingCount, { color: colors.muted }]}>
              {park.reviewCount + userReviews.length} 則評論
            </Text>
          </View>
          <View style={[styles.ratingDivider, { backgroundColor: colors.border }]} />
          <View style={styles.ratingRight}>
            <Text style={[styles.funLabel, { color: colors.muted }]}>好玩指數</Text>
            <Text style={[styles.funValue, { color: colors.warning }]}>
              {park.funRating >= 4.5 ? "超好玩" : park.funRating >= 4 ? "很好玩" : park.funRating >= 3 ? "還不錯" : "普通"}
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

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>特色介紹</Text>
          <Text style={[styles.description, { color: colors.muted }]}>
            {park.description}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>設施清單</Text>
          <View style={styles.facilitiesGrid}>
            {park.facilities.map((facility, idx) => (
              <View
                key={idx}
                style={[styles.facilityTag, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <IconSymbol name="checkmark" size={14} color={colors.primary} />
                <Text style={[styles.facilityText, { color: colors.foreground }]}>{facility}</Text>
              </View>
            ))}
          </View>
        </View>

        <Pressable
          onPress={handleNavigate}
          style={({ pressed }) => [
            styles.navButton,
            { backgroundColor: colors.primary },
            pressed && { opacity: 0.85 },
          ]}
        >
          <IconSymbol name="location.north.fill" size={22} color="#FFFFFF" />
          <Text style={styles.navButtonText}>Google 地圖導航</Text>
        </Pressable>

        <View style={styles.section}>
          <View style={styles.reviewsHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              評論 ({allReviews.length})
            </Text>
            <Pressable
              onPress={() => {
                if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowReviewForm(!showReviewForm);
              }}
            >
              <Text style={[styles.addReviewText, { color: colors.primary }]}>
                {showReviewForm ? "取消" : "新增評論"}
              </Text>
            </Pressable>
          </View>

          {showReviewForm && (
            <View style={[styles.reviewForm, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.formLabel, { color: colors.foreground }]}>你的名稱</Text>
              <TextInput
                style={[styles.formInput, { color: colors.foreground, borderColor: colors.border }]}
                placeholder="留空則顯示「匿名使用者」"
                placeholderTextColor={colors.muted}
                value={authorName}
                onChangeText={setAuthorName}
                returnKeyType="done"
              />
              <Text style={[styles.formLabel, { color: colors.foreground }]}>好玩指數</Text>
              <StarRating
                rating={newRating}
                size={32}
                interactive
                onRatingChange={setNewRating}
              />
              <Text style={[styles.formLabel, { color: colors.foreground }]}>評論內容</Text>
              <TextInput
                style={[styles.formTextArea, { color: colors.foreground, borderColor: colors.border }]}
                placeholder="分享你對這個公園的看法..."
                placeholderTextColor={colors.muted}
                value={newComment}
                onChangeText={setNewComment}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
              <Pressable
                onPress={handleSubmitReview}
                disabled={newRating === 0 || !newComment.trim()}
                style={({ pressed }) => [
                  styles.submitBtn,
                  {
                    backgroundColor: newRating === 0 || !newComment.trim() ? colors.muted : colors.primary,
                  },
                  pressed && { opacity: 0.85 },
                ]}
              >
                <Text style={styles.submitBtnText}>送出評論</Text>
              </Pressable>
            </View>
          )}

          <FlatList
            data={allReviews}
            renderItem={renderReviewItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            contentContainerStyle={styles.reviewsList}
            ListEmptyComponent={
              <Text style={[styles.emptyReviews, { color: colors.muted }]}>
                尚無評論，成為第一位評論者！
              </Text>
            }
          />
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
  facilitiesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  facilityTag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 0.5,
    gap: 6,
  },
  facilityText: {
    fontSize: 14,
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
  reviewForm: {
    borderRadius: 16,
    borderWidth: 0.5,
    padding: 16,
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 15,
    fontWeight: "500",
    marginBottom: 8,
    marginTop: 12,
  },
  formInput: {
    borderWidth: 0.5,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  formTextArea: {
    borderWidth: 0.5,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    minHeight: 80,
  },
  submitBtn: {
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 16,
  },
  submitBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
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
