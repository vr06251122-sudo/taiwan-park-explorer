import { Pressable, View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import {
  type Park,
  type ParkCategory,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  CATEGORY_ICONS,
} from "@/data/parks";
import { useFavorites } from "@/lib/favorites-context";
import { formatDistance } from "@/lib/geo";

interface ParkCardProps {
  park: Park;
  showFavorite?: boolean;
  /** 與使用者的距離(公里),提供時會顯示距離標籤 */
  distanceKm?: number;
}

export function ParkCard({ park, showFavorite = true, distanceKm }: ParkCardProps) {
  const router = useRouter();
  const colors = useColors();
  const { isFavorite, toggleFavorite } = useFavorites();

  const handlePress = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/park/${park.id}` as any);
  };

  const handleFavorite = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleFavorite(park.id);
  };

  const renderStars = (rating: number) => {
    return (
      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map((i) => (
          <IconSymbol
            key={i}
            name={i <= Math.round(rating) ? "star.fill" : "star"}
            size={14}
            color={i <= Math.round(rating) ? colors.warning : colors.muted}
          />
        ))}
        <Text style={[styles.ratingText, { color: colors.muted }]}>
          {rating.toFixed(1)} · {park.reviewCount} 則評論
        </Text>
      </View>
    );
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
        pressed && { opacity: 0.7 },
      ]}
    >
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <View style={styles.titleRow}>
            <Text style={[styles.parkName, { color: colors.foreground }]} numberOfLines={1}>
              {park.name}
            </Text>
            {showFavorite && (
              <Pressable onPress={handleFavorite} style={styles.favBtn}>
                <IconSymbol
                  name={isFavorite(park.id) ? "heart.fill" : "heart"}
                  size={22}
                  color={isFavorite(park.id) ? colors.error : colors.muted}
                />
              </Pressable>
            )}
          </View>
          <View style={styles.locationRow}>
            <IconSymbol name="mappin.and.ellipse" size={13} color={colors.muted} />
            <Text style={[styles.locationText, { color: colors.muted }]} numberOfLines={1}>
              {park.city} {park.district} · {park.address}
            </Text>
            {distanceKm !== undefined && (
              <View style={[styles.distanceBadge, { backgroundColor: colors.primary + "18" }]}>
                <IconSymbol name="location.fill" size={11} color={colors.primary} />
                <Text style={[styles.distanceText, { color: colors.primary }]}>
                  {formatDistance(distanceKm)}
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.categoriesRow}>
          {park.categories.map((cat) => (
            <View
              key={cat}
              style={[styles.categoryTag, { backgroundColor: CATEGORY_COLORS[cat] + "22" }]}
            >
              <IconSymbol
                name={CATEGORY_ICONS[cat] as any}
                size={12}
                color={CATEGORY_COLORS[cat]}
              />
              <Text style={[styles.categoryText, { color: CATEGORY_COLORS[cat] }]}>
                {CATEGORY_LABELS[cat]}
              </Text>
            </View>
          ))}
        </View>

        <Text
          style={[styles.description, { color: colors.muted }]}
          numberOfLines={2}
        >
          {park.description}
        </Text>

        {renderStars(park.funRating)}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 0.5,
    marginBottom: 12,
    overflow: "hidden",
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    marginBottom: 10,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  parkName: {
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
    marginRight: 8,
  },
  favBtn: {
    padding: 4,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  locationText: {
    fontSize: 13,
    flex: 1,
  },
  distanceBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  distanceText: {
    fontSize: 12,
    fontWeight: "600",
  },
  categoriesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 10,
  },
  categoryTag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "500",
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  starsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  ratingText: {
    fontSize: 13,
    marginLeft: 6,
  },
});
