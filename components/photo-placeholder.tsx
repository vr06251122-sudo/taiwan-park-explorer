import { View, Text, StyleSheet, type StyleProp, type ViewStyle } from "react-native";

interface PhotoPlaceholderProps {
  style?: StyleProp<ViewStyle>;
  /** 溜滑梯 emoji 的大小 */
  emojiSize?: number;
}

/** 公園沒有照片時的預設圖:溜滑梯概念 */
export function PhotoPlaceholder({ style, emojiSize = 40 }: PhotoPlaceholderProps) {
  return (
    <View style={[styles.box, style]}>
      <Text style={{ fontSize: emojiSize }}>🛝</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: "#5B9A6E1A",
    alignItems: "center",
    justifyContent: "center",
  },
});
