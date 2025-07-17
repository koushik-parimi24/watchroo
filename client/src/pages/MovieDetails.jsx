import { useParams, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';

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

        // Reset season/episode for TV shows so we never request an invalid season
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
    if (!isTV || !item) return; // only run for TV shows after item is loaded

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
        setSelectedEpisode(1); // reset ep when season changes
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
  if (error) return <div className="text-destructive p-4">{error}</div>;
  if (!item) return <div className="text-foreground p-4">Loading...</div>;

  /* -------------------- BASIC DERIVED DATA -------------------- */
  const title = item.title || item.name;
  const date = item.release_date || item.first_air_date;
  const poster = item.poster_path
    ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
    : '/placeholder.png';

  const trailer =
    item.videos?.results?.find(
      (v) => v.type === 'Trailer' && v.site === 'YouTube'
    ) || item.videos?.results?.find((v) => v.site === 'YouTube');

  /* -------------------- RENDER -------------------- */
  return (
    <div className="p-6 text-foreground mx-auto pt-24 min-h-screen bg-blue-200">
      <div className="flex flex-col gap-6">
        <Navbar />

        {/* ------------ PLAYER SECTION ------------ */}
        <div className="w-full">
          <div className="flex items-center gap-4 mb-4">
            <h1 className="text-3xl font-bold">{title}</h1>
            <button
              onClick={() => setShowPlayer((p) => !p)}
              className="bg-primary text-primary-foreground px-6 py-3 rounded hover:bg-primary/90 transition font-semibold"
            >
              {showPlayer ? 'Hide Player' : '▶️ Watch Now'}
            </button>
          </div>

          {showPlayer && (
            <div className="mb-8">
              <div className="relative w-full bg-card rounded-lg overflow-hidden shadow-2xl border">
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

              {/* ---- SERVER SELECTION ---- */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3">Choose Server:</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {Object.entries(streamingServers).map(([key, srv]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedServer(key)}
                      className={`p-3 rounded-lg border transition-all text-sm ${
                        selectedServer === key
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-card text-card-foreground border-border hover:bg-accent hover:text-accent-foreground'
                      }`}
                    >
                      <div className="font-medium">{srv.name}</div>
                      <div className="text-xs opacity-75 mt-1">
                        {srv.quality} • {srv.ads}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ------------ INFO SECTION ------------ */}
        <div className="flex flex-col md:flex-row gap-6">
          <img
            src={poster}
            alt={title}
            className="w-48 h-72 object-cover rounded shadow-lg border-8"
          />

          <div className="flex-1">
            <p className="text-sm text-muted-foreground mb-2">
              {date} • ⭐ {item.vote_average}/10
            </p>
            <p className="mb-4 leading-loose text-card-foreground">
              {item.overview}
            </p>

            {/* ---- DETAILS GRID ---- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Details</h3>
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="text-muted-foreground">Type:</span> {isTV ? 'TV Series' : 'Movie'}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Runtime:</span>{' '}
                    {item.runtime || item.episode_run_time?.[0] || 'N/A'} min
                  </p>
                  <p>
                    <span className="text-muted-foreground">Status:</span> {item.status}
                  </p>
                  {item.genres && (
                    <p>
                      <span className="text-muted-foreground">Genres:</span>{' '}
                      {item.genres.map((g) => g.name).join(', ')}
                    </p>
                  )}
                </div>
              </div>

              {item.production_companies?.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Production</h3>
                  <div className="space-y-1 text-sm">
                    {item.production_companies.slice(0, 3).map((c) => (
                      <p key={c.id}>{c.name}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ------------ TV SEASONS & EPISODES ------------ */}
            {isTV && item.seasons && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-4">Seasons & Episodes</h2>

                {/* ----- Season Picker ----- */}
                <div className="mb-4">
                  <h3 className="text-lg font-medium mb-2">Select Season:</h3>
                  <div className="flex flex-wrap gap-2">
                    {item.seasons
                      .filter((s) => s.season_number > 0)
                      .map((s) => (
                        <button
                          key={s.id}
                          onClick={() => setSelectedSeason(s.season_number)}
                          className={`px-4 py-2 rounded-lg border transition-all text-sm ${
                            selectedSeason === s.season_number
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'bg-card text-card-foreground border-border hover:bg-accent hover:text-accent-foreground'
                          }`}
                        >
                          Season {s.season_number}
                          <div className="text-xs opacity-75 mt-1">
                            {s.episode_count} episodes
                          </div>
                        </button>
                      ))}
                  </div>
                </div>

                {/* ----- Episode Picker ----- */}
                {seasonData?.episodes?.length > 0 && !loadingSeason && (
                  <div className="mb-4">
                    <h3 className="text-lg font-medium mb-2">Select Episode:</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 max-h-64 overflow-y-auto">
                      {seasonData.episodes.map((ep) => (
                        <button
                          key={ep.id}
                          onClick={() => setSelectedEpisode(ep.episode_number)}
                          className={`p-3 rounded-lg border transition-all text-sm ${
                            selectedEpisode === ep.episode_number
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'bg-card text-card-foreground border-border hover:bg-accent hover:text-accent-foreground'
                          }`}
                        >
                          <div className="font-medium">Ep {ep.episode_number}</div>
                          <div className="text-xs opacity-75 mt-1 truncate" title={ep.name}>
                            {ep.name}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* ----- Current Selection Info ----- */}
                <div className="bg-accent/50 rounded-lg p-4 border">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-accent-foreground">Now Playing:</h4>
                      <p className="text-sm text-muted-foreground">
                        Season {selectedSeason}, Episode {selectedEpisode}
                        {(() => {
                          const ep = seasonData?.episodes?.find(
                            (e) => e.episode_number === selectedEpisode
                          );
                          return ep ? ` - ${ep.name}` : '';
                        })()}
                      </p>
                    </div>
                    {loadingSeason && <span className="text-sm">Loading episodes…</span>}
                  </div>
                </div>
              </div>
            )}

            {/* ------------ TRAILER ------------ */}
            {trailer && (
              <div className="mb-6">
                <div className="flex items-center gap-4 mb-4">
                  <h2 className="text-xl font-semibold">Trailer</h2>
                  <button
                    onClick={() => setShowTrailer((p) => !p)}
                    className="bg-destructive text-destructive-foreground px-4 py-2 rounded hover:bg-destructive/90 text-sm"
                  >
                    {showTrailer ? 'Hide Trailer' : 'Watch Trailer'}
                  </button>
                </div>
                {showTrailer && (
                  
                  <div className="relative w-full max-w-2xl">
                    <div className="relative pb-[56.25%] h-0 overflow-hidden rounded-lg shadow-lg border">
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
                )}
              </div>
            )}

            {/* ------------ TOP CAST ------------ */}
            {item.credits?.cast?.length > 0 && (
              <>
                <h2 className="text-xl font-semibold mt-6 mb-4">Top Cast</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {item.credits.cast.slice(0, 10).map((actor) => (
                    <div key={actor.id} className="text-center">
                      <img
                        src={
                          actor.profile_path
                            ? `https://image.tmdb.org/t/p/w185${actor.profile_path}`
                            : '/fallback-user.png'
                        }
                        alt={actor.name}
                        className="w-full object-cover rounded-lg border shadow mb-2"
                      />
                      <p className="text-foreground text-sm font-medium">{actor.name}</p>
                      <p className="text-muted-foreground text-xs italic">{actor.character}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MovieDetails;
