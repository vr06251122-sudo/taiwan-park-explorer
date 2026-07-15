// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SymbolWeight, SymbolViewProps } from "expo-symbols";
import { ComponentProps } from "react";
import { OpaqueColorValue, type StyleProp, type TextStyle } from "react-native";

type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  "house.fill": "home",
  "paperplane.fill": "send",
  "chevron.left.forwardslash.chevron.right": "code",
  "chevron.right": "chevron-right",
  "magnifyingglass": "search",
  "heart.fill": "favorite",
  "heart": "favorite-border",
  "map.fill": "map",
  "star.fill": "star",
  "star": "star-border",
  "star.leadinghalf.filled": "star-half",
  "location.fill": "location-on",
  "location.north.fill": "navigation",
  "directions.walk": "directions-walk",
  "directions.bike": "directions-bike",
  "accessible": "accessible",
  "pets": "pets",
  "child.care": "child-care",
  "plus": "add",
  "chevron.left": "chevron-left",
  "chevron.down": "keyboard-arrow-down",
  "chevron.up": "keyboard-arrow-up",
  "checkmark": "check",
  "checkmark.circle.fill": "check-circle",
  "xmark": "close",
  "xmark.circle.fill": "cancel",
  "arrow.right": "arrow-forward",
  "calendar": "calendar-today",
  "person.fill": "person",
  "person.circle.fill": "account-circle",
  "trash": "delete",
  "pawprint.fill": "pets",
  "tree.fill": "park",
  "mappin.and.ellipse": "place",
  "info.circle": "info",
  "list.bullet": "list",
  "square.grid.2x2": "grid-view",
  "slider.horizontal.3": "tune",
  "clock.fill": "schedule",
  "sun.max.fill": "wb-sunny",
  "moon.fill": "nightlight",
  "cloud.sun.fill": "wb-cloudy",
  "cloud.fill": "cloud",
  "cloud.fog.fill": "blur-on",
  "cloud.drizzle.fill": "grain",
  "cloud.rain.fill": "opacity",
  "cloud.bolt.fill": "flash-on",
  "snowflake": "ac-unit",
  "umbrella.fill": "beach-access",
  "location.circle.fill": "my-location",
  "arrow.triangle.turn.up.right.fill": "near-me",
  // 分類圖示直接使用 Material Icons 名稱(data/parks.ts 的 CATEGORY_ICONS)
  "directions-walk": "directions-walk",
  "directions-bike": "directions-bike",
  "child-care": "child-care",
} as Record<string, ComponentProps<typeof MaterialIcons>["name"]>;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name] as ComponentProps<typeof MaterialIcons>["name"]} style={style} />;
}
