
import { IconSymbol } from '@/components/IconSymbol';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Dimensions,
} from 'react-native';
import { tmdbService, Movie } from '@/services/tmdbService';
import { Stack, useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';

const { width } = Dimensions.get('window');
const POSTER_WIDTH = (width - 60) / 3;
const POSTER_HEIGHT = POSTER_WIDTH * 1.5;

export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (searchQuery: string) => {
    setQuery(searchQuery);
    
    if (searchQuery.trim().length < 2) {
      setResults([]);
      return;
    }

    try {
      setLoading(true);
      const data = await tmdbService.searchMovies(searchQuery);
      setResults(data.results || []);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleItemPress = (item: Movie) => {
    const mediaType = item.media_type || (item.title ? 'movie' : 'tv');
    router.push({
      pathname: '/(tabs)/(home)/details',
      params: { id: item.id, mediaType },
    });
  };

  const renderItem = ({ item }: { item: Movie }) => {
    const title = item.title || item.name || 'Unknown';
    const year = item.release_date || item.first_air_date;
    const rating = item.vote_average ? item.vote_average.toFixed(1) : 'N/A';
    
    return (
      <TouchableOpacity
        style={styles.resultItem}
        onPress={() => handleItemPress(item)}
        activeOpacity={0.8}
      >
        <View style={styles.posterContainer}>
          {item.poster_path ? (
            <Image
              source={{ uri: tmdbService.getImageUrl(item.poster_path) }}
              style={styles.poster}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.poster, styles.posterPlaceholder]}>
              <IconSymbol name="film" size={30} color={colors.textSecondary} />
            </View>
          )}
        </View>
        <View style={styles.resultInfo}>
          <Text style={styles.resultTitle} numberOfLines={2}>
            {title}
          </Text>
          <View style={styles.resultMeta}>
            <View style={styles.ratingContainer}>
              <IconSymbol name="star.fill" size={14} color="#FFD700" />
              <Text style={styles.ratingText}>{rating}</Text>
            </View>
            {year && (
              <Text style={styles.yearText}>
                {new Date(year).getFullYear()}
              </Text>
            )}
            <View style={styles.mediaTypeBadge}>
              <Text style={styles.mediaTypeText}>
                {item.media_type === 'tv' ? 'TV' : 'Movie'}
              </Text>
            </View>
          </View>
          {item.overview && (
            <Text style={styles.overview} numberOfLines={3}>
              {item.overview}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Search</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <IconSymbol name="magnifyingglass" size={20} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search movies and TV shows..."
            placeholderTextColor={colors.textSecondary}
            value={query}
            onChangeText={handleSearch}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <IconSymbol name="xmark.circle.fill" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      ) : results.length > 0 ? (
        <FlatList
          data={results}
          renderItem={renderItem}
          keyExtractor={(item) => `${item.id}-${item.media_type}`}
          contentContainerStyle={[
            styles.listContent,
            Platform.OS !== 'ios' && styles.listContentWithTabBar
          ]}
          showsVerticalScrollIndicator={false}
        />
      ) : query.length > 0 ? (
        <View style={styles.emptyContainer}>
          <IconSymbol name="magnifyingglass" size={60} color={colors.textSecondary} />
          <Text style={styles.emptyText}>No results found</Text>
          <Text style={styles.emptySubtext}>Try searching with different keywords</Text>
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <IconSymbol name="magnifyingglass" size={60} color={colors.textSecondary} />
          <Text style={styles.emptyText}>Search for movies and TV shows</Text>
          <Text style={styles.emptySubtext}>Start typing to see results</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 16,
    backgroundColor: colors.background,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: colors.text,
    fontSize: 16,
    marginTop: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  listContentWithTabBar: {
    paddingBottom: 100,
  },
  resultItem: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  posterContainer: {
    width: 100,
    height: 150,
  },
  poster: {
    width: '100%',
    height: '100%',
  },
  posterPlaceholder: {
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultInfo: {
    flex: 1,
    padding: 12,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  resultMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  yearText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  mediaTypeBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  mediaTypeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.background,
  },
  overview: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});
