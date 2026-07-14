import { FlatList, View, Text, StyleSheet } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { ParkCard } from "@/components/park-card";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useFavorites } from "@/lib/favorites-context";
import { TAIWAN_PARKS } from "@/data/parks";

export default function FavoritesScreen() {
  const colors = useColors();
  const { favorites } = useFavorites();

  const favoriteParks = TAIWAN_PARKS.filter((p) => favorites.includes(p.id));

  return (
    <ScreenContainer className="px-4">
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.foreground }]}>我的收藏</Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          {favoriteParks.length > 0
            ? `已收藏 ${favoriteParks.length} 個公園`
            : "尚無收藏公園"}
        </Text>
      </View>

      <FlatList
        data={favoriteParks}
        renderItem={({ item }) => <ParkCard park={item} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <IconSymbol name="heart" size={48} color={colors.muted} />
            <Text style={[styles.emptyText, { color: colors.muted }]}>
              還沒有收藏任何公園
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.muted }]}>
              在公園詳情頁點擊愛心圖示即可收藏
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
  list: {
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
    textAlign: "center",
  },
});
