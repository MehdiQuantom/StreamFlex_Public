
export const videoServers = {
  server1: {
    base: 'https://moviesapi.club',
    moviePath: '/movie/',
    tvPath: '/tv/',
    seriesSupported: false,
    name: 'Server 1'
  },
  server2: {
    base: 'https://vidsrc.icu/embed',
    moviePath: '/movie/',
    tvPath: '/tv/',
    seriesSupported: false,
    name: 'Server 2'
  },
  vipServer: {
    base: 'https://vip.streamflex.com',
    moviePath: '/movie/',
    tvPath: '/tv/',
    requiresSubscription: true,
    seriesSupported: true,
    // New metadata flags for VIP Server capabilities
    supportsDolbyAtmos: true,
    supportsDolbyVision: true,
    audioFormats: ['Dolby Atmos', 'AC3', 'AAC'],
    name: 'VIP Server'
  }
};

export const tmdbConfig = {
  apiKey: '3e52e2f5350ae60de5e2fc58e818d2a0',
  baseUrl: 'https://api.themoviedb.org/3',
  imageBase: 'https://image.tmdb.org/t/p/w500',
  imageBaseLarge: 'https://image.tmdb.org/t/p/original'
};
