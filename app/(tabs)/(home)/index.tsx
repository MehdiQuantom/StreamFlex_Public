
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Platform,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { tmdbService, Movie } from '@/services/tmdbService';
import { LinearGradient } from 'expo-linear-gradient';
import { IconSymbol } from '@/components/IconSymbol';

const { width } = Dimensions.get('window');
const POSTER_WIDTH = (width - 60) / 3;
const POSTER_HEIGHT = POSTER_WIDTH * 1.5;

export default function HomeScreen() {
  const router = useRouter();
  const [trending, setTrending] = useState<Movie[]>([]);
  const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
  const [popularTV, setPopularTV] = useState<Movie[]>([]);
  const [topRatedMovies, setTopRatedMovies] = useState<Movie[]>([]);
  const [topRatedTV, setTopRatedTV] = useState<Movie[]>([]);
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [trendingTV, setTrendingTV] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      setLoading(true);
      const [
        trendingData,
        moviesData,
        tvData,
        topMoviesData,
        topTVData,
        trendingMoviesData,
        trendingTVData,
      ] = await Promise.all([
        tmdbService.getTrending('all', 'week'),
        tmdbService.getPopular('movie'),
        tmdbService.getPopular('tv'),
        tmdbService.getTopRated('movie'),
        tmdbService.getTopRated('tv'),
        tmdbService.getTrending('movie', 'week'),
        tmdbService.getTrending('tv', 'week'),
      ]);
      
      setTrending(trendingData.slice(0, 10));
      setPopularMovies(moviesData.slice(0, 10));
      setPopularTV(tvData.slice(0, 10));
      setTopRatedMovies(topMoviesData.slice(0, 10));
      setTopRatedTV(topTVData.slice(0, 10));
      setTrendingMovies(trendingMoviesData.slice(0, 10));
      setTrendingTV(trendingTVData.slice(0, 10));
    } catch (error) {
      console.error('Error loading content:', error);
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

  const renderPosterItem = (item: Movie) => {
    const title = item.title || item.name || 'Unknown';
    const rating = item.vote_average ? item.vote_average.toFixed(1) : 'N/A';
    
    return (
      <TouchableOpacity
        key={item.id}
        style={styles.posterItem}
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
              <IconSymbol name="film" size={40} color={colors.textSecondary} />
            </View>
          )}
          <View style={styles.ratingBadge}>
            <IconSymbol name="star.fill" size={12} color="#FFD700" />
            <Text style={styles.ratingText}>{rating}</Text>
          </View>
        </View>
        <Text style={styles.posterTitle} numberOfLines={2}>
          {title}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderFeaturedItem = (item: Movie) => {
    const title = item.title || item.name || 'Unknown';
    const rating = item.vote_average ? item.vote_average.toFixed(1) : 'N/A';
    
    return (
      <TouchableOpacity
        key={item.id}
        style={styles.featuredItem}
        onPress={() => handleItemPress(item)}
        activeOpacity={0.9}
      >
        <Image
          source={{ uri: tmdbService.getImageUrl(item.backdrop_path || item.poster_path, 'large') }}
          style={styles.featuredImage}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)', colors.background]}
          style={styles.featuredGradient}
        >
          <View style={styles.featuredContent}>
            <Text style={styles.featuredTitle} numberOfLines={2}>
              {title}
            </Text>
            <View style={styles.featuredInfo}>
              <View style={styles.featuredRating}>
                <IconSymbol name="star.fill" size={16} color="#FFD700" />
                <Text style={styles.featuredRatingText}>{rating}</Text>
              </View>
              <TouchableOpacity
                style={styles.playButton}
                onPress={() => handleItemPress(item)}
              >
                <IconSymbol name="play.fill" size={20} color={colors.background} />
                <Text style={styles.playButtonText}>Watch Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            headerShown: false,
          }}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading content...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>StreamFlex</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          Platform.OS !== 'ios' && styles.scrollContentWithTabBar
        ]}
        showsVerticalScrollIndicator={false}
      >
        {trending.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Trending Now</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScroll}
            >
              {trending.slice(0, 5).map(renderFeaturedItem)}
            </ScrollView>
          </View>
        )}

        {popularMovies.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Popular Movies</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScroll}
            >
              {popularMovies.map(renderPosterItem)}
            </ScrollView>
          </View>
        )}

        {popularTV.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Popular TV Shows</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScroll}
            >
              {popularTV.map(renderPosterItem)}
            </ScrollView>
          </View>
        )}

        {topRatedMovies.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Top Rated Movies</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScroll}
            >
              {topRatedMovies.map(renderPosterItem)}
            </ScrollView>
          </View>
        )}

        {topRatedTV.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Top Rated TV Shows</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScroll}
            >
              {topRatedTV.map(renderPosterItem)}
            </ScrollView>
          </View>
        )}

        {trendingMovies.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Trending Movies</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScroll}
            >
              {trendingMovies.map(renderPosterItem)}
            </ScrollView>
          </View>
        )}

        {trendingTV.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Trending TV Shows</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScroll}
            >
              {trendingTV.map(renderPosterItem)}
            </ScrollView>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 16,
    backgroundColor: colors.background,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  scrollContentWithTabBar: {
    paddingBottom: 100,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  horizontalScroll: {
    paddingHorizontal: 20,
    gap: 12,
  },
  featuredItem: {
    width: width - 40,
    height: 220,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 12,
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  featuredGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '70%',
    justifyContent: 'flex-end',
  },
  featuredContent: {
    padding: 16,
  },
  featuredTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  featuredInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  featuredRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  featuredRatingText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
  },
  playButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.background,
  },
  posterItem: {
    width: POSTER_WIDTH,
    marginRight: 12,
  },
  posterContainer: {
    width: POSTER_WIDTH,
    height: POSTER_HEIGHT,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: colors.card,
  },
  poster: {
    width: '100%',
    height: '100%',
  },
  posterPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  ratingBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 4,
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.text,
  },
  posterTitle: {
    fontSize: 14,
    color: colors.text,
    marginTop: 8,
    lineHeight: 18,
  },
});
