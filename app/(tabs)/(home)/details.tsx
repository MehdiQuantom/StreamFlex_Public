
import { IconSymbol } from '@/components/IconSymbol';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { videoServers } from '@/config/apiConfig';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/contexts/AuthContext';
import { databaseService } from '@/services/databaseService';
import { colors } from '@/styles/commonStyles';
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
  Modal,
  Alert,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { tmdbService, MovieDetails, Season, Episode } from '@/services/tmdbService';

const { width } = Dimensions.get('window');

export default function DetailsScreen() {
  const { id, mediaType } = useLocalSearchParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [details, setDetails] = useState<MovieDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState<Season | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [showSeasonModal, setShowSeasonModal] = useState(false);
  const [showEpisodeModal, setShowEpisodeModal] = useState(false);
  const [showServerModal, setShowServerModal] = useState(false);
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);
  const [pendingServerKey, setPendingServerKey] = useState<string | null>(null);

  const movieId = parseInt(id as string);
  const type = (mediaType as 'movie' | 'tv') || 'movie';

  useEffect(() => {
    loadDetails();
    if (isAuthenticated) {
      checkFavoriteStatus();
    }
  }, [movieId, mediaType, isAuthenticated]);

  const loadDetails = async () => {
    try {
      setLoading(true);
      const data = await tmdbService.getMovieDetails(movieId, type);
      setDetails(data);
      
      if (type === 'tv' && data.seasons && data.seasons.length > 0) {
        const firstSeason = data.seasons.find(s => s.season_number > 0) || data.seasons[0];
        setSelectedSeason(firstSeason);
        const seasonData = await tmdbService.getSeasonDetails(movieId, firstSeason.season_number);
        setEpisodes(seasonData.episodes || []);
      }
    } catch (error) {
      console.error('Error loading details:', error);
      Alert.alert('Error', 'Failed to load content details');
    } finally {
      setLoading(false);
    }
  };

  const checkFavoriteStatus = async () => {
    try {
      const status = await databaseService.isFavorite(movieId, type);
      setIsFavorite(status);
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  const handleFavoriteToggle = async () => {
    if (!isAuthenticated) {
      Alert.alert('Login Required', 'Please login to add favorites');
      return;
    }

    try {
      const title = details?.title || details?.name || 'Unknown';
      const posterPath = details?.poster_path || '';

      if (isFavorite) {
        const { error } = await databaseService.removeFavorite(movieId, type);
        if (error) {
          Alert.alert('Error', 'Failed to remove from favorites');
          return;
        }
        setIsFavorite(false);
        Alert.alert('Success', 'Removed from favorites');
      } else {
        const { error } = await databaseService.addFavorite(movieId, type, title, posterPath);
        if (error) {
          Alert.alert('Error', 'Failed to add to favorites');
          return;
        }
        setIsFavorite(true);
        Alert.alert('Success', 'Added to favorites');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      Alert.alert('Error', 'Something went wrong');
    }
  };

  const handleSeasonSelect = async (season: Season) => {
    try {
      setSelectedSeason(season);
      setShowSeasonModal(false);
      const seasonData = await tmdbService.getSeasonDetails(movieId, season.season_number);
      setEpisodes(seasonData.episodes || []);
    } catch (error) {
      console.error('Error loading season:', error);
      Alert.alert('Error', 'Failed to load season details');
    }
  };

  const handlePlayPress = async (serverKey: string) => {
    if (type === 'tv') {
      setPendingServerKey(serverKey);
      setShowServerModal(false);
      setShowEpisodeModal(true);
    } else {
      const server = videoServers[serverKey as keyof typeof videoServers];
      const url = `${server.base}${server.moviePath}${movieId}`;
      
      if (isAuthenticated) {
        const title = details?.title || details?.name || 'Unknown';
        const posterPath = details?.poster_path || '';
        await databaseService.addToWatchHistory(movieId, type, title, posterPath);
      }
      
      router.push({
        pathname: '/(tabs)/(home)/player',
        params: { url, title: details?.title || details?.name, serverName: server.name },
      });
    }
  };

  const handleEpisodePlay = async (episode: Episode, serverKey: string) => {
    const server = videoServers[serverKey as keyof typeof videoServers];
    const url = `${server.base}${server.tvPath}${movieId}/${selectedSeason?.season_number}/${episode.episode_number}`;
    
    if (isAuthenticated) {
      const title = details?.name || 'Unknown';
      const posterPath = details?.poster_path || '';
      await databaseService.addToWatchHistory(
        movieId,
        type,
        title,
        posterPath,
        selectedSeason?.season_number,
        episode.episode_number
      );
    }
    
    setShowEpisodeModal(false);
    router.push({
      pathname: '/(tabs)/(home)/player',
      params: {
        url,
        title: `${details?.name} - S${selectedSeason?.season_number}E${episode.episode_number}`,
        serverName: server.name,
      },
    });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading details...</Text>
        </View>
      </View>
    );
  }

  if (!details) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load content</Text>
        </View>
      </View>
    );
  }

  const title = details.title || details.name || 'Unknown';
  const year = details.release_date || details.first_air_date;
  const rating = details.vote_average ? details.vote_average.toFixed(1) : 'N/A';

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.backdropContainer}>
          {details.backdrop_path ? (
            <Image
              source={{ uri: tmdbService.getImageUrl(details.backdrop_path, 'large') }}
              style={styles.backdrop}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.backdrop, styles.backdropPlaceholder]}>
              <IconSymbol name="film" size={80} color={colors.textSecondary} />
            </View>
          )}
          <LinearGradient
            colors={['transparent', colors.background]}
            style={styles.backdropGradient}
          />
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <IconSymbol name="chevron.left" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.posterRow}>
            <View style={styles.posterContainer}>
              {details.poster_path ? (
                <Image
                  source={{ uri: tmdbService.getImageUrl(details.poster_path) }}
                  style={styles.poster}
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.poster, styles.posterPlaceholder]}>
                  <IconSymbol name="film" size={40} color={colors.textSecondary} />
                </View>
              )}
            </View>

            <View style={styles.titleContainer}>
              <Text style={styles.title}>{title}</Text>
              <View style={styles.metaRow}>
                <View style={styles.ratingContainer}>
                  <IconSymbol name="star.fill" size={16} color="#FFD700" />
                  <Text style={styles.ratingText}>{rating}</Text>
                </View>
                {year && (
                  <Text style={styles.yearText}>{new Date(year).getFullYear()}</Text>
                )}
                {details.runtime && (
                  <Text style={styles.runtimeText}>{details.runtime} min</Text>
                )}
              </View>
              {details.genres && details.genres.length > 0 && (
                <View style={styles.genresContainer}>
                  {details.genres.slice(0, 3).map((genre) => (
                    <View key={genre.id} style={styles.genreBadge}>
                      <Text style={styles.genreText}>{genre.name}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.playButtonLarge}
              onPress={() => setShowServerModal(true)}
            >
              <IconSymbol name="play.fill" size={24} color={colors.background} />
              <Text style={styles.playButtonText}>Play Now</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.favoriteButton, isFavorite && styles.favoriteButtonActive]}
              onPress={handleFavoriteToggle}
            >
              <IconSymbol
                name={isFavorite ? 'heart.fill' : 'heart'}
                size={24}
                color={isFavorite ? colors.primary : colors.text}
              />
            </TouchableOpacity>
          </View>

          {type === 'tv' && details.seasons && details.seasons.length > 0 && (
            <View style={styles.seasonSection}>
              <TouchableOpacity
                style={styles.seasonSelector}
                onPress={() => setShowSeasonModal(true)}
              >
                <Text style={styles.seasonSelectorText}>
                  {selectedSeason?.name || 'Select Season'}
                </Text>
                <IconSymbol name="chevron.down" size={20} color={colors.text} />
              </TouchableOpacity>
            </View>
          )}

          {details.overview && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Overview</Text>
              <Text style={styles.overview}>{details.overview}</Text>
            </View>
          )}

          {details.credits?.cast && details.credits.cast.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Cast</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {details.credits.cast.slice(0, 10).map((actor) => (
                  <View key={actor.id} style={styles.castItem}>
                    {actor.profile_path ? (
                      <Image
                        source={{ uri: tmdbService.getImageUrl(actor.profile_path) }}
                        style={styles.castImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={[styles.castImage, styles.castImagePlaceholder]}>
                        <IconSymbol name="person.fill" size={30} color={colors.textSecondary} />
                      </View>
                    )}
                    <Text style={styles.castName} numberOfLines={1}>
                      {actor.name}
                    </Text>
                    <Text style={styles.castCharacter} numberOfLines={1}>
                      {actor.character}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </ScrollView>

      <Modal
        visible={showServerModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowServerModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Server</Text>
            {Object.entries(videoServers).map(([key, server]) => (
              <TouchableOpacity
                key={key}
                style={styles.modalButton}
                onPress={() => handlePlayPress(key)}
              >
                <Text style={styles.modalButtonText}>{server.name}</Text>
                <IconSymbol name="chevron.right" size={20} color={colors.text} />
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setShowServerModal(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showSeasonModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSeasonModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Season</Text>
            <ScrollView style={styles.modalScroll}>
              {details.seasons?.filter(s => s.season_number > 0).map((season) => (
                <TouchableOpacity
                  key={season.id}
                  style={[
                    styles.modalButton,
                    selectedSeason?.id === season.id && styles.modalButtonActive,
                  ]}
                  onPress={() => handleSeasonSelect(season)}
                >
                  <Text style={styles.modalButtonText}>{season.name}</Text>
                  <Text style={styles.modalButtonSubtext}>
                    {season.episode_count} episodes
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setShowSeasonModal(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showEpisodeModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEpisodeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Episode</Text>
            <ScrollView style={styles.modalScroll}>
              {episodes.map((episode) => (
                <TouchableOpacity
                  key={episode.id}
                  style={styles.episodeButton}
                  onPress={() => handleEpisodePlay(episode, pendingServerKey!)}
                >
                  <View style={styles.episodeInfo}>
                    <Text style={styles.episodeNumber}>
                      Episode {episode.episode_number}
                    </Text>
                    <Text style={styles.episodeTitle} numberOfLines={1}>
                      {episode.name}
                    </Text>
                    {episode.overview && (
                      <Text style={styles.episodeOverview} numberOfLines={2}>
                        {episode.overview}
                      </Text>
                    )}
                  </View>
                  <IconSymbol name="play.circle.fill" size={32} color={colors.primary} />
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setShowEpisodeModal(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: colors.text,
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  backdropContainer: {
    width: '100%',
    height: 300,
    position: 'relative',
  },
  backdrop: {
    width: '100%',
    height: '100%',
  },
  backdropPlaceholder: {
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdropGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 20,
  },
  posterRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  posterContainer: {
    width: 120,
    height: 180,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: colors.card,
    marginRight: 16,
  },
  poster: {
    width: '100%',
    height: '100%',
  },
  posterPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  yearText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  runtimeText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  genresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  genreBadge: {
    backgroundColor: colors.card,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  genreText: {
    fontSize: 12,
    color: colors.text,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  playButtonLarge: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  playButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.background,
  },
  favoriteButton: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteButtonActive: {
    backgroundColor: colors.card,
  },
  seasonSection: {
    marginBottom: 20,
  },
  seasonSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
  },
  seasonSelectorText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  overview: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  castItem: {
    width: 100,
    marginRight: 12,
  },
  castImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 8,
  },
  castImagePlaceholder: {
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  castName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  castCharacter: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  modalScroll: {
    maxHeight: 400,
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  modalButtonActive: {
    backgroundColor: colors.primary,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  modalButtonSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  modalCancelButton: {
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  episodeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  episodeInfo: {
    flex: 1,
    marginRight: 12,
  },
  episodeNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 4,
  },
  episodeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  episodeOverview: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});
