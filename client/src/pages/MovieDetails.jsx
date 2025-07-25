import { useParams, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import MovieDetailsSkeleton from '@/components/animations/MovieDetailsSkeleton';
import SimilarMovies from '@/components/SimilarMovies';
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

  /* -------------------- DERIVED -------------------- */
  const isTV = location.pathname.startsWith('/tv');
  const type = isTV ? 'tv' : 'movie';

  /* -------------------- FETCH ITEM DETAILS -------------------- */
  useEffect(() => {
    const fetchDetails = async () => {
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

  /* -------------------- STREAMING SERVERS -------------------- */
  const streamingServers = {
    server1: {
      name: '2Embed',
      url: (tmdbId, mediaType, season, episode) =>
        mediaType === 'tv'
          ? `https://www.2embed.cc/embedtv/${tmdbId}/${season}/${episode}`
          : `https://www.2embed.cc/embed/${mediaType}/${tmdbId}`,
      quality: 'HD',
      ads: 'Minimal',
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
      name: 'VidLink',
      url: (tmdbId, mediaType, season, episode) =>
        mediaType === 'tv'
          ? `https://vidlink.pro/tv/${tmdbId}/${season}/${episode}`
          : `https://vidlink.pro/movie/${tmdbId}`,
      quality: 'HD',
      ads: 'Few',
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

  /* -------------------- RENDER -------------------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      <Navbar />
      
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
        
        <div className="relative z-10 pt-20 pb-8 px-4 md:px-8 lg:px-16">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              {/* Poster */}
              <div className="flex-shrink-0">
                <img
                  src={poster}
                  alt={title}
                  className="w-64 h-96 object-cover rounded-2xl shadow-2xl border border-white/10"
                />
              </div>
              
              {/* Info */}
              <div className="flex-1 space-y-6">
                <div>
                  <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    {title}
                  </h1>
                  <div className="flex items-center gap-4 text-lg text-gray-300 mb-6">
                    <span>{new Date(date).getFullYear()}</span>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-400">⭐</span>
                      <span>{item.vote_average.toFixed(1)}</span>
                    </div>
                    <span>•</span>
                    <span>{item.runtime || item.episode_run_time?.[0] || 'N/A'} min</span>
                    <span>•</span>
                    <span className="px-2 py-1 bg-red-600 text-white text-sm rounded">
                      {isTV ? 'TV Series' : 'Movie'}
                    </span>
                  </div>
                </div>
                
                <p className="text-xl text-gray-200 leading-relaxed max-w-4xl">
                  {item.overview}
                </p>
                
                {item.genres && (
                  <div className="flex flex-wrap gap-2">
                    {item.genres.map((genre) => (
                      <span
                        key={genre.id}
                        className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm border border-white/20"
                      >
                        {genre.name}
                      </span>
                    ))}
                  </div>
                )}
                
                {/* Action Buttons */}
                <div className="flex flex-wrap gap-4 pt-4">
                  <button
                    onClick={() => setShowPlayer(!showPlayer)}
                    className="flex items-center gap-3 bg-red-600 hover:bg-red-700 px-8 py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 shadow-lg"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                    {showPlayer ? 'Hide Player' : 'Watch Now'}
                  </button>
                  
                  {trailer && (
                    <button
                      onClick={() => setShowTrailer(!showTrailer)}
                      className="flex items-center gap-3 bg-white/20 backdrop-blur-sm hover:bg-white/30 px-8 py-4 rounded-xl font-semibold text-lg transition-all border border-white/30"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
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
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 shadow-2xl">
              <div className="relative w-full bg-black rounded-2xl overflow-hidden shadow-2xl">
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
              <div className="mt-6">
                <h3 className="text-xl font-semibold mb-4">Choose Server</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {Object.entries(streamingServers).map(([key, srv]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedServer(key)}
                      className={`p-4 rounded-xl border transition-all ${
                        selectedServer === key
                          ? 'bg-red-600 text-white border-red-500 shadow-lg shadow-red-500/25'
                          : 'bg-white/5 backdrop-blur-sm text-white border-white/20 hover:bg-white/10'
                      }`}
                    >
                      <div className="font-semibold text-lg">{srv.name}</div>
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
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 shadow-2xl">
              <h2 className="text-2xl font-bold mb-6">Official Trailer</h2>
              <div className="relative w-full max-w-4xl mx-auto">
                <div className="relative pb-[56.25%] h-0 overflow-hidden rounded-2xl shadow-2xl">
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
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 shadow-2xl">
              <h2 className="text-3xl font-bold mb-8">Seasons & Episodes</h2>
              
              {/* Season Selection */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4">Select Season</h3>
                <div className="flex flex-wrap gap-3">
                  {item.seasons
                    .filter((s) => s.season_number > 0)
                    .map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setSelectedSeason(s.season_number)}
                        className={`px-6 py-3 rounded-xl border transition-all ${
                          selectedSeason === s.season_number
                            ? 'bg-red-600 text-white border-red-500 shadow-lg'
                            : 'bg-white/5 backdrop-blur-sm text-white border-white/20 hover:bg-white/10'
                        }`}
                      >
                        <div className="font-semibold">Season {s.season_number}</div>
                        <div className="text-xs opacity-75 mt-1">
                          {s.episode_count} episodes
                        </div>
                      </button>
                    ))}
                </div>
              </div>

              {/* Episode Selection */}
              {seasonData?.episodes?.length > 0 && !loadingSeason && (
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-4">Select Episode</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 max-h-96 overflow-y-auto">
                    {seasonData.episodes.map((ep) => (
                      <button
                        key={ep.id}
                        onClick={() => setSelectedEpisode(ep.episode_number)}
                        className={`p-4 rounded-xl border transition-all text-left ${
                          selectedEpisode === ep.episode_number
                            ? 'bg-red-600 text-white border-red-500 shadow-lg'
                            : 'bg-white/5 backdrop-blur-sm text-white border-white/20 hover:bg-white/10'
                        }`}
                      >
                        <div className="font-semibold">Ep {ep.episode_number}</div>
                        <div className="text-xs opacity-75 mt-1 truncate" title={ep.name}>
                          {ep.name}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Current Selection */}
              <div className="bg-gradient-to-r from-red-600/20 to-purple-600/20 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-semibold">Now Playing</h4>
                    <p className="text-gray-300">
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
                      <span className="text-sm">Loading episodes...</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Cast */}
          {item.credits?.cast?.length > 0 && (
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 shadow-2xl">
              <h2 className="text-3xl font-bold mb-8">Cast</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {item.credits.cast.slice(0, 12).map((actor) => (
                  <div key={actor.id} className="group cursor-pointer">
                    <div className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 transition-all group-hover:scale-105 group-hover:shadow-xl">
                      <img
                        src={
                          actor.profile_path
                            ? `https://image.tmdb.org/t/p/w185${actor.profile_path}`
                            : '/fallback-user.png'
                        }
                        alt={actor.name}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="p-4">
                        <p className="font-semibold text-white truncate">{actor.name}</p>
                        <p className="text-sm text-gray-400 truncate">{actor.character}</p>
                      </div>
                    </div>
                  </div>
                ))}

              </div>
            </div>
          )}

          {/* Additional Info */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 shadow-2xl">
              <h3 className="text-2xl font-bold mb-6">Details</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-400">Status:</span>
                  <span className="font-semibold">{item.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Runtime:</span>
                  <span className="font-semibold">
                    {item.runtime || item.episode_run_time?.[0] || 'N/A'} min
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Rating:</span>
                  <span className="font-semibold">⭐ {item.vote_average.toFixed(1)}/10</span>
                </div>
                {item.budget > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Budget:</span>
                    <span className="font-semibold">
                      ${item.budget.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {item.production_companies?.length > 0 && (
              <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 shadow-2xl">
                <h3 className="text-2xl font-bold mb-6">Production</h3>
                <div className="space-y-3">
                  {item.production_companies.slice(0, 5).map((company) => (
                    <div key={company.id} className="flex items-center gap-3">
                      {company.logo_path && (
                        <img
                          src={`https://image.tmdb.org/t/p/w92${company.logo_path}`}
                          alt={company.name}
                          className="w-8 h-8 object-contain bg-white rounded p-1"
                        />
                      )}
                      <span className="font-medium">{company.name}</span>
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
