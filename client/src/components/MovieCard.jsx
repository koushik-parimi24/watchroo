import { useContext, useEffect, useState } from 'react';
import { WatchlistContext } from '@/context/WatchlistContext';
import { Link } from 'react-router-dom';
import { Bookmark, BookmarkCheck } from 'lucide-react';

const MovieCard = ({ movie }) => {
  const { watchlist, add, remove } = useContext(WatchlistContext);
  const [saved, setSaved] = useState(false);

  // Normalize values
  const id = movie.id ?? movie.media_id;
  const mediaType = movie.media_type ?? (movie.title ? 'movie' : 'tv');
  const title = movie.original_title || movie.original_name || movie.title || movie.name;
  const date = movie.release_date || movie.first_air_date || 'Unknown';
  const rating = movie.vote_average ?? 'N/A';

  useEffect(() => {
    setSaved(watchlist.some((w) => w.media_id === id));
  }, [watchlist, id]);

  return (
    <div className="relative">
      <Link to={`/${mediaType}/${id}`} className="block">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl shadow-lg hover:shadow-2xl transition">
          <img
            src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '/placeholder.png'}
            alt={title}
            className="w-full h-72 object-cover rounded"
          />
          <h3 className="text-white mt-3 font-bold text-lg line-clamp-1 overflow-hidden">{title}</h3>
          <p className="text-gray-400 text-sm">Release: {date}</p>
          <p className="text-blue-400 text-xs italic">{mediaType === 'tv' ? 'TV Show' : 'Movie'}</p>
          <p className="text-yellow-400 text-sm">⭐ {rating}</p>
        </div>
      </Link>

      <button
        onClick={() => (saved ? remove(id) : add(movie))}
        className="absolute top-3 right-3 bg-amber-50 p-2 rounded-full hover:bg-amber-400"
      >
        {saved ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
      </button>
    </div>
  );
};

export default MovieCard;
