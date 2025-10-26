
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useAuth } from '@/contexts/AuthContext';
import { databaseService } from '@/services/databaseService';
import { tmdbService } from '@/services/tmdbService';
import { Favorite, WatchHistory } from '@/config/supabaseConfig';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, isAuthenticated, signOut } = useAuth();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [watchHistory, setWatchHistory] = useState<WatchHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'favorites' | 'history'>('favorites');

  useEffect(() => {
    if (isAuthenticated) {
      loadUserData();
    }
  }, [isAuthenticated, activeTab]);

  const loadUserData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'favorites') {
        const { data } = await databaseService.getFavorites();
        setFavorites(data || []);
      } else {
        const { data } = await databaseService.getWatchHistory();
        setWatchHistory(data || []);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.replace('/(tabs)/(home)');
  };

  const handleItemPress = (movieId: number, mediaType: 'movie' | 'tv') => {
    router.push({
      pathname: '/(tabs)/(home)/details',
      params: { id: movieId, mediaType },
    });
  };

  const handleRemoveFavorite = async (movieId: number, mediaType: 'movie' | 'tv') => {
    await databaseService.removeFavorite(movieId, mediaType);
    loadUserData();
  };

  const handleRemoveHistory = async (movieId: number, mediaType: 'movie' | 'tv') => {
    await databaseService.removeFromWatchHistory(movieId, mediaType);
    loadUserData();
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            headerShown: true,
            title: 'Profile',
            headerStyle: {
              backgroundColor: colors.background,
            },
            headerTintColor: colors.text,
            headerShadowVisible: false,
          }}
        />
        <View style={styles.notAuthContainer}>
          <IconSymbol name="person.circle" size={80} color={colors.textSecondary} />
          <Text style={styles.notAuthTitle}>Sign in to access your profile</Text>
          <Text style={styles.notAuthText}>
            Save your favorites, track watch history, and more
          </Text>
          <TouchableOpacity
            style={styles.signInButton}
            onPress={() => router.push('/auth/login')}
          >
            <Text style={styles.signInButtonText}>Sign In</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.signUpButton}
            onPress={() => router.push('/auth/signup')}
          >
            <Text style={styles.signUpButtonText}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Profile',
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
          headerShadowVisible: false,
        }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          Platform.OS !== 'ios' && styles.scrollContentWithTabBar
        ]}
      >
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <IconSymbol name="person.circle.fill" size={80} color={colors.primary} />
          </View>
          <Text style={styles.emailText}>{user?.email}</Text>
          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <IconSymbol name="arrow.right.square" size={20} color={colors.text} />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'favorites' && styles.tabActive]}
            onPress={() => setActiveTab('favorites')}
          >
            <IconSymbol
              name="heart.fill"
              size={20}
              color={activeTab === 'favorites' ? colors.primary : colors.textSecondary}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === 'favorites' && styles.tabTextActive,
              ]}
            >
              Favorites
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'history' && styles.tabActive]}
            onPress={() => setActiveTab('history')}
          >
            <IconSymbol
              name="clock.fill"
              size={20}
              color={activeTab === 'history' ? colors.primary : colors.textSecondary}
            />
            <Text
              style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}
            >
              Watch History
            </Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <View style={styles.contentContainer}>
            {activeTab === 'favorites' ? (
              favorites.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <IconSymbol name="heart" size={60} color={colors.textSecondary} />
                  <Text style={styles.emptyText}>No favorites yet</Text>
                  <Text style={styles.emptySubtext}>
                    Start adding movies and series to your favorites
                  </Text>
                </View>
              ) : (
                <View style={styles.gridContainer}>
                  {favorites.map(item => (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.gridItem}
                      onPress={() => handleItemPress(item.movie_id, item.media_type)}
                      activeOpacity={0.7}
                    >
                      {item.poster_path ? (
                        <Image
                          source={{ uri: tmdbService.getImageUrl(item.poster_path) }}
                          style={styles.gridPoster}
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={[styles.gridPoster, styles.gridPosterPlaceholder]}>
                          <IconSymbol name="film" size={40} color={colors.textSecondary} />
                        </View>
                      )}
                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => handleRemoveFavorite(item.movie_id, item.media_type)}
                      >
                        <IconSymbol name="xmark.circle.fill" size={24} color={colors.primary} />
                      </TouchableOpacity>
                      <Text style={styles.gridTitle} numberOfLines={2}>
                        {item.title}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )
            ) : watchHistory.length === 0 ? (
              <View style={styles.emptyContainer}>
                <IconSymbol name="clock" size={60} color={colors.textSecondary} />
                <Text style={styles.emptyText}>No watch history</Text>
                <Text style={styles.emptySubtext}>
                  Your recently watched content will appear here
                </Text>
              </View>
            ) : (
              <View style={styles.listContainer}>
                {watchHistory.map(item => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.listItem}
                    onPress={() => handleItemPress(item.movie_id, item.media_type)}
                    activeOpacity={0.7}
                  >
                    {item.poster_path ? (
                      <Image
                        source={{ uri: tmdbService.getImageUrl(item.poster_path) }}
                        style={styles.listPoster}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={[styles.listPoster, styles.listPosterPlaceholder]}>
                        <IconSymbol name="film" size={30} color={colors.textSecondary} />
                      </View>
                    )}
                    <View style={styles.listInfo}>
                      <Text style={styles.listTitle} numberOfLines={2}>
                        {item.title}
                      </Text>
                      {item.season && item.episode && (
                        <Text style={styles.listEpisode}>
                          S{item.season} E{item.episode}
                        </Text>
                      )}
                      <Text style={styles.listDate}>
                        {new Date(item.last_watched).toLocaleDateString()}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.listRemoveButton}
                      onPress={() => handleRemoveHistory(item.movie_id, item.media_type)}
                    >
                      <IconSymbol name="trash" size={20} color={colors.textSecondary} />
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
              </View>
            )}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  scrollContentWithTabBar: {
    paddingBottom: 100,
  },
  notAuthContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  notAuthTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  notAuthText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  signInButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 48,
    paddingVertical: 14,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  signInButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
  signUpButton: {
    backgroundColor: colors.card,
    paddingHorizontal: 48,
    paddingVertical: 14,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  signUpButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.accent,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  emailText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  signOutText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  tabActive: {
    backgroundColor: colors.accent,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.primary,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  contentContainer: {
    paddingHorizontal: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridItem: {
    width: '31%',
    marginBottom: 16,
  },
  gridPoster: {
    width: '100%',
    aspectRatio: 2 / 3,
    borderRadius: 12,
    backgroundColor: colors.card,
    marginBottom: 8,
  },
  gridPosterPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 12,
  },
  gridTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  listContainer: {
    gap: 12,
  },
  listItem: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    gap: 12,
  },
  listPoster: {
    width: 80,
    height: 120,
    borderRadius: 8,
    backgroundColor: colors.accent,
  },
  listPosterPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  listInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
  },
  listEpisode: {
    fontSize: 14,
    color: colors.primary,
    marginBottom: 4,
  },
  listDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  listRemoveButton: {
    justifyContent: 'center',
    padding: 8,
  },
});
