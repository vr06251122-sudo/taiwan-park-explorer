import { Pressable, View, Text, StyleSheet } from "react-native";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import {
  type ParkCategory,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  CATEGORY_ICONS,
} from "@/data/parks";

interface CategoryPillProps {
  category: ParkCategory;
  selected: boolean;
  onPress: (cat: ParkCategory) => void;
}

export function CategoryPill({ category, selected, onPress }: CategoryPillProps) {
  const colors = useColors();
  const color = CATEGORY_COLORS[category];

  const handlePress = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress(category);
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.pill,
        {
          backgroundColor: selected ? color : colors.surface,
          borderColor: selected ? color : colors.border,
        },
        pressed && { opacity: 0.8 },
      ]}
    >
      <IconSymbol
        name={CATEGORY_ICONS[category] as any}
        size={16}
        color={selected ? "#FFFFFF" : color}
      />
      <Text
        style={[
          styles.label,
          { color: selected ? "#FFFFFF" : colors.foreground },
        ]}
      >
        {CATEGORY_LABELS[category]}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
  },
});
