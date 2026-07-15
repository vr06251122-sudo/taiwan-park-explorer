import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import * as Location from "expo-location";

export type LocationStatus = "idle" | "loading" | "granted" | "denied" | "unavailable";

export interface UserCoords {
  latitude: number;
  longitude: number;
}

interface LocationContextType {
  coords: UserCoords | null;
  status: LocationStatus;
  requestLocation: () => Promise<void>;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [coords, setCoords] = useState<UserCoords | null>(null);
  const [status, setStatus] = useState<LocationStatus>("idle");

  const requestLocation = useCallback(async () => {
    setStatus("loading");
    try {
      const { status: permission } = await Location.requestForegroundPermissionsAsync();
      if (permission !== "granted") {
        setStatus("denied");
        return;
      }
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setCoords({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
      setStatus("granted");
    } catch {
      // 裝置不支援定位或使用者取消
      setStatus("unavailable");
    }
  }, []);

  // App 開啟時自動嘗試取得定位;失敗不阻擋任何功能
  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  return (
    <LocationContext.Provider value={{ coords, status, requestLocation }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useUserLocation() {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error("useUserLocation must be used within LocationProvider");
  return ctx;
}
