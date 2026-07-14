import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { ParkReview } from "@/data/parks";

const FAVORITES_KEY = "park_favorites";
const REVIEWS_KEY = "park_user_reviews";

interface FavoritesContextType {
  favorites: string[];
  toggleFavorite: (parkId: string) => void;
  isFavorite: (parkId: string) => boolean;
  userReviews: Record<string, ParkReview[]>;
  addReview: (parkId: string, review: ParkReview) => void;
  getReviews: (parkId: string) => ParkReview[];
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [userReviews, setUserReviews] = useState<Record<string, ParkReview[]>>({});

  useEffect(() => {
    (async () => {
      try {
        const favData = await AsyncStorage.getItem(FAVORITES_KEY);
        if (favData) setFavorites(JSON.parse(favData));
        const revData = await AsyncStorage.getItem(REVIEWS_KEY);
        if (revData) setUserReviews(JSON.parse(revData));
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

  const addReview = useCallback((parkId: string, review: ParkReview) => {
    setUserReviews((prev) => {
      const existing = prev[parkId] || [];
      const next = { ...prev, [parkId]: [review, ...existing] };
      AsyncStorage.setItem(REVIEWS_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const getReviews = useCallback(
    (parkId: string) => userReviews[parkId] || [],
    [userReviews]
  );

  return (
    <FavoritesContext.Provider
      value={{ favorites, toggleFavorite, isFavorite, userReviews, addReview, getReviews }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used within FavoritesProvider");
  return ctx;
}
