import { FlatList, View, Text, StyleSheet } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { ParkCard } from "@/components/park-card";
import { SkeletonParkList } from "@/components/skeleton";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useFavorites } from "@/lib/favorites-context";
import { trpc } from "@/lib/trpc";

export default function FavoritesScreen() {
  const colors = useColors();
  const { favorites } = useFavorites();

  // 收藏只存 Google Place ID,內容即時向 Google 取得
  const favoritesQuery = trpc.parks.byIds.useQuery(
    { ids: favorites },
    { enabled: favorites.length > 0, staleTime: 10 * 60 * 1000 }
  );
  const favoriteParks = favorites.length > 0 ? (favoritesQuery.data ?? []) : [];

  return (
    <ScreenContainer className="px-4">
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.foreground }]}>口袋名單</Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          {favorites.length > 0
            ? `收了 ${favorites.length} 個好地方`
            : "把想去的公園收進來"}
        </Text>
      </View>

      {favorites.length > 0 && favoritesQuery.isLoading ? (
        <SkeletonParkList count={Math.min(favorites.length, 4)} />
      ) : (
        <FlatList
          data={favoriteParks}
          renderItem={({ item }) => <ParkCard park={item} />}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <IconSymbol name="heart" size={48} color={colors.muted} />
              <Text style={[styles.emptyText, { color: colors.muted }]}>
                口袋名單還空著
              </Text>
              <Text style={[styles.emptySubtext, { color: colors.muted }]}>
                看到喜歡的公園,點 ❤️ 收起來!
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
