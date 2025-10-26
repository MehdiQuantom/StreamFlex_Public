
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
  Modal,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { tmdbService, MovieDetails, Season, Episode } from '@/services/tmdbService';
import { databaseService } from '@/services/databaseService';
import { useAuth } from '@/contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { IconSymbol } from '@/components/IconSymbol';
import { videoServers } from '@/config/apiConfig';

const { width, height } = Dimensions.get('window');

export default function DetailsScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [details, setDetails] = useState<MovieDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showSeasonModal, setShowSeasonModal] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState<Season | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);

  const movieId = Number(params.id);
  const mediaType = (params.mediaType as 'movie' | 'tv') || 'movie';

  useEffect(() => {
    loadDetails();
    if (isAuthenticated) {
      checkFavoriteStatus();
    }
  }, [movieId, mediaType, isAuthenticated]);

  const loadDetails = async () => {
    try {
      setLoading(true);
      const data = await tmdbService.getMovieDetails(movieId, mediaType);
      setDetails(data);
    } catch (error) {
      console.error('Error loading details:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkFavoriteStatus = async () => {
    const status = await databaseService.isFavorite(movieId, mediaType);
    setIsFavorite(status);
  };

  const handleFavoriteToggle = async () => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (!details) return;

    if (isFavorite) {
      const { error } = await databaseService.removeFavorite(movieId, mediaType);
      if (!error) {
        setIsFavorite(false);
      }
    } else {
      const { error } = await databaseService.addFavorite(
        movieId,
        mediaType,
        details.title || details.name || 'Unknown',
        details.poster_path
      );
      if (!error) {
        setIsFavorite(true);
      }
    }
  };

  const handleSeasonSelect = async (season: Season) => {
    setSelectedSeason(season);
    setLoadingEpisodes(true);
    try {
      const data = await tmdbService.getSeasonDetails(movieId, season.season_number);
      setEpisodes(data.episodes || []);
    } catch (error) {
      console.error('Error loading episodes:', error);
      setEpisodes([]);
    } finally {
      setLoadingEpisodes(false);
    }
  };

  const handlePlayPress = (serverKey: string, season?: number, episode?: number) => {
    const server = videoServers[serverKey as keyof typeof videoServers];
    if (server.requiresSubscription) {
      console.log('VIP subscription required');
    }
    
    let streamUrl = '';
    if (mediaType === 'movie') {
      streamUrl = `${server.base}${server.moviePath}${movieId}`;
    } else {
      if (season && episode) {
        streamUrl = `${server.base}${server.tvPath}${movieId}/${season}/${episode}`;
      } else {
        streamUrl = `${server.base}${server.tvPath}${movieId}`;
      }
    }

    // Add to watch history
    if (isAuthenticated && details) {
      databaseService.addToWatchHistory(
        movieId,
        mediaType,
        details.title || details.name || 'Unknown',
        details.poster_path,
        season,
        episode
      );
    }
    
    router.push({
      pathname: '/(tabs)/(home)/player',
      params: {
        url: streamUrl,
        title: details?.title || details?.name || 'Unknown',
        serverName: server.name,
        season: season?.toString() || '',
        episode: episode?.toString() || '',
      },
    });
  };

  const handleEpisodePlay = (episode: Episode, serverKey: string) => {
    setShowSeasonModal(false);
    handlePlayPress(serverKey, selectedSeason?.season_number, episode.episode_number);
  };

  if (loading || !details) {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            headerShown: true,
            title: '',
            headerStyle: {
              backgroundColor: colors.background,
            },
            headerTintColor: colors.text,
            headerTransparent: true,
          }}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  const title = details.title || details.name || 'Unknown';
  const year = details.release_date || details.first_air_date;
  const yearText = year ? new Date(year).getFullYear() : '';
  const rating = details.vote_average ? details.vote_average.toFixed(1) : 'N/A';
  const runtime = details.runtime ? `${details.runtime} min` : '';
  const genres = details.genres?.map(g => g.name).join(', ') || '';

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: '',
          headerStyle: {
            backgroundColor: 'transparent',
          },
          headerTintColor: colors.text,
          headerTransparent: true,
          headerRight: () => (
            <TouchableOpacity onPress={handleFavoriteToggle} style={styles.favoriteButton}>
              <IconSymbol
                name={isFavorite ? 'heart.fill' : 'heart'}
                size={24}
                color={isFavorite ? colors.primary : colors.text}
              />
            </TouchableOpacity>
          ),
        }}
      />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          Platform.OS !== 'ios' && styles.scrollContentWithTabBar
        ]}
        showsVerticalScrollIndicator={false}
      >
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
        </View>

        <View style={styles.content}>
          <View style={styles.headerSection}>
            {details.poster_path && (
              <Image
                source={{ uri: tmdbService.getImageUrl(details.poster_path) }}
                style={styles.poster}
                resizeMode="cover"
              />
            )}
            <View style={styles.headerInfo}>
              <Text style={styles.title}>{title}</Text>
              <View style={styles.metaRow}>
                {yearText && <Text style={styles.metaText}>{yearText}</Text>}
                {yearText && runtime && <Text style={styles.metaDot}>•</Text>}
                {runtime && <Text style={styles.metaText}>{runtime}</Text>}
              </View>
              <View style={styles.ratingContainer}>
                <IconSymbol name="star.fill" size={20} color="#FFD700" />
                <Text style={styles.ratingText}>{rating}</Text>
                <Text style={styles.ratingOutOf}>/10</Text>
              </View>
            </View>
          </View>

          {genres && (
            <View style={styles.genresContainer}>
              {details.genres?.map(genre => (
                <View key={genre.id} style={styles.genreTag}>
                  <Text style={styles.genreText}>{genre.name}</Text>
                </View>
              ))}
            </View>
          )}

          {mediaType === 'tv' && details.seasons && details.seasons.length > 0 ? (
            <View style={styles.serversSection}>
              <Text style={styles.sectionTitle}>Select Season & Episode</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.seasonsScroll}>
                {details.seasons
                  .filter(season => season.season_number > 0)
                  .map(season => (
                    <TouchableOpacity
                      key={season.id}
                      style={styles.seasonCard}
                      onPress={() => {
                        handleSeasonSelect(season);
                        setShowSeasonModal(true);
                      }}
                      activeOpacity={0.7}
                    >
                      {season.poster_path ? (
                        <Image
                          source={{ uri: tmdbService.getImageUrl(season.poster_path) }}
                          style={styles.seasonPoster}
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={[styles.seasonPoster, styles.seasonPosterPlaceholder]}>
                          <IconSymbol name="tv" size={40} color={colors.textSecondary} />
                        </View>
                      )}
                      <Text style={styles.seasonName} numberOfLines={2}>
                        {season.name}
                      </Text>
                      <Text style={styles.seasonEpisodes}>
                        {season.episode_count} Episodes
                      </Text>
                    </TouchableOpacity>
                  ))}
              </ScrollView>
            </View>
          ) : (
            <View style={styles.serversSection}>
              <Text style={styles.sectionTitle}>Watch Now</Text>
              {Object.entries(videoServers).map(([key, server]) => (
                <TouchableOpacity
                  key={key}
                  style={styles.serverButton}
                  onPress={() => handlePlayPress(key)}
                  activeOpacity={0.7}
                >
                  <View style={styles.serverInfo}>
                    <IconSymbol name="play.circle.fill" size={24} color={colors.primary} />
                    <Text style={styles.serverName}>{server.name}</Text>
                    {server.requiresSubscription && (
                      <View style={styles.vipBadge}>
                        <Text style={styles.vipText}>VIP</Text>
                      </View>
                    )}
                  </View>
                  <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              ))}
            </View>
          )}

          {details.overview && (
            <View style={styles.overviewSection}>
              <Text style={styles.sectionTitle}>Overview</Text>
              <Text style={styles.overview}>{details.overview}</Text>
            </View>
          )}

          {details.credits?.cast && details.credits.cast.length > 0 && (
            <View style={styles.castSection}>
              <Text style={styles.sectionTitle}>Cast</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.castScroll}
              >
                {details.credits.cast.slice(0, 10).map(actor => (
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
                    <Text style={styles.castName} numberOfLines={2}>
                      {actor.name}
                    </Text>
                    <Text style={styles.castCharacter} numberOfLines={2}>
                      {actor.character}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Season/Episode Selection Modal */}
      <Modal
        visible={showSeasonModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowSeasonModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedSeason?.name || 'Select Episode'}
              </Text>
              <TouchableOpacity onPress={() => setShowSeasonModal(false)}>
                <IconSymbol name="xmark.circle.fill" size={28} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {loadingEpisodes ? (
              <View style={styles.modalLoading}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            ) : (
              <ScrollView style={styles.episodesList}>
                {episodes.map(episode => (
                  <View key={episode.id} style={styles.episodeCard}>
                    <View style={styles.episodeInfo}>
                      <Text style={styles.episodeNumber}>
                        Episode {episode.episode_number}
                      </Text>
                      <Text style={styles.episodeName} numberOfLines={2}>
                        {episode.name}
                      </Text>
                      {episode.overview && (
                        <Text style={styles.episodeOverview} numberOfLines={3}>
                          {episode.overview}
                        </Text>
                      )}
                    </View>
                    <View style={styles.episodeServers}>
                      {Object.entries(videoServers).map(([key, server]) => (
                        <TouchableOpacity
                          key={key}
                          style={styles.episodeServerButton}
                          onPress={() => handleEpisodePlay(episode, key)}
                        >
                          <IconSymbol name="play.circle.fill" size={20} color={colors.primary} />
                          <Text style={styles.episodeServerText}>{server.name}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                ))}
              </ScrollView>
            )}
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
  favoriteButton: {
    marginRight: 16,
    padding: 8,
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
  backdropContainer: {
    width: width,
    height: height * 0.4,
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
    height: '50%',
  },
  content: {
    paddingHorizontal: 20,
    marginTop: -60,
  },
  headerSection: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 16,
  },
  poster: {
    width: 120,
    height: 180,
    borderRadius: 12,
    backgroundColor: colors.card,
  },
  headerInfo: {
    flex: 1,
    justifyContent: 'flex-end',
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
    marginBottom: 8,
    gap: 8,
  },
  metaText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  metaDot: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ratingText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  ratingOutOf: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  genresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  genreTag: {
    backgroundColor: colors.card,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  genreText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
  serversSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  seasonsScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  seasonCard: {
    width: 120,
    marginRight: 12,
  },
  seasonPoster: {
    width: 120,
    height: 180,
    borderRadius: 12,
    backgroundColor: colors.card,
    marginBottom: 8,
  },
  seasonPosterPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  seasonName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  seasonEpisodes: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  serverButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  serverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  serverName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  vipBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  vipText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.background,
  },
  overviewSection: {
    marginBottom: 24,
  },
  overview: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
  },
  castSection: {
    marginBottom: 24,
  },
  castScroll: {
    gap: 12,
  },
  castItem: {
    width: 100,
  },
  castImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.card,
    marginBottom: 8,
  },
  castImagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  castName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  castCharacter: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: height * 0.8,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.accent,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  modalLoading: {
    padding: 40,
    alignItems: 'center',
  },
  episodesList: {
    flex: 1,
  },
  episodeCard: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.accent,
  },
  episodeInfo: {
    marginBottom: 12,
  },
  episodeNumber: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  episodeName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
  },
  episodeOverview: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  episodeServers: {
    flexDirection: 'row',
    gap: 8,
  },
  episodeServerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  episodeServerText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
});
