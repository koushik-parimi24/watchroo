import { useParams, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import MovieDetailsSkeleton from '@/components/animations/MovieDetailsSkeleton';
import SimilarMovies from '@/components/SimilarMovies';
import { useRecentlyWatched } from '@/context/RecentlyWatchedContext';
import Loader from '@/components/animations/Loader';
// -------------------- API CONFIG --------------------
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const API_URL_BASE = 'https://api.themoviedb.org/3';
const API_OPTIONS = {
  method: 'GET',
  headers: {
    Authorization: `Bearer ${API_KEY}`,
    'Content-Type': 'application/json',
  },
};

function MovieDetails() {
  const { id } = useParams();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  /* -------------------- STATE -------------------- */
  const [item, setItem] = useState(null);
  const [error, setError] = useState('');
  const [showTrailer, setShowTrailer] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);
  const [selectedServer, setSelectedServer] = useState('server1');
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [seasonData, setSeasonData] = useState(null);
  const [loadingSeason, setLoadingSeason] = useState(false);
  const [showLoader, setShowLoader] = useState(true);
  const [isLoadingDetails, setIsLoadingDetails] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { addToRecentlyWatched } = useRecentlyWatched();
  /* -------------------- DERIVED -------------------- */
  const isTV = location.pathname.startsWith('/tv');
  const type = isTV ? 'tv' : 'movie';

useEffect(() => {
  // Show loader for at least 1 second, then hide when data is loaded
  if (dataLoaded && item && !isLoadingDetails) {
    const timer = setTimeout(() => {
      setShowLoader(false);
    }, 1000); // 1 second minimum

    return () => clearTimeout(timer);
  }
}, [item, isLoadingDetails, dataLoaded]);

  const handleBack = () => {
    navigate(-1);
  };

  // Handle search from movie details page
  const handleSearch = () => {
    if (searchTerm.trim()) {
      navigate(`/?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  // Add to recently watched when user clicks Watch Now
  const handleWatchNow = () => {
    setShowPlayer(!showPlayer);
    
    if (!showPlayer && item) { // Only add when opening player
      const watchedItem = {
        id: item.id,
        title: item.title || item.name,
        poster_path: item.poster_path,
        backdrop_path: item.backdrop_path,
        media_type: type,
        season: isTV ? selectedSeason : null,
        episode: isTV ? selectedEpisode : null,
        overview: item.overview,
        vote_average: item.vote_average,
        release_date: item.release_date || item.first_air_date
      };
      
      addToRecentlyWatched(watchedItem);
    }
  };

  /* -------------------- FETCH ITEM DETAILS -------------------- */
  useEffect(() => {
    const fetchDetails = async () => {
      setIsLoadingDetails(true);
      try {
        const res = await fetch(
          `${API_URL_BASE}/${type}/${id}?append_to_response=videos,credits,external_ids`,
          API_OPTIONS
        );
        if (!res.ok) throw new Error('Failed to fetch details');
        const data = await res.json();
        setItem(data);
        if (isTV && data?.seasons?.length) {
          const firstRealSeason =
            data.seasons.find((s) => s.season_number > 0) ?? { season_number: 1 };
          setSelectedSeason(firstRealSeason.season_number);
          setSelectedEpisode(1);
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load details. Please try again later.');
      } finally {
        setIsLoadingDetails(false);
        setDataLoaded(true);
      }
    };
    fetchDetails();
  }, [id, type, isTV]);

  /* -------------------- FETCH SEASON DATA WHEN NEEDED -------------------- */
  useEffect(() => {
    if (!isTV || !item) return;
    const fetchSeasonData = async () => {
      setLoadingSeason(true);
      try {
        const res = await fetch(
          `${API_URL_BASE}/tv/${id}/season/${selectedSeason}`,
          API_OPTIONS
        );
        if (!res.ok) throw new Error('Failed to fetch season data');
        const data = await res.json();
        setSeasonData(data);
        setSelectedEpisode(1);
      } catch (err) {
        console.error('Failed to load season data:', err);
        setSeasonData(null);
      } finally {
        setLoadingSeason(false);
      }
    };
    fetchSeasonData();
  }, [id, isTV, item, selectedSeason]);
    const handleVideoProgress = (currentTime, duration) => {
    if (duration > 0) {
      const progress = (currentTime / duration) * 100;
      
      const watchingItem = {
        id: item.id,
        title: item.title || item.name,
        poster_path: item.poster_path,
        backdrop_path: item.backdrop_path,
        media_type: type,
        season: isTV ? selectedSeason : null,
        episode: isTV ? selectedEpisode : null
      };
      
      // Add to continue watching when progress is between 5% and 95%
      if (progress >= 5 && progress <= 95) {
        addToWatching(watchingItem, progress, currentTime, duration);
      }
    }
  };

  /* -------------------- STREAMING SERVERS -------------------- */
  const streamingServers = {
    server1: {
      name: 'VidLink',
      url: (tmdbId, mediaType, season, episode) =>
        mediaType === 'tv'
          ? `https://vidlink.pro/tv/${tmdbId}/${season}/${episode}`
          : `https://vidlink.pro/movie/${tmdbId}`,
      quality: 'HD',
      ads: 'Few',
    },
    server2: {
      name: 'VidSrc',
      url: (tmdbId, mediaType, season, episode) =>
        mediaType === 'tv'
          ? `https://vidsrc.me/embed/tv?tmdb=${tmdbId}&season=${season}&episode=${episode}`
          : `https://vidsrc.me/embed/${mediaType}/${tmdbId}`,
      quality: 'HD+',
      ads: 'Few',
    },
    server3: {
      name: '2Embed',
      url: (tmdbId, mediaType, season, episode) =>
        mediaType === 'tv'
          ? `https://www.2embed.cc/embedtv/${tmdbId}/${season}/${episode}`
          : `https://www.2embed.cc/embed/${mediaType}/${tmdbId}`,
      quality: 'HD',
      ads: 'Minimal',
    },
  };

  const getCurrentStreamUrl = () => {
    const server = streamingServers[selectedServer];
    if (!server) {
      console.warn(`Unknown server key "${selectedServer}" – falling back to server1`);
      return streamingServers.server1.url(id, type, selectedSeason, selectedEpisode);
    }
    try {
      return server.url(id, type, selectedSeason, selectedEpisode);
    } catch (err) {
      console.error('URL builder crashed, falling back to server1', err);
      return streamingServers.server1.url(id, type, selectedSeason, selectedEpisode);
    }
  };

  /* -------------------- EARLY RETURNS -------------------- */
  if (error) return <div className="text-red-400 p-4 text-center">{error}</div>;
  if (!item) return <MovieDetailsSkeleton />;

  /* -------------------- BASIC DERIVED DATA -------------------- */
  const title = item.title || item.name;
  const date = item.release_date || item.first_air_date;
  const poster = item.poster_path
    ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
    : '/placeholder.png';
  const backdrop = item.backdrop_path
    ? `https://image.tmdb.org/t/p/original${item.backdrop_path}`
    : null;
  const trailer =
    item.videos?.results?.find(
      (v) => v.type === 'Trailer' && v.site === 'YouTube'
    ) || item.videos?.results?.find((v) => v.site === 'YouTube');

// loader?
  if (showLoader) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
        <Navbar 
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onSearch={handleSearch}
          onLogoClick={() => {
            setSearchTerm('');
            navigate('/');
          }}
        />
        {/* Floating Back Button */}
        <button
          onClick={handleBack}
          className="fixed top-20 sm:top-24 left-4 sm:left-6 z-50 w-12 h-12 sm:w-14 sm:h-14 bg-black/50 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-black/70 hover:border-white/40 transition-all duration-300 shadow-lg hover:shadow-xl touch-manipulation"
        >
          <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        {/* Movie Details Background (blurred) */}
        <div className="relative pt-20 sm:pt-24 md:pt-28">
          {backdrop && (
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat blur-sm"
              style={{ backgroundImage: `url(${backdrop})` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black/50" />
            </div>
          )}
          
          <div className="relative z-10 content-padding py-8 sm:py-12 md:py-16 lg:py-20">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col md:flex-row gap-6 sm:gap-8 items-start">
                {/* Poster */}
                <div className="flex-shrink-0 mx-auto md:mx-0">
                  <img
                    src={poster}
                    alt={title}
                    className="w-48 h-72 sm:w-56 sm:h-84 md:w-64 md:h-96 object-cover rounded-2xl shadow-2xl border border-white/10 blur-sm"
                  />
                </div>
                
                {/* Info */}
                <div className="flex-1 space-y-4 sm:space-y-6 text-center md:text-left">
                  <div>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent leading-tight blur-sm">
                      {title}
                    </h1>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-base sm:text-lg text-gray-300 mb-4 sm:mb-6 blur-sm">
                      <div className="flex items-center justify-center md:justify-start gap-2">
                        <span>{new Date(date).getFullYear()}</span>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-400">⭐</span>
                          <span>{item.vote_average.toFixed(1)}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-center md:justify-start gap-2">
                        <span>{item.runtime || item.episode_run_time?.[0] || 'N/A'} min</span>
                        <span>•</span>
                        <span className="px-2 py-1 bg-red-600 text-white text-xs sm:text-sm rounded">
                          {isTV ? 'TV Series' : 'Movie'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-base sm:text-sm md:text-sm text-gray-200 leading-relaxed max-w-4xl blur-sm">
                    {item.overview}
                  </p>
                  
                  {item.genres && (
                    <div className="flex flex-wrap gap-2 justify-center md:justify-start blur-sm">
                      {item.genres.map((genre) => (
                        <span
                          key={genre.id}
                          className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white/10 backdrop-blur-sm rounded-full text-xs sm:text-sm border border-white/20"
                        >
                          {genre.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Loader Overlay */}
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <Loader />
        </div>
      </div>
    );
  }

  /* -------------------- RENDER -------------------- */
  return (
    <div className="min-h-screen text-white animate-fade-in">
      <Navbar 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onSearch={handleSearch}
        onLogoClick={() => {
          setSearchTerm('');
          navigate('/');
        }}
      />
      
      {/* Floating Back Button */}
      <button
        onClick={handleBack}
        className="fixed top-20 sm:top-24 left-4 sm:left-6 z-50 glass-hover w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-white transition-all duration-300 shadow-lg hover:shadow-xl touch-manipulation group"
      >
        <svg className="w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      {/* Hero Section */}
      <div className="relative overflow-hidden pt-20 sm:pt-24 md:pt-28">
        {backdrop && (
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105 animate-float"
            style={{ backgroundImage: `url(${backdrop})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black/60" />
            <div className="absolute inset-0 bg-black/20" />
          </div>
        )}
        
        <div className="relative z-10 content-padding py-8 sm:py-12 md:py-16 lg:py-20">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
              {/* Poster */}
              <div className="flex-shrink-0 mx-auto lg:mx-0 animate-slide-up">
                <div className="relative group">
                  <img
                    src={poster}
                    alt={title}
                    className="w-64 h-96 sm:w-72 sm:h-[432px] lg:w-80 lg:h-[480px] object-cover rounded-3xl shadow-2xl border border-white/20 transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </div>
              
              {/* Info */}
              <div className="flex-1 space-y-6 sm:space-y-8 text-center lg:text-left animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <div>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-6 text-gradient leading-tight">
                    {title}
                  </h1>
                  
                  {/* Metadata */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-lg sm:text-xl text-gray-300 mb-6 sm:mb-8">
                    <div className="flex items-center justify-center lg:justify-start gap-3">
                      <span className="font-medium">{new Date(date).getFullYear()}</span>
                      <span className="text-gray-500">•</span>
                      <div className="flex items-center gap-2 bg-yellow-400/20 px-3 py-1 rounded-full border border-yellow-400/30">
                        <span className="text-yellow-400">⭐</span>
                        <span className="text-yellow-300 font-semibold">{item.vote_average.toFixed(1)}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-center lg:justify-start gap-3">
                      <span className="font-medium">{item.runtime || item.episode_run_time?.[0] || 'N/A'} min</span>
                      <span className="text-gray-500">•</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${
                        isTV 
                          ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' 
                          : 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                      }`}>
                        {isTV ? 'TV Series' : 'Movie'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="glass-subtle rounded-2xl p-6 sm:p-8">
                  <p className="text-base sm:text-lg text-gray-200 leading-relaxed max-w-4xl">
                    {item.overview}
                  </p>
                </div>
                
                {item.genres && (
                  <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                    {item.genres.map((genre) => (
                      <span
                        key={genre.id}
                        className="glass-card px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105 cursor-default"
                      >
                        {genre.name}
                      </span>
                    ))}
                  </div>
                )}
                
                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6 justify-center lg:justify-start">
                  <button
                    onClick={handleWatchNow}
                    className="glass-hover flex items-center justify-center gap-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 px-8 py-4 rounded-xl font-semibold text-lg transition-all border border-red-500/30 min-h-[52px] touch-manipulation group"
                  >
                    <svg className="w-6 h-6 transition-transform group-hover:scale-110" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                    {showPlayer ? 'Hide Player' : 'Watch Now'}
                  </button>
                  
                  {trailer && (
                    <button
                      onClick={() => setShowTrailer(!showTrailer)}
                      className="glass-hover flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-semibold text-lg transition-all border border-white/20 min-h-[52px] touch-manipulation group"
                    >
                      <svg className="w-6 h-6 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 002 2v8a2 2 0 002 2z" />
                      </svg>
                      {showTrailer ? 'Hide Trailer' : 'Watch Trailer'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="content-padding pb-20">
        <div className="max-w-7xl mx-auto space-y-16 sm:space-y-20">
          
          {/* Video Player */}
          {showPlayer && (
            <div className="glass rounded-3xl card-spacing border border-white/10 shadow-2xl animate-slide-up">
              <div className="mb-6">
                <h2 className="text-2xl sm:text-3xl font-bold text-gradient mb-2">🎬 Now Playing</h2>
                <p className="text-gray-300">{title}</p>
              </div>
              
              <div className="relative w-full bg-gradient-to-br from-gray-900 to-black rounded-2xl overflow-hidden shadow-2xl">
                <div className="relative pb-[56.25%] h-0">
                  <iframe
                    src={getCurrentStreamUrl()}
                    title={`Watch ${title}`}
                    className="absolute top-0 left-0 w-full h-full"
                    frameBorder="0"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    referrerPolicy="origin"
                    onError={() => {
                      const keys = Object.keys(streamingServers);
                      const next = keys[(keys.indexOf(selectedServer) + 1) % keys.length];
                      setSelectedServer(next);
                    }}
                  />
                </div>
              </div>
              
              {/* Server Selection */}
              <div className="mt-8">
                <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  📺 Choose Server
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(streamingServers).map(([key, srv]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedServer(key)}
                      className={`glass-hover p-4 rounded-xl border transition-all duration-300 min-h-[60px] touch-manipulation group ${
                        selectedServer === key
                          ? 'bg-gradient-to-r from-red-600 to-red-700 text-white border-red-500/50 shadow-lg shadow-red-500/25'
                          : 'glass-card border-white/20 hover:border-white/30'
                      }`}
                    >
                      <div className="font-semibold text-lg group-hover:scale-105 transition-transform">{srv.name}</div>
                      <div className="text-sm opacity-75 mt-1">
                        {srv.quality} • {srv.ads} ads
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Trailer */}
          {showTrailer && trailer && (
            <div className="glass rounded-3xl card-spacing border border-white/10 shadow-2xl animate-slide-up">
              <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-gradient flex items-center gap-3">
                🎥 Official Trailer
              </h2>
              <div className="relative w-full max-w-5xl mx-auto">
                <div className="relative pb-[56.25%] h-0 overflow-hidden rounded-2xl shadow-2xl bg-gradient-to-br from-gray-900 to-black">
                  <iframe
                    src={`https://www.youtube.com/embed/${trailer.key}?rel=0&modestbranding=1&autoplay=0`}
                    title={`${title} Trailer`}
                    className="absolute top-0 left-0 w-full h-full rounded-2xl"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            </div>
          )}

          {/* TV Seasons & Episodes */}
          {isTV && item.seasons && (
            <div className="glass rounded-3xl card-spacing border border-white/10 shadow-2xl animate-slide-up">
              <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-gradient flex items-center gap-3">
                📺 Seasons & Episodes
              </h2>
              
              {/* Season Selection */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  📋 Select Season
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                  {item.seasons
                    .filter((s) => s.season_number > 0)
                    .map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setSelectedSeason(s.season_number)}
                        className={`glass-hover p-4 rounded-xl border transition-all duration-300 min-h-[60px] touch-manipulation group ${
                          selectedSeason === s.season_number
                            ? 'bg-gradient-to-r from-red-600 to-red-700 text-white border-red-500/50 shadow-lg shadow-red-500/25'
                            : 'glass-card border-white/20 hover:border-white/30'
                        }`}
                      >
                        <div className="font-semibold text-base group-hover:scale-105 transition-transform">Season {s.season_number}</div>
                        <div className="text-xs opacity-75 mt-1">
                          {s.episode_count} ep{s.episode_count !== 1 ? 's' : ''}
                        </div>
                      </button>
                    ))}
                </div>
              </div>

              {/* Episode Selection */}
              {seasonData?.episodes?.length > 0 && !loadingSeason && (
                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                    🎬 Select Episode
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 max-h-96 overflow-y-auto scrollbar-hide smooth-scroll">
                    {seasonData.episodes.map((ep) => (
                      <button
                        key={ep.id}
                        onClick={() => setSelectedEpisode(ep.episode_number)}
                        className={`glass-hover p-4 rounded-xl border transition-all duration-300 text-left min-h-[70px] touch-manipulation group ${
                          selectedEpisode === ep.episode_number
                            ? 'bg-gradient-to-r from-red-600 to-red-700 text-white border-red-500/50 shadow-lg shadow-red-500/25'
                            : 'glass-card border-white/20 hover:border-white/30'
                        }`}
                      >
                        <div className="font-semibold text-sm group-hover:scale-105 transition-transform">Ep {ep.episode_number}</div>
                        <div className="text-xs opacity-75 mt-1 truncate" title={ep.name}>
                          {ep.name}
                        </div>
                        {ep.vote_average > 0 && (
                          <div className="text-xs mt-1 flex items-center gap-1">
                            <span className="text-yellow-400">⭐</span>
                            <span>{ep.vote_average.toFixed(1)}</span>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Current Selection */}
              <div className="glass-subtle rounded-2xl p-6 border border-white/20">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h4 className="text-lg font-semibold text-gradient mb-2">🎬 Now Selected</h4>
                    <p className="text-base text-gray-300">
                      Season {selectedSeason}, Episode {selectedEpisode}
                      {(() => {
                        const ep = seasonData?.episodes?.find(
                          (e) => e.episode_number === selectedEpisode
                        );
                        return ep ? ` - ${ep.name}` : '';
                      })()}
                    </p>
                    {(() => {
                      const ep = seasonData?.episodes?.find(
                        (e) => e.episode_number === selectedEpisode
                      );
                      return ep?.overview ? (
                        <p className="text-sm text-gray-400 mt-2 max-w-2xl">{ep.overview}</p>
                      ) : null;
                    })()}
                  </div>
                  {loadingSeason && (
                    <div className="flex items-center gap-3 glass-card px-4 py-2 rounded-lg">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span className="text-sm">Loading episodes...</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Cast */}
          {item.credits?.cast?.length > 0 && (
            <div className="glass rounded-3xl card-spacing border border-white/10 shadow-2xl animate-slide-up">
              <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-gradient flex items-center gap-3">
                🎭 Cast
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
                {item.credits.cast.slice(0, 18).map((actor, index) => (
                  <div key={actor.id} className="group cursor-pointer relative animate-fade-in" style={{ animationDelay: `${index * 0.05}s` }}>
                    <div className="glass-card glass-hover rounded-2xl overflow-hidden transition-all duration-500 group-hover:scale-105 touch-manipulation">
                      <div className="relative aspect-[3/4] overflow-hidden">
                        <img
                          src={
                            actor.profile_path
                              ? `https://image.tmdb.org/t/p/w300${actor.profile_path}`
                              : '/placeholder.png'
                          }
                          alt={actor.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="absolute bottom-0 left-0 right-0 p-3 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                          <p className="text-white text-sm font-medium truncate">{actor.character}</p>
                        </div>
                      </div>
                      <div className="p-3">
                        <p className="font-semibold text-white truncate text-sm group-hover:text-gradient transition-all">{actor.name}</p>
                        <p className="text-xs text-gray-400 truncate mt-1">{actor.character}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Additional Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            <div className="glass rounded-3xl card-spacing border border-white/10 shadow-2xl animate-slide-up">
              <h3 className="text-2xl font-bold mb-6 text-gradient flex items-center gap-3">
                📊 Details
              </h3>
              <div className="space-y-4">
                <div className="glass-subtle rounded-xl p-4 flex justify-between items-center">
                  <span className="text-gray-400 font-medium">Status:</span>
                  <span className="font-semibold bg-green-500/20 text-green-300 px-3 py-1 rounded-full border border-green-500/30">{item.status}</span>
                </div>
                <div className="glass-subtle rounded-xl p-4 flex justify-between items-center">
                  <span className="text-gray-400 font-medium">Runtime:</span>
                  <span className="font-semibold">
                    {item.runtime || item.episode_run_time?.[0] || 'N/A'} min
                  </span>
                </div>
                <div className="glass-subtle rounded-xl p-4 flex justify-between items-center">
                  <span className="text-gray-400 font-medium">Rating:</span>
                  <div className="flex items-center gap-2 bg-yellow-400/20 px-3 py-1 rounded-full border border-yellow-400/30">
                    <span className="text-yellow-400">⭐</span>
                    <span className="font-semibold text-yellow-300">{item.vote_average.toFixed(1)}/10</span>
                  </div>
                </div>
                {item.budget > 0 && (
                  <div className="glass-subtle rounded-xl p-4 flex justify-between items-center">
                    <span className="text-gray-400 font-medium">Budget:</span>
                    <span className="font-semibold text-green-300">
                      ${item.budget.toLocaleString()}
                    </span>
                  </div>
                )}
                {item.revenue > 0 && (
                  <div className="glass-subtle rounded-xl p-4 flex justify-between items-center">
                    <span className="text-gray-400 font-medium">Revenue:</span>
                    <span className="font-semibold text-blue-300">
                      ${item.revenue.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {item.production_companies?.length > 0 && (
              <div className="glass rounded-3xl card-spacing border border-white/10 shadow-2xl animate-slide-up">
                <h3 className="text-2xl font-bold mb-6 text-gradient flex items-center gap-3">
                  🏢 Production
                </h3>
                <div className="space-y-4">
                  {item.production_companies.slice(0, 6).map((company) => (
                    <div key={company.id} className="glass-subtle rounded-xl p-4 flex items-center gap-4 transition-all duration-300 hover:scale-105">
                      {company.logo_path && (
                        <div className="w-12 h-12 bg-white rounded-lg p-2 flex-shrink-0">
                          <img
                            src={`https://image.tmdb.org/t/p/w154${company.logo_path}`}
                            alt={company.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      )}
                      <div>
                        <span className="font-medium text-white">{company.name}</span>
                        {company.origin_country && (
                          <p className="text-sm text-gray-400 mt-1">{company.origin_country}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          {/* Similar Movies/Shows */}
          <div className="animate-slide-up">
            <SimilarMovies id={id} type={type} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default MovieDetails;
