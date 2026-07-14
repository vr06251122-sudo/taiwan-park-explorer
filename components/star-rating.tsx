import { Pressable, View, StyleSheet } from "react-native";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

interface StarRatingProps {
  rating: number;
  size?: number;
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
}

export function StarRating({
  rating,
  size = 20,
  interactive = false,
  onRatingChange,
}: StarRatingProps) {
  const colors = useColors();

  const handlePress = (value: number) => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onRatingChange?.(value);
  };

  return (
    <View style={styles.container}>
      {[1, 2, 3, 4, 5].map((i) => {
        const filled = i <= Math.round(rating);
        const half = !filled && i - 0.5 <= rating;
        const iconName = filled ? "star.fill" : half ? "star.leadinghalf.filled" : "star";

        if (interactive) {
          return (
            <Pressable
              key={i}
              onPress={() => handlePress(i)}
              style={styles.starBtn}
            >
              <IconSymbol
                name={iconName as any}
                size={size}
                color={filled || half ? colors.warning : colors.muted}
              />
            </Pressable>
          );
        }

        return (
          <IconSymbol
            key={i}
            name={iconName as any}
            size={size}
            color={filled || half ? colors.warning : colors.muted}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  starBtn: {
    padding: 4,
  },
});
