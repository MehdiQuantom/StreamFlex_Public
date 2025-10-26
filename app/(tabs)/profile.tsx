
import { IconSymbol } from '@/components/IconSymbol';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { Favorite, WatchHistory } from '@/config/supabaseConfig';
import { Stack, useRouter } from 'expo-router';
import { databaseService } from '@/services/databaseService';
import { colors } from '@/styles/commonStyles';
import React, { useEffect, useState } from 'react';
import { tmdbService } from '@/services/tmdbService';

export default function ProfileScreen() {
  const { user, signOut, isAuthenticated } = useAuth();
  const router = useRouter();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [watchHistory, setWatchHistory] = useState<WatchHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'favorites' | 'history'>('favorites');

  useEffect(() => {
    if (isAuthenticated) {
      loadUserData();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, activeTab]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'favorites') {
        const { data, error } = await databaseService.getFavorites();
        if (error) {
          console.error('Error loading favorites:', error);
          Alert.alert('Error', 'Failed to load favorites');
        } else {
          setFavorites(data || []);
        }
      } else {
        const { data, error } = await databaseService.getWatchHistory();
        if (error) {
          console.error('Error loading watch history:', error);
          Alert.alert('Error', 'Failed to load watch history');
        } else {
          setWatchHistory(data || []);
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      Alert.alert('Error', 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/auth/login');
          },
        },
      ]
    );
  };

  const handleItemPress = (movieId: number, mediaType: 'movie' | 'tv') => {
    router.push({
      pathname: '/(tabs)/(home)/details',
      params: { id: movieId, mediaType },
    });
  };

  const handleRemoveFavorite = async (movieId: number, mediaType: 'movie' | 'tv') => {
    Alert.alert(
      'Remove Favorite',
      'Are you sure you want to remove this from favorites?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            const { error } = await databaseService.removeFavorite(movieId, mediaType);
            if (error) {
              Alert.alert('Error', 'Failed to remove favorite');
            } else {
              setFavorites(favorites.filter(f => !(f.movie_id === movieId && f.media_type === mediaType)));
              Alert.alert('Success', 'Removed from favorites');
            }
          },
        },
      ]
    );
  };

  const handleRemoveHistory = async (movieId: number, mediaType: 'movie' | 'tv') => {
    Alert.alert(
      'Remove from History',
      'Are you sure you want to remove this from watch history?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            const { error } = await databaseService.removeFromWatchHistory(movieId, mediaType);
            if (error) {
              Alert.alert('Error', 'Failed to remove from history');
            } else {
              setWatchHistory(watchHistory.filter(h => !(h.movie_id === movieId && h.media_type === mediaType)));
              Alert.alert('Success', 'Removed from watch history');
            }
          },
        },
      ]
    );
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>
        <View style={styles.notAuthContainer}>
          <IconSymbol name="person.circle" size={80} color={colors.textSecondary} />
          <Text style={styles.notAuthTitle}>Not Logged In</Text>
          <Text style={styles.notAuthText}>
            Sign in to access your favorites and watch history
          </Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.push('/auth/login')}
          >
            <Text style={styles.loginButtonText}>Sign In</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.signupButton}
            onPress={() => router.push('/auth/signup')}
          >
            <Text style={styles.signupButtonText}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton}>
          <IconSymbol name="rectangle.portrait.and.arrow.right" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.userInfo}>
        <View style={styles.avatarContainer}>
          <IconSymbol name="person.circle.fill" size={60} color={colors.primary} />
        </View>
        <Text style={styles.userEmail}>{user?.email}</Text>
      </View>

      <View style={styles.tabContainer}>
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
            style={[
              styles.tabText,
              activeTab === 'history' && styles.tabTextActive,
            ]}
          >
            Watch History
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            Platform.OS !== 'ios' && styles.scrollContentWithTabBar
          ]}
          showsVerticalScrollIndicator={false}
        >
          {activeTab === 'favorites' ? (
            favorites.length > 0 ? (
              <View style={styles.grid}>
                {favorites.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.gridItem}
                    onPress={() => handleItemPress(item.movie_id, item.media_type)}
                    onLongPress={() => handleRemoveFavorite(item.movie_id, item.media_type)}
                  >
                    {item.poster_path ? (
                      <Image
                        source={{ uri: tmdbService.getImageUrl(item.poster_path) }}
                        style={styles.gridImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={[styles.gridImage, styles.gridImagePlaceholder]}>
                        <IconSymbol name="film" size={40} color={colors.textSecondary} />
                      </View>
                    )}
                    <Text style={styles.gridTitle} numberOfLines={2}>
                      {item.title}
                    </Text>
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => handleRemoveFavorite(item.movie_id, item.media_type)}
                    >
                      <IconSymbol name="xmark.circle.fill" size={24} color={colors.primary} />
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <IconSymbol name="heart" size={60} color={colors.textSecondary} />
                <Text style={styles.emptyText}>No favorites yet</Text>
                <Text style={styles.emptySubtext}>
                  Add movies and TV shows to your favorites
                </Text>
              </View>
            )
          ) : (
            watchHistory.length > 0 ? (
              <View style={styles.historyList}>
                {watchHistory.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.historyItem}
                    onPress={() => handleItemPress(item.movie_id, item.media_type)}
                  >
                    {item.poster_path ? (
                      <Image
                        source={{ uri: tmdbService.getImageUrl(item.poster_path) }}
                        style={styles.historyImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={[styles.historyImage, styles.historyImagePlaceholder]}>
                        <IconSymbol name="film" size={30} color={colors.textSecondary} />
                      </View>
                    )}
                    <View style={styles.historyInfo}>
                      <Text style={styles.historyTitle} numberOfLines={1}>
                        {item.title}
                      </Text>
                      {item.season && item.episode && (
                        <Text style={styles.historyEpisode}>
                          S{item.season} E{item.episode}
                        </Text>
                      )}
                      <Text style={styles.historyDate}>
                        {new Date(item.last_watched).toLocaleDateString()}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.historyRemoveButton}
                      onPress={() => handleRemoveHistory(item.movie_id, item.media_type)}
                    >
                      <IconSymbol name="xmark.circle.fill" size={24} color={colors.textSecondary} />
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <IconSymbol name="clock" size={60} color={colors.textSecondary} />
                <Text style={styles.emptyText}>No watch history</Text>
                <Text style={styles.emptySubtext}>
                  Your watched content will appear here
                </Text>
              </View>
            )
          )}
        </ScrollView>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
  },
  signOutButton: {
    padding: 8,
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
    marginTop: 16,
  },
  notAuthText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 32,
  },
  loginButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 12,
    width: '100%',
    marginBottom: 12,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.background,
    textAlign: 'center',
  },
  signupButton: {
    backgroundColor: colors.card,
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 12,
    width: '100%',
  },
  signupButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
  },
  userInfo: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  avatarContainer: {
    marginBottom: 12,
  },
  userEmail: {
    fontSize: 16,
    color: colors.text,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
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
    backgroundColor: colors.card,
    borderWidth: 2,
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: colors.text,
    fontSize: 16,
    marginTop: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  scrollContentWithTabBar: {
    paddingBottom: 100,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridItem: {
    width: '31%',
    marginBottom: 12,
  },
  gridImage: {
    width: '100%',
    aspectRatio: 2 / 3,
    borderRadius: 8,
    backgroundColor: colors.card,
  },
  gridImagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridTitle: {
    fontSize: 13,
    color: colors.text,
    marginTop: 8,
    lineHeight: 16,
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  historyList: {
    gap: 12,
  },
  historyItem: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  historyImage: {
    width: 80,
    height: 120,
    borderRadius: 8,
    backgroundColor: colors.background,
  },
  historyImagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyInfo: {
    flex: 1,
    marginLeft: 12,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  historyEpisode: {
    fontSize: 14,
    color: colors.primary,
    marginBottom: 4,
  },
  historyDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  historyRemoveButton: {
    padding: 8,
  },
});
