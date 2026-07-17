import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const FAVORITES_KEY = "park_favorites";

interface FavoritesContextType {
  favorites: string[]; // Google Place ID 清單
  toggleFavorite: (parkId: string) => void;
  isFavorite: (parkId: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const favData = await AsyncStorage.getItem(FAVORITES_KEY);
        if (favData) setFavorites(JSON.parse(favData));
      } catch (e) {
        // ignore read errors
      }
    })();
  }, []);

  const toggleFavorite = useCallback((parkId: string) => {
    setFavorites((prev) => {
      const next = prev.includes(parkId)
        ? prev.filter((id) => id !== parkId)
        : [...prev, parkId];
      AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const isFavorite = useCallback(
    (parkId: string) => favorites.includes(parkId),
    [favorites]
  );

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used within FavoritesProvider");
  return ctx;
}
