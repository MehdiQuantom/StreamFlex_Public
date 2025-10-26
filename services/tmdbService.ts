
import { tmdbConfig } from '@/config/apiConfig';

export interface Movie {
  id: number;
  title: string;
  name?: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  media_type?: 'movie' | 'tv';
  genre_ids?: number[];
}

export interface Season {
  id: number;
  name: string;
  season_number: number;
  episode_count: number;
  air_date: string;
  overview: string;
  poster_path: string;
}

export interface Episode {
  id: number;
  name: string;
  episode_number: number;
  season_number: number;
  air_date: string;
  overview: string;
  still_path: string;
  runtime: number;
}

export interface MovieDetails extends Movie {
  runtime?: number;
  genres?: { id: number; name: string }[];
  credits?: {
    cast: Array<{
      id: number;
      name: string;
      character: string;
      profile_path: string;
    }>;
  };
  number_of_seasons?: number;
  number_of_episodes?: number;
  seasons?: Season[];
}

export interface SearchResult {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}

class TMDBService {
  private async fetchFromTMDB(endpoint: string): Promise<any> {
    try {
      const url = `${tmdbConfig.baseUrl}${endpoint}${endpoint.includes('?') ? '&' : '?'}api_key=${tmdbConfig.apiKey}`;
      console.log('Fetching from TMDB:', url);
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`TMDB API error: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('TMDB fetch error:', error);
      throw error;
    }
  }

  async getTrending(mediaType: 'movie' | 'tv' | 'all' = 'all', timeWindow: 'day' | 'week' = 'week'): Promise<Movie[]> {
    const data = await this.fetchFromTMDB(`/trending/${mediaType}/${timeWindow}`);
    return data.results || [];
  }

  async searchMovies(query: string, page: number = 1): Promise<SearchResult> {
    const data = await this.fetchFromTMDB(`/search/multi?query=${encodeURIComponent(query)}&page=${page}`);
    return data;
  }

  async getMovieDetails(movieId: number, mediaType: 'movie' | 'tv' = 'movie'): Promise<MovieDetails> {
    const endpoint = mediaType === 'movie' ? `/movie/${movieId}` : `/tv/${movieId}`;
    const data = await this.fetchFromTMDB(`${endpoint}?append_to_response=credits`);
    return data;
  }

  async getSeasonDetails(tvId: number, seasonNumber: number): Promise<{ episodes: Episode[] }> {
    const data = await this.fetchFromTMDB(`/tv/${tvId}/season/${seasonNumber}`);
    return data;
  }

  async getPopular(mediaType: 'movie' | 'tv' = 'movie', page: number = 1): Promise<Movie[]> {
    const endpoint = mediaType === 'movie' ? '/movie/popular' : '/tv/popular';
    const data = await this.fetchFromTMDB(`${endpoint}?page=${page}`);
    return data.results || [];
  }

  async getTopRated(mediaType: 'movie' | 'tv' = 'movie', page: number = 1): Promise<Movie[]> {
    const endpoint = mediaType === 'movie' ? '/movie/top_rated' : '/tv/top_rated';
    const data = await this.fetchFromTMDB(`${endpoint}?page=${page}`);
    return data.results || [];
  }

  getImageUrl(path: string, size: 'small' | 'large' = 'small'): string {
    if (!path) return '';
    const base = size === 'large' ? tmdbConfig.imageBaseLarge : tmdbConfig.imageBase;
    return `${base}${path}`;
  }
}

export const tmdbService = new TMDBService();
