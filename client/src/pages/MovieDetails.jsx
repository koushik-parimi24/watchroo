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
        <div className="relative">
          {backdrop && (
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat blur-sm"
              style={{ backgroundImage: `url(${backdrop})` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black/50" />
            </div>
          )}
          
          <div className="relative z-10 pt-8 sm:pt-12 md:pt-20 pb-8 px-4 sm:px-6 md:px-8 lg:px-16">
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
      {/* Hero Section */}
      <div className="relative">
        {backdrop && (
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${backdrop})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black/50" />
          </div>
        )}
        
        <div className="relative z-10 pt-8 sm:pt-12 md:pt-20 pb-8 px-4 sm:px-6 md:px-8 lg:px-16">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row gap-6 sm:gap-8 items-start">
              {/* Poster */}
              <div className="flex-shrink-0 mx-auto md:mx-0">
                <img
                  src={poster}
                  alt={title}
                  className="w-48 h-72 sm:w-56 sm:h-84 md:w-64 md:h-96 object-cover rounded-2xl shadow-2xl border border-white/10"
                />
              </div>
              
              {/* Info */}
              <div className="flex-1 space-y-4 sm:space-y-6 text-center md:text-left">
                <div>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent leading-tight">
                    {title}
                  </h1>
                  
                  {/* Mobile-optimized metadata */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-base sm:text-lg text-gray-300 mb-4 sm:mb-6">
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
                      <span className="px-2 py-1 bg-red-600 text-white text-xs sm:text-xs rounded">
                        {isTV ? 'TV Series' : 'Movie'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <p className="text-base sm:text-sm md:text-sn text-gray-200 leading-loose max-w-4xl">
                  {item.overview}
                </p>
                
                {item.genres && (
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start">
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
                
                {/* Action Buttons - Mobile Optimized */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 justify-center md:justify-start">

                  
                  {trailer && (
                    <button
                      onClick={() => setShowTrailer(!showTrailer)}
                      className="flex items-center justify-center gap-3 bg-white/20 backdrop-blur-sm hover:bg-white/30 active:bg-white/40 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg transition-all border border-white/30 min-h-[44px] touch-manipulation"
                    >
                      <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

      <div className="px-4 md:px-8 lg:px-16 pb-16">
        <div className="max-w-7xl mx-auto space-y-12">
          
          {/* Video Player */}
          {showPlayer && (
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-white/10 shadow-2xl">
              <div className="relative w-full bg-black rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl">
                {/* Mobile-optimized aspect ratio */}
                <div className="relative pb-[56.25%] sm:pb-[56.25%] h-0">
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
              
              {/* Server Selection - Mobile Optimized */}
              <div className="mt-4 sm:mt-6">
                <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Choose Server</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {Object.entries(streamingServers).map(([key, srv]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedServer(key)}
                      className={`p-3 sm:p-4 rounded-xl border transition-all min-h-[44px] touch-manipulation ${
                        selectedServer === key
                          ? 'bg-red-600 text-white border-red-500 shadow-lg shadow-red-500/25'
                          : 'bg-white/5 backdrop-blur-sm text-white border-white/20 hover:bg-white/10 active:bg-white/15'
                      }`}
                    >
                      <div className="font-semibold text-base sm:text-lg">{srv.name}</div>
                      <div className="text-xs sm:text-sm opacity-75 mt-1">
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
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-white/10 shadow-2xl">
              <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Official Trailer</h2>
              <div className="relative w-full max-w-4xl mx-auto">
                <div className="relative pb-[56.25%] h-0 overflow-hidden rounded-xl sm:rounded-2xl shadow-2xl">
                  <iframe
                    src={`https://www.youtube.com/embed/${trailer.key}?rel=0&modestbranding=1`}
                    title={`${title} Trailer`}
                    className="absolute top-0 left-0 w-full h-full"
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
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-white/10 shadow-2xl">
              <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Seasons & Episodes</h2>
              
              {/* Season Selection - Mobile Optimized */}
              <div className="mb-6 sm:mb-8">
                <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Select Season</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
                  {item.seasons
                    .filter((s) => s.season_number > 0)
                    .map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setSelectedSeason(s.season_number)}
                        className={`p-3 sm:px-6 sm:py-3 rounded-xl border transition-all min-h-[44px] touch-manipulation ${
                          selectedSeason === s.season_number
                            ? 'bg-red-600 text-white border-red-500 shadow-lg'
                            : 'bg-white/5 backdrop-blur-sm text-white border-white/20 hover:bg-white/10 active:bg-white/15'
                        }`}
                      >
                        <div className="font-semibold text-sm sm:text-base">Season {s.season_number}</div>
                        <div className="text-xs opacity-75 mt-1">
                          {s.episode_count} ep{s.episode_count !== 1 ? 's' : ''}
                        </div>
                      </button>
                    ))}
                </div>
              </div>

              {/* Episode Selection - Mobile Optimized */}
              {seasonData?.episodes?.length > 0 && !loadingSeason && (
                <div className="mb-4 sm:mb-6">
                  <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Select Episode</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-2 sm:gap-3 max-h-80 sm:max-h-96 overflow-y-auto scrollbar-hide">
                    {seasonData.episodes.map((ep) => (
                      <button
                        key={ep.id}
                        onClick={() => setSelectedEpisode(ep.episode_number)}
                        className={`p-3 sm:p-4 rounded-xl border transition-all text-left min-h-[44px] touch-manipulation ${
                          selectedEpisode === ep.episode_number
                            ? 'bg-red-600 text-white border-red-500 shadow-lg'
                            : 'bg-white/5 backdrop-blur-sm text-white border-white/20 hover:bg-white/10 active:bg-white/15'
                        }`}
                      >
                        <div className="font-semibold text-sm sm:text-base">Ep {ep.episode_number}</div>
                        <div className="text-xs opacity-75 mt-1 truncate" title={ep.name}>
                          {ep.name}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Current Selection - Mobile Optimized */}
              <div className="bg-gradient-to-r from-red-600/20 to-purple-600/20 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h4 className="text-base sm:text-lg font-semibold">Now Playing</h4>
                    <p className="text-sm sm:text-base text-gray-300">
                      Season {selectedSeason}, Episode {selectedEpisode}
                      {(() => {
                        const ep = seasonData?.episodes?.find(
                          (e) => e.episode_number === selectedEpisode
                        );
                        return ep ? ` - ${ep.name}` : '';
                      })()}
                    </p>
                  </div>
                  {loadingSeason && (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span className="text-xs sm:text-sm">Loading episodes...</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Cast */}
          {item.credits?.cast?.length > 0 && (
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-white/10 shadow-2xl overflow-visible">
              <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Cast</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-6 overflow-visible">
                {item.credits.cast.slice(0, 12).map((actor) => (
                  <div key={actor.id} className="group cursor-pointer relative hover:z-[999]">
                    <div className="relative overflow-visible rounded-xl sm:rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 transition-all group-hover:scale-105 group-hover:shadow-xl touch-manipulation">
                      <img
                        src={
                          actor.profile_path
                            ? `https://image.tmdb.org/t/p/w185${actor.profile_path}`
                            : '/placeholder.png'
                        }
                        alt={actor.name}
                        className="w-full h-40 sm:h-48 object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="p-3 sm:p-4">
                        <p className="font-semibold text-white truncate text-sm sm:text-base">{actor.name}</p>
                        <p className="text-xs sm:text-sm text-gray-400 truncate">{actor.character}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Additional Info - Mobile Optimized */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-white/10 shadow-2xl">
              <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Details</h3>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm sm:text-base">Status:</span>
                  <span className="font-semibold text-sm sm:text-base">{item.status}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm sm:text-base">Runtime:</span>
                  <span className="font-semibold text-sm sm:text-base">
                    {item.runtime || item.episode_run_time?.[0] || 'N/A'} min
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm sm:text-base">Rating:</span>
                  <span className="font-semibold text-sm sm:text-base">⭐ {item.vote_average.toFixed(1)}/10</span>
                </div>
                {item.budget > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm sm:text-base">Budget:</span>
                    <span className="font-semibold text-sm sm:text-base">
                      ${item.budget.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {item.production_companies?.length > 0 && (
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-white/10 shadow-2xl">
                <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Production</h3>
                <div className="space-y-3">
                  {item.production_companies.slice(0, 5).map((company) => (
                    <div key={company.id} className="flex items-center gap-3">
                      {company.logo_path && (
                        <img
                          src={`https://image.tmdb.org/t/p/w92${company.logo_path}`}
                          alt={company.name}
                          className="w-6 h-6 sm:w-8 sm:h-8 object-contain bg-white rounded p-1 flex-shrink-0"
                        />
                      )}
                      <span className="font-medium text-sm sm:text-base">{company.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
           <SimilarMovies id={id} type={type}  />
        </div>
      </div>
    </div>
  );
}

export default MovieDetails;
