/*  ─── src/components/SimilarMovies.jsx ───────────────────────────── */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MovieCardSkeleton from './animations/MovieCardSkeleton'; // reuse / create a 6-card skeleton

// Share the API config you already have
const API_URL_BASE = 'https://api.themoviedb.org/3';
const API_OPTIONS  = {
  method: 'GET',
  headers: {
    Authorization: `Bearer ${import.meta.env.VITE_TMDB_API_KEY}`,
    'Content-Type': 'application/json',
  },
};

export default function SimilarMovies({ id, type = 'movie' }) {
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let abort = false;

    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL_BASE}/${type}/${id}/similar?page=1`, API_OPTIONS);
        if (!res.ok) throw new Error('Could not fetch similar titles');
        const data = await res.json();
        if (!abort) setSimilar(data.results.slice(0, 12));   // show top 12
      } catch (err) {
        console.error(err);
        if (!abort) setSimilar([]);
      } finally {
        if (!abort) setLoading(false);
      }
    })();

    return () => { abort = true };
  }, [id, type]);

  if (loading) return <MovieCardSkeleton cards={6} />;      // feel free to adjust

  if (similar.length === 0) return null;                     // nothing to show

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-white/10 shadow-2xl overflow-visible">
      <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Similar {type === 'tv' ? 'Shows' : 'Movies'} For You</h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-6 overflow-visible">
        {similar.map((m) => (
          <Link
            to={`/${type}/${m.id}`}
            key={m.id}
            className="group relative overflow-visible rounded-xl sm:rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 transition-all hover:scale-105 hover:shadow-xl hover:z-[999] touch-manipulation"
          >
            <img
              src={
                m.poster_path
                  ? `https://image.tmdb.org/t/p/w342${m.poster_path}`
                  : '/placeholder.png'
              }
              alt={m.title || m.name}
              className="w-full h-48 sm:h-56 object-cover"
            />

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            {/* Title + rating - Always visible on mobile, hover on desktop */}
            <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-black/90 to-transparent sm:bg-none">
              <p className="text-xs sm:text-sm font-semibold truncate text-white">
                {m.title || m.name}
              </p>
              <p className="text-xs text-yellow-400">⭐ {m.vote_average.toFixed(1)}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
