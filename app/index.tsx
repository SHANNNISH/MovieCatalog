import { Ionicons } from "@expo/vector-icons"; // Встроенные иконки Expo
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useMovieStore } from "./useMovieStore";
import { API_KEY, useMoviesQuery } from "./useMoviesQuery";

export default function MovieCatalog() {
  const [showFavorites, setShowFavorites] = useState(false);
  const { favorites } = useMovieStore();
  const [selectedMovie, setSelectedMovie] = useState<any>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const { toggleFavorite, isFavorite } = useMovieStore();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isRefetching,
    isFetchingNextPage,
    refetch,
  } = useMoviesQuery(search);

  const movies = data?.pages.flatMap((page) => page.Search || []) || [];

  const handleSearch = (text: string) => {
    setSearch(text.trim());
  };

  const fetchDetails = async (id: string) => {
    setDetailsLoading(true);
    try {
      const res = await fetch(
        `https://www.omdbapi.com/?i=${id}&plot=full&apikey=${API_KEY}`,
      );
      const data = await res.json();
      setSelectedMovie(data);
    } catch (e) {
      console.error(e);
    } finally {
      setDetailsLoading(false);
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <View style={styles.inner}>
          <Text style={styles.logo}>
            NEW<Text style={{ color: "#E50914" }}>MOVIES</Text>
          </Text>

          <View style={{ flexDirection: "row", marginBottom: 15 }}>
            <TouchableOpacity
              onPress={() => setShowFavorites(false)}
              style={[styles.tab, !showFavorites && styles.activeTab]}
            >
              <Text style={styles.tabText}>Все фильмы</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowFavorites(true)}
              style={[styles.tab, showFavorites && styles.activeTab]}
            >
              <Text style={styles.tabText}>Избранное ({favorites.length})</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.searchBox}
            placeholder="Find a movie..."
            placeholderTextColor="#666"
            value={search}
            onChangeText={(text) => setSearch(text)}
            returnKeyType="search"
            autoCorrect={false}
            onSubmitEditing={(e) => handleSearch(e.nativeEvent.text)}
          />
          <FlatList
            // Если включено "Избранное" — берем массив из стора, иначе — из стейта фильмов
            data={showFavorites ? favorites : movies}
            numColumns={2}
            keyExtractor={(item) => item.imdbID}
            onEndReached={() => {
              if (!showFavorites && hasNextPage) fetchNextPage();
            }}
            refreshControl={
              <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
            }
            keyboardDismissMode="on-drag"
            ListFooterComponent={
              isFetchingNextPage ? <ActivityIndicator color="#E50914" /> : null
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.card}
                onPress={() => fetchDetails(item.imdbID)}
              >
                <Image
                  source={{
                    uri:
                      item.Poster !== "N/A"
                        ? item.Poster
                        : "https://via.placeholder.com/300",
                  }}
                  style={styles.poster}
                />
                <View style={styles.info}>
                  <Text style={styles.title} numberOfLines={1}>
                    {item.Title}
                  </Text>
                  <Text style={styles.year}>{item.Year}</Text>
                </View>
              </TouchableOpacity>
            )}
          />

          <Modal visible={!!selectedMovie} animationType="slide">
            <SafeAreaProvider>
              <SafeAreaView style={styles.modalContainer}>
                {detailsLoading ? (
                  <ActivityIndicator
                    size="large"
                    color="#E50914"
                    style={{ flex: 1 }}
                  />
                ) : (
                  selectedMovie && (
                    <ScrollView>
                      {/* Кнопка назад */}
                      <TouchableOpacity
                        onPress={() => setSelectedMovie(null)}
                        style={styles.closeBtn}
                      >
                        <Text style={styles.closeText}>╳ Назад</Text>
                      </TouchableOpacity>

                      <Image
                        source={{ uri: selectedMovie.Poster }}
                        style={styles.modalPoster}
                      />

                      <View style={styles.modalContent}>
                        {/* Контейнер для заголовка и сердечка */}
                        <View
                          style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Text style={[styles.modalTitle, { flex: 1 }]}>
                            {selectedMovie.Title}
                          </Text>

                          <TouchableOpacity
                            onPress={() => toggleFavorite(selectedMovie)}
                            style={{ padding: 10 }}
                          >
                            <Ionicons
                              name={
                                isFavorite(selectedMovie.imdbID)
                                  ? "heart"
                                  : "heart-outline"
                              }
                              size={30}
                              color={
                                isFavorite(selectedMovie.imdbID)
                                  ? "#E50914"
                                  : "#fff"
                              }
                            />
                          </TouchableOpacity>
                        </View>

                        <Text style={styles.plot}>{selectedMovie.Plot}</Text>
                      </View>
                    </ScrollView>
                  )
                )}
              </SafeAreaView>
            </SafeAreaProvider>
          </Modal>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  inner: { flex: 1, paddingHorizontal: 10 },
  logo: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "900",
    textAlign: "center",
    marginVertical: 15,
  },
  searchBox: {
    backgroundColor: "#1a1a1a",
    color: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  card: {
    flex: 1,
    margin: 8,
    backgroundColor: "#111",
    borderRadius: 15,
    overflow: "hidden",
  },
  poster: { width: "100%", height: 260, resizeMode: "cover" },
  info: { padding: 10 },
  title: { color: "#fff", fontSize: 13, fontWeight: "bold" },
  year: { color: "#E50914", fontSize: 11, marginTop: 4 },
  modalContainer: { flex: 1, backgroundColor: "#000" },
  closeBtn: { padding: 20 },
  closeText: { color: "#fff", fontSize: 18 },
  modalPoster: { width: "100%", height: 400 },
  modalContent: { padding: 20 },
  modalTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  plot: { color: "#ccc", lineHeight: 22 },
  favButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.5)", // Полупрозрачный фон
    borderRadius: 20,
    padding: 5,
    zIndex: 1, // Чтобы кнопка была точно сверху
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomColor: "#E50914", // Красная линия под активной вкладкой
  },
  tabText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
