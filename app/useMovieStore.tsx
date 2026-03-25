import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface Movie {
  imdbID: string;
  Title: string;
  Poster: string;
  Year: string;
}

interface MovieState {
  favorites: Movie[];
  toggleFavorite: (movie: Movie) => void;
  isFavorite: (id: string) => boolean;
}

export const useMovieStore = create<MovieState>()(
  persist(
    (set, get) => ({
      favorites: [],
      toggleFavorite: (movie) => {
        const { favorites } = get();
        const exists = favorites.some((m) => m.imdbID === movie.imdbID);

        if (exists) {
          set({
            favorites: favorites.filter((m) => m.imdbID !== movie.imdbID),
          });
        } else {
          set({ favorites: [...favorites, movie] });
        }
      },
      isFavorite: (id) => get().favorites.some((m) => m.imdbID === id),
    }),
    {
      name: "movie-favorites", // Имя ключа в памяти телефона
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
