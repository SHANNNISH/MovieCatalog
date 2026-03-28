import { useInfiniteQuery } from "@tanstack/react-query";

export const API_KEY = "63a7c10e";

// Описываем, как выглядит один фильм
export interface Movie {
  Title: string;
  Year: string;
  imdbID: string;
  Type: string;
  Poster: string;
}

// Описываем ответ от сервера
interface OMDbResponse {
  Search?: Movie[];
  totalResults?: string;
  Response: string;
  Error?: string;
}

const fetchMoviesPage = async ({
  query,
  pageParam = 0,
}: {
  query: string;
  pageParam: number;
}): Promise<OMDbResponse> => {
  let searchTerm: string;
  let page: number;
  if (query.trim() !== "") {
    searchTerm = query.trim();
    page = pageParam + 1;
  } else {
    const startYear = 2026;
    const currentYear = startYear - pageParam;
    searchTerm = currentYear.toString();
    page = 1;
  }

  const response = await fetch(
    `https://www.omdbapi.com/?s=${searchTerm}&page=${page}&apikey=${API_KEY}`,
  );

  return response.json();
};

export const useMoviesQuery = (search: string) => {
  return useInfiniteQuery({
    queryKey: ["movies", search],
    queryFn: ({ pageParam }) => fetchMoviesPage({ query: search, pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (search.trim() === "") {
        // Лента времени: листаем, пока не дойдем до 1990 года
        const yearsLoaded = allPages.length;
        const targetYear = 2026 - yearsLoaded;
        return targetYear >= 1990 ? yearsLoaded : undefined;
      } else {
        // Обычный поиск: стандартная пагинация по totalResults
        const totalResults = parseInt(lastPage.totalResults || "0");
        const loadedSoFar = allPages.length * 10;
        return loadedSoFar < totalResults ? allPages.length : undefined;
      }
    },
    staleTime: 1000 * 60 * 5,
  });
};
