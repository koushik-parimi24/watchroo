import { useContext, useEffect, useState } from 'react';
import { WatchlistContext } from '@/context/WatchlistContext';
import { Link } from 'react-router-dom';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const MovieListItem = ({ movie }) => {
  const { watchlist, add, remove } = useContext(WatchlistContext);
  const [saved, setSaved] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const id = movie?.id ?? movie?.medi-id;
  const mediaType = movie?.media_type ?? (movie?.title ? 'movie' : 'tv');
  const title = movie?.original_title || movie?.original_name || movie?.title || movie?.name;
  const date = movie?.release_date || movie?.first_air_date || 'Unknown';
  const rating = movie?.vote_average ?? 'N/A';
  const overview = movie?.overview || 'No description available.';

  useEffect(() => {
    const isSaved = watchlist.some((w) => String(w.medi-id) === String(movie.id));
    setSaved(isSaved);
  }, [watchlist, movie.id]);

  const handleImageLoad = () => setImageLoaded(true);
  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="relative flex items-center bg-gray-800/50 backdrop-blur-md rounded-xl shadow-lg hover:bg-gray-700/60 transition-all duration-300 group touch-manipulation min-h-[180px]"
    >
      <Link to={`/${mediaType}/${id}`} className="flex items-center w-full p-2 sm:p-4">
        {/* Image Section */}
        <div className="flex-shrink-0 w-24 sm:w-32 md:w-40 aspect-[2/3] relative rounded-lg overflow-hidden bg-gradient-to-br from-gray-700 to-gray-800">
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 bg-gray-600/30 animate-pulse flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-white/20 border-t-white/60 rounded-full animate-spin"></div>
            </div>
          )}
          <img
            src={movie.poster_path ? `https://image.tmdb.org/t/p/w200${movie.poster_path}` : '/no-movie.png'}
            alt={title}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
          {imageError && (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
              <div className="text-gray-400 text-center text-xs">No Image</div>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="ml-3 sm:ml-4 flex-1 py-1">
          <h3 className="text-white font-bold text-base sm:text-lg line-clamp-2 group-hover:text-blue-400 transition-colors duration-300">
            {title}
          </h3>
          <p className="text-gray-400 text-xs sm:text-sm mt-1 line-clamp-3 mb-2">
            {overview}
          </p>
          <div className="flex items-center gap-3 mt-auto text-xs sm:text-sm">
            <span className="text-gray-400">
              {new Date(date).getFullYear() || 'Unknown'}
            </span>
            <span className="flex items-center gap-1 text-yellow-400 font-medium">
              ⭐ {rating !== 'N/A' ? Number(rating).toFixed(1) : 'N/A'}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              mediaType === 'tv' 
                ? 'bg-blue-500/20 text-blue-300' 
                : 'bg-purple-500/20 text-purple-300'
            }`}>
              {mediaType === 'tv' ? 'TV Show' : 'Movie'}
            </span>
          </div>
        </div>
      </Link>

      {/* Bookmark button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          saved ? remove(id) : add(movie);
        }}
        className={`absolute top-2 right-2 p-2 rounded-full glass-button transition-all duration-300 ${
          saved 
            ? 'text-amber-400 border border-amber-500/30' 
            : 'text-gray-400 border border-gray-500/30 hover:text-amber-400 hover:border-amber-500/30'
        }`}
        aria-label={saved ? 'Remove from watchlist' : 'Add to watchlist'}
      >
        {saved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
      </button>
    </motion.div>
  );
};

export default MovieListItem;

export const MovieListItemSkeleton = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative flex items-center bg-gray-800/50 backdrop-blur-md rounded-xl shadow-lg min-h-[180px] p-2 sm:p-4"
    >
      <div className="flex-shrink-0 w-24 sm:w-32 md:w-40 aspect-[2/3] rounded-lg bg-gradient-to-r from-gray-600/30 via-gray-500/30 to-gray-600/30 bg-[length:200%_100%] animate-shimmer"></div>
      <div className="ml-3 sm:ml-4 flex-1 space-y-3 py-1">
        <div className="h-6 bg-gradient-to-r from-gray-600/30 via-gray-500/30 to-gray-600/30 animate-shimmer rounded w-3/4"></div>
        <div className="h-4 bg-gradient-to-r from-gray-600/30 via-gray-500/30 to-gray-600/30 animate-shimmer rounded w-full"></div>
        <div className="h-4 bg-gradient-to-r from-gray-600/30 via-gray-500/30 to-gray-600/30 animate-shimmer rounded w-1/2"></div>
        <div className="flex items-center gap-3 mt-auto text-xs sm:text-sm">
          <div className="h-4 bg-gradient-to-r from-gray-600/30 via-gray-500/30 to-gray-600/30 animate-shimmer rounded w-1/4"></div>
          <div className="h-4 bg-gradient-to-r from-gray-600/30 via-gray-500/30 to-gray-600/30 animate-shimmer rounded w-1/4"></div>
          <div className="h-6 bg-gradient-to-r from-gray-600/30 via-gray-500/30 to-gray-600/30 animate-shimmer rounded-full w-1/4"></div>
        </div>
      </div>
      <div className="absolute top-2 right-2 w-8 h-8 bg-gradient-to-r from-gray-600/30 via-gray-500/30 to-gray-600/30 animate-shimmer rounded-full"></div>
    </motion.div>
  );
