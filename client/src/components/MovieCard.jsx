import { useContext, useEffect, useState } from 'react';
import { WatchlistContext } from '@/context/WatchlistContext';
import { Link, useNavigate } from 'react-router-dom';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLoading } from '@/context/LoadingContext';

const MovieCard = ({ movie, isLoading = false }) => {
  const { watchlist, add, remove } = useContext(WatchlistContext);
  const [saved, setSaved] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { setIsLoading } = useLoading();
  const navigate = useNavigate();

  const id = movie?.id ?? movie?.media_id;
  const mediaType = movie?.media_type ?? (movie?.title ? 'movie' : 'tv');
  const title = movie?.original_title || movie?.original_name || movie?.title || movie?.name;
  const date = movie?.release_date || movie?.first_air_date || 'Unknown';
  const rating = movie?.vote_average ?? 'N/A';

  useEffect(() => {
    if (movie && watchlist) {
      setSaved(watchlist.some((w) => w.media_id === id));
    }
  }, [watchlist, id, movie]);

  // Show skeleton while loading or if no movie data
  if (isLoading || !movie) {
    return <MovieCardSkeleton />;
  }

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      whileHover={{ scale: 1.03 }}
      className="relative"
    >
      <Link to={`/${mediaType}/${id}`} onClick={() => setIsLoading(true)} className="block">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl shadow-lg hover:shadow-2xl transition">
          {/* Image with loading state */}
          <div className="relative w-full h-72 rounded overflow-hidden bg-gray-700">
            {!imageLoaded && !imageError && (
              <div className="absolute inset-0 bg-gray-600/50 animate-pulse flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-white/20 border-t-white/60 rounded-full animate-spin"></div>
              </div>
            )}
            
            <img
              src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '/placeholder.png'}
              alt={title}
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
            
            {imageError && (
              <div className="absolute inset-0 bg-gray-700 flex items-center justify-center">
                <div className="text-gray-400 text-center p-4">
                  <div className="w-16 h-16 mx-auto mb-2 bg-gray-600 rounded-lg flex items-center justify-center">
                    📷
                  </div>
                  <p className="text-sm">Image not available</p>
                </div>
              </div>
            )}
          </div>
          
          <h3 className="text-white mt-3 font-bold text-lg line-clamp-1 overflow-hidden">{title}</h3>
          <p className="text-gray-400 text-sm">Release: {date}</p>
          <p className="text-blue-400 text-xs italic">{mediaType === 'tv' ? 'TV Show' : 'Movie'}</p>
          <p className="text-yellow-400 text-sm">⭐ {rating}</p>
        </div>
      </Link>

      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          saved ? remove(id) : add(movie);
        }}
        className="absolute top-3 right-3 bg-amber-50 p-2 rounded-full hover:bg-amber-400 transition"
      >
        {saved ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
      </button>
    </motion.div>
  );
};

// Skeleton component within the same file for convenience
const MovieCardSkeleton = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative"
    >
      <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl shadow-lg">
        {/* Poster skeleton with shimmer effect */}
        <div className="w-full h-72 bg-gradient-to-r from-gray-600/50 via-gray-500/50 to-gray-600/50 bg-[length:200%_100%] animate-shimmer rounded mb-3"></div>
        
        {/* Title skeleton */}
        <div className="h-6 bg-gradient-to-r from-gray-600/50 via-gray-500/50 to-gray-600/50 bg-[length:200%_100%] animate-shimmer rounded mb-2 w-3/4"></div>
        
        {/* Release date skeleton */}
        <div className="h-4 bg-gradient-to-r from-gray-600/50 via-gray-500/50 to-gray-600/50 bg-[length:200%_100%] animate-shimmer rounded mb-1 w-1/2"></div>
        
        {/* Media type skeleton */}
        <div className="h-3 bg-gradient-to-r from-gray-600/50 via-gray-500/50 to-gray-600/50 bg-[length:200%_100%] animate-shimmer rounded mb-1 w-1/3"></div>
        
        {/* Rating skeleton */}
        <div className="h-4 bg-gradient-to-r from-gray-600/50 via-gray-500/50 to-gray-600/50 bg-[length:200%_100%] animate-shimmer rounded w-1/4"></div>
      </div>
      
      {/* Bookmark button skeleton */}
      <div className="absolute top-3 right-3 w-10 h-10 bg-gradient-to-r from-gray-600/50 via-gray-500/50 to-gray-600/50 bg-[length:200%_100%] animate-shimmer rounded-full"></div>
    </motion.div>
  );
};

export default MovieCard;
