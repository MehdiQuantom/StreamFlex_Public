
import { supabase, Favorite, WatchHistory } from '@/config/supabaseConfig';

class DatabaseService {
  // Favorites
  async addFavorite(
    movieId: number,
    mediaType: 'movie' | 'tv',
    title: string,
    posterPath: string
  ): Promise<{ error: any }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { error: { message: 'User not authenticated' } };
      }

      const { error } = await supabase
        .from('favorites')
        .insert({
          user_id: user.id,
          movie_id: movieId,
          media_type: mediaType,
          title,
          poster_path: posterPath,
        });

      if (error) {
        console.error('Add favorite error:', error);
        return { error };
      }

      console.log('Favorite added successfully');
      return { error: null };
    } catch (error) {
      console.error('Add favorite exception:', error);
      return { error };
    }
  }

  async removeFavorite(movieId: number, mediaType: 'movie' | 'tv'): Promise<{ error: any }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { error: { message: 'User not authenticated' } };
      }

      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('movie_id', movieId)
        .eq('media_type', mediaType);

      if (error) {
        console.error('Remove favorite error:', error);
        return { error };
      }

      console.log('Favorite removed successfully');
      return { error: null };
    } catch (error) {
      console.error('Remove favorite exception:', error);
      return { error };
    }
  }

  async getFavorites(): Promise<{ data: Favorite[] | null; error: any }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { data: null, error: { message: 'User not authenticated' } };
      }

      const { data, error } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Get favorites error:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Get favorites exception:', error);
      return { data: null, error };
    }
  }

  async isFavorite(movieId: number, mediaType: 'movie' | 'tv'): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return false;
      }

      const { data, error } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('movie_id', movieId)
        .eq('media_type', mediaType)
        .single();

      return !!data && !error;
    } catch (error) {
      console.error('Check favorite exception:', error);
      return false;
    }
  }

  // Watch History
  async addToWatchHistory(
    movieId: number,
    mediaType: 'movie' | 'tv',
    title: string,
    posterPath: string,
    season?: number,
    episode?: number,
    progress: number = 0
  ): Promise<{ error: any }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { error: { message: 'User not authenticated' } };
      }

      // Check if entry exists
      const { data: existing } = await supabase
        .from('watch_history')
        .select('id')
        .eq('user_id', user.id)
        .eq('movie_id', movieId)
        .eq('media_type', mediaType)
        .single();

      if (existing) {
        // Update existing entry
        const { error } = await supabase
          .from('watch_history')
          .update({
            season,
            episode,
            progress,
            last_watched: new Date().toISOString(),
          })
          .eq('id', existing.id);

        if (error) {
          console.error('Update watch history error:', error);
          return { error };
        }
      } else {
        // Insert new entry
        const { error } = await supabase
          .from('watch_history')
          .insert({
            user_id: user.id,
            movie_id: movieId,
            media_type: mediaType,
            title,
            poster_path: posterPath,
            season,
            episode,
            progress,
            last_watched: new Date().toISOString(),
          });

        if (error) {
          console.error('Add watch history error:', error);
          return { error };
        }
      }

      console.log('Watch history updated successfully');
      return { error: null };
    } catch (error) {
      console.error('Add watch history exception:', error);
      return { error };
    }
  }

  async getWatchHistory(): Promise<{ data: WatchHistory[] | null; error: any }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { data: null, error: { message: 'User not authenticated' } };
      }

      const { data, error } = await supabase
        .from('watch_history')
        .select('*')
        .eq('user_id', user.id)
        .order('last_watched', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Get watch history error:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Get watch history exception:', error);
      return { data: null, error };
    }
  }

  async removeFromWatchHistory(movieId: number, mediaType: 'movie' | 'tv'): Promise<{ error: any }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { error: { message: 'User not authenticated' } };
      }

      const { error } = await supabase
        .from('watch_history')
        .delete()
        .eq('user_id', user.id)
        .eq('movie_id', movieId)
        .eq('media_type', mediaType);

      if (error) {
        console.error('Remove watch history error:', error);
        return { error };
      }

      console.log('Watch history removed successfully');
      return { error: null };
    } catch (error) {
      console.error('Remove watch history exception:', error);
      return { error };
    }
  }
}

export const databaseService = new DatabaseService();
