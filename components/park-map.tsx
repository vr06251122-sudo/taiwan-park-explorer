import { useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  PanResponder,
  Platform,
  useWindowDimensions,
} from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import {
  type Park,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  CATEGORY_ICONS,
} from "@/data/parks";

const TILE_SIZE = 256;
const MIN_ZOOM = 6;
const MAX_ZOOM = 17;

// Web Mercator 投影:經緯度 → 世界像素座標
function lonToX(lon: number, zoom: number): number {
  return ((lon + 180) / 360) * TILE_SIZE * 2 ** zoom;
}
function latToY(lat: number, zoom: number): number {
  const rad = (lat * Math.PI) / 180;
  return (
    ((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) *
    TILE_SIZE *
    2 ** zoom
  );
}
function xToLon(x: number, zoom: number): number {
  return (x / (TILE_SIZE * 2 ** zoom)) * 360 - 180;
}
function yToLat(y: number, zoom: number): number {
  const n = Math.PI * (1 - (2 * y) / (TILE_SIZE * 2 ** zoom));
  return (Math.atan(Math.sinh(n)) * 180) / Math.PI;
}

interface ParkMapProps {
  parks: Park[];
  height?: number;
  /** 使用者目前位置,提供時會顯示藍點與「回到我附近」按鈕 */
  userCoords?: { latitude: number; longitude: number } | null;
}

export function ParkMap({ parks, height = 420, userCoords }: ParkMapProps) {
  const router = useRouter();
  const colors = useColors();
  const windowWidth = useWindowDimensions().width;
  // onLayout 在部分 web 環境不觸發,以視窗寬度(扣掉頁面左右邊距)作為備援
  const [measuredWidth, setMeasuredWidth] = useState(0);
  const width = measuredWidth || Math.max(windowWidth - 32, 200);
  const [selected, setSelected] = useState<Park | null>(null);
  const [drag, setDrag] = useState({ x: 0, y: 0 });

  // 依公園分佈自動決定初始中心與縮放層級
  const initialView = useMemo(() => {
    if (parks.length === 0) return { lat: 23.7, lon: 121.0, zoom: 7 };
    const lats = parks.map((p) => p.latitude);
    const lons = parks.map((p) => p.longitude);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLon = Math.min(...lons);
    const maxLon = Math.max(...lons);
    const centerLat = (minLat + maxLat) / 2;
    const centerLon = (minLon + maxLon) / 2;
    const w = width || 360;
    let zoom = MAX_ZOOM - 3;
    while (zoom > MIN_ZOOM) {
      const spanX = lonToX(maxLon, zoom) - lonToX(minLon, zoom);
      const spanY = latToY(minLat, zoom) - latToY(maxLat, zoom);
      if (spanX < w * 0.8 && spanY < height * 0.7) break;
      zoom--;
    }
    return { lat: centerLat, lon: centerLon, zoom };
  }, [parks, width, height]);

  const [view, setView] = useState(initialView);
  // 篩選結果改變時重新取景
  const parksKey = parks.map((p) => p.id).join(",");
  const prevKey = useRef(parksKey);
  if (prevKey.current !== parksKey) {
    prevKey.current = parksKey;
    setView(initialView);
    setSelected(null);
  }

  const viewRef = useRef(view);
  viewRef.current = view;
  const sizeRef = useRef({ w: width, h: height });
  sizeRef.current = { w: width, h: height };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_evt, g) =>
        Math.abs(g.dx) + Math.abs(g.dy) > 8,
      onPanResponderMove: (_evt, g) => {
        setDrag({ x: g.dx, y: g.dy });
      },
      onPanResponderRelease: (_evt, g) => {
        const v = viewRef.current;
        const cx = lonToX(v.lon, v.zoom) - g.dx;
        const cy = latToY(v.lat, v.zoom) - g.dy;
        setView({ lat: yToLat(cy, v.zoom), lon: xToLon(cx, v.zoom), zoom: v.zoom });
        setDrag({ x: 0, y: 0 });
      },
      onPanResponderTerminate: () => setDrag({ x: 0, y: 0 }),
    })
  ).current;

  const changeZoom = (delta: number) => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setView((v) => ({
      ...v,
      zoom: Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, v.zoom + delta)),
    }));
  };

  const goToMe = () => {
    if (!userCoords) return;
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setView({ lat: userCoords.latitude, lon: userCoords.longitude, zoom: 14 });
  };

  // 計算目前視窗需要的圖磚與各公園的畫面位置
  const { tiles, markers } = useMemo(() => {
    if (!width) return { tiles: [], markers: [] };
    const { lat, lon, zoom } = view;
    const centerX = lonToX(lon, zoom);
    const centerY = latToY(lat, zoom);
    const tlX = centerX - width / 2;
    const tlY = centerY - height / 2;

    const maxTile = 2 ** zoom - 1;
    const tileList: { key: string; uri: string; left: number; top: number }[] = [];
    for (let tx = Math.floor(tlX / TILE_SIZE); tx <= Math.floor((tlX + width) / TILE_SIZE); tx++) {
      for (let ty = Math.floor(tlY / TILE_SIZE); ty <= Math.floor((tlY + height) / TILE_SIZE); ty++) {
        if (ty < 0 || ty > maxTile) continue;
        const wrappedX = ((tx % (maxTile + 1)) + maxTile + 1) % (maxTile + 1);
        tileList.push({
          key: `${zoom}/${tx}/${ty}`,
          uri: `https://tile.openstreetmap.org/${zoom}/${wrappedX}/${ty}.png`,
          left: tx * TILE_SIZE - tlX,
          top: ty * TILE_SIZE - tlY,
        });
      }
    }

    const markerList = parks
      .map((park) => ({
        park,
        left: lonToX(park.longitude, zoom) - tlX,
        top: latToY(park.latitude, zoom) - tlY,
      }))
      .filter(
        (m) => m.left > -40 && m.left < width + 40 && m.top > -40 && m.top < height + 40
      );

    return { tiles: tileList, markers: markerList };
  }, [view, width, height, parks]);

  const handleMarkerPress = (park: Park) => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelected((prev) => (prev?.id === park.id ? null : park));
  };

  return (
    <View
      style={[styles.container, { height, borderColor: colors.border }]}
      onLayout={(e) => setMeasuredWidth(e.nativeEvent.layout.width)}
      {...panResponder.panHandlers}
    >
      <View
        style={{
          ...StyleSheet.absoluteFillObject,
          transform: [{ translateX: drag.x }, { translateY: drag.y }],
        }}
      >
        {tiles.map((t) => (
          <Image
            key={t.key}
            source={{ uri: t.uri }}
            style={{
              position: "absolute",
              left: t.left,
              top: t.top,
              width: TILE_SIZE,
              height: TILE_SIZE,
            }}
          />
        ))}

        {/* 使用者位置藍點 */}
        {userCoords && width > 0 && (() => {
          const { lat, lon, zoom } = view;
          const tlX = lonToX(lon, zoom) - width / 2;
          const tlY = latToY(lat, zoom) - height / 2;
          const ux = lonToX(userCoords.longitude, zoom) - tlX;
          const uy = latToY(userCoords.latitude, zoom) - tlY;
          if (ux < -30 || ux > width + 30 || uy < -30 || uy > height + 30) return null;
          return (
            <View pointerEvents="none" style={[styles.userHalo, { left: ux - 14, top: uy - 14 }]}>
              <View style={styles.userDot} />
            </View>
          );
        })()}

        {markers.map(({ park, left, top }) => {
          const mainCategory = park.categories[0];
          const color = CATEGORY_COLORS[mainCategory];
          const isSelected = selected?.id === park.id;
          return (
            <Pressable
              key={park.id}
              onPress={() => handleMarkerPress(park)}
              style={[
                styles.marker,
                {
                  left: left - 18,
                  top: top - 18,
                  backgroundColor: color,
                  borderColor: "#FFFFFF",
                  transform: [{ scale: isSelected ? 1.25 : 1 }],
                  zIndex: isSelected ? 10 : 1,
                },
              ]}
            >
              <IconSymbol name={CATEGORY_ICONS[mainCategory] as any} size={18} color="#FFFFFF" />
            </Pressable>
          );
        })}
      </View>

      {/* 縮放控制 */}
      <View style={[styles.zoomControls, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Pressable onPress={() => changeZoom(1)} style={styles.zoomBtn}>
          <Text style={[styles.zoomText, { color: colors.foreground }]}>+</Text>
        </Pressable>
        <View style={[styles.zoomDivider, { backgroundColor: colors.border }]} />
        <Pressable onPress={() => changeZoom(-1)} style={styles.zoomBtn}>
          <Text style={[styles.zoomText, { color: colors.foreground }]}>−</Text>
        </Pressable>
        {userCoords && (
          <>
            <View style={[styles.zoomDivider, { backgroundColor: colors.border }]} />
            <Pressable onPress={goToMe} style={styles.zoomBtn}>
              <IconSymbol name="location.circle.fill" size={22} color={colors.primary} />
            </Pressable>
          </>
        )}
      </View>

      {/* OSM 版權標示(使用條款要求) */}
      <Text style={styles.attribution}>© OpenStreetMap</Text>

      {/* 選中公園的資訊卡 */}
      {selected && (
        <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.infoName, { color: colors.foreground }]} numberOfLines={1}>
              {selected.name}
            </Text>
            <Text style={[styles.infoMeta, { color: colors.muted }]} numberOfLines={1}>
              {selected.city} {selected.district} · ⭐ {selected.funRating.toFixed(1)} ·{" "}
              {selected.categories.map((c) => CATEGORY_LABELS[c]).join("、")}
            </Text>
          </View>
          <Pressable
            onPress={() => router.push(`/park/${selected.id}` as any)}
            style={[styles.infoBtn, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.infoBtnText}>詳情</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 0.5,
    overflow: "hidden",
    backgroundColor: "#E8ECE5",
  },
  marker: {
    position: "absolute",
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2.5,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  zoomControls: {
    position: "absolute",
    right: 12,
    top: 12,
    borderRadius: 10,
    borderWidth: 0.5,
    overflow: "hidden",
  },
  zoomBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  zoomText: {
    fontSize: 22,
    fontWeight: "500",
    lineHeight: 26,
  },
  zoomDivider: {
    height: 0.5,
  },
  userHalo: {
    position: "absolute",
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#4A90D940",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 5,
  },
  userDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#4A90D9",
    borderWidth: 2.5,
    borderColor: "#FFFFFF",
  },
  attribution: {
    position: "absolute",
    left: 8,
    bottom: 6,
    fontSize: 10,
    color: "#00000088",
    backgroundColor: "#FFFFFFAA",
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  infoCard: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 14,
    borderWidth: 0.5,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 6,
  },
  infoName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  infoMeta: {
    fontSize: 13,
  },
  infoBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  infoBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
});
