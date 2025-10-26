
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Linking,
} from 'react-native';
import { Stack } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { LinearGradient } from 'expo-linear-gradient';

export default function AboutScreen() {
  const handleTelegramPress = () => {
    Linking.openURL('https://t.me/Mehdi_Quantom');
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>About</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          Platform.OS !== 'ios' && styles.scrollContentWithTabBar
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroSection}>
          <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            style={styles.heroGradient}
          >
            <IconSymbol name="film" size={80} color={colors.text} />
            <Text style={styles.appName}>StreamFlix</Text>
            <Text style={styles.appVersion}>Version 1.0.0</Text>
          </LinearGradient>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About the App</Text>
          <Text style={styles.sectionText}>
            StreamFlix is a modern streaming application that brings you the latest movies and TV shows. 
            Discover trending content, search for your favorites, and enjoy seamless streaming experience.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Features</Text>
          <View style={styles.featureItem}>
            <IconSymbol name="star.fill" size={20} color={colors.primary} />
            <Text style={styles.featureText}>Browse trending movies and TV shows</Text>
          </View>
          <View style={styles.featureItem}>
            <IconSymbol name="magnifyingglass" size={20} color={colors.primary} />
            <Text style={styles.featureText}>Search for your favorite content</Text>
          </View>
          <View style={styles.featureItem}>
            <IconSymbol name="heart.fill" size={20} color={colors.primary} />
            <Text style={styles.featureText}>Save favorites and track watch history</Text>
          </View>
          <View style={styles.featureItem}>
            <IconSymbol name="play.fill" size={20} color={colors.primary} />
            <Text style={styles.featureText}>Multiple streaming servers</Text>
          </View>
          <View style={styles.featureItem}>
            <IconSymbol name="tv.fill" size={20} color={colors.primary} />
            <Text style={styles.featureText}>Season and episode selection for TV shows</Text>
          </View>
        </View>

        <View style={styles.developerSection}>
          <View style={styles.developerCard}>
            <View style={styles.developerHeader}>
              <IconSymbol name="person.circle.fill" size={60} color={colors.primary} />
              <View style={styles.developerInfo}>
                <Text style={styles.developerLabel}>Developed By</Text>
                <Text style={styles.developerName}>Mehdi Quantom🐦‍🔥</Text>
              </View>
            </View>
            
            <TouchableOpacity
              style={styles.telegramButton}
              onPress={handleTelegramPress}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#0088cc', '#006699']}
                style={styles.telegramGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <IconSymbol name="paperplane.fill" size={20} color="#fff" />
                <Text style={styles.telegramButtonText}>Telegram</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Sources</Text>
          <Text style={styles.sectionText}>
            Movie and TV show information is provided by The Movie Database (TMDB). 
            This product uses the TMDB API but is not endorsed or certified by TMDB.
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Made with ❤️ by Mehdi Quantom
          </Text>
          <Text style={styles.footerSubtext}>
            © 2025 StreamFlex. All rights reserved.
          </Text>
        </View>
      </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  scrollContentWithTabBar: {
    paddingBottom: 100,
  },
  heroSection: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
  },
  heroGradient: {
    padding: 40,
    alignItems: 'center',
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 16,
  },
  appVersion: {
    fontSize: 16,
    color: colors.text,
    opacity: 0.8,
    marginTop: 8,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  sectionText: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  featureText: {
    fontSize: 15,
    color: colors.text,
    flex: 1,
  },
  developerSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  developerCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
  },
  developerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
  },
  developerInfo: {
    flex: 1,
  },
  developerLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  developerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  telegramButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  telegramGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  telegramButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});
