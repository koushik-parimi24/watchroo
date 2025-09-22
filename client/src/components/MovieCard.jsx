import { useContext, useEffect, useState } from 'react';
import { WatchlistContext } from '@/context/WatchlistContext';
import { Link, useNavigate } from 'react-router-dom';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLoading } from '@/context/LoadingContext';
import './moviecard.css';

const MovieCard = ({ movie, isLoading = false }) => {
  const { watchlist, add, remove } = useContext(WatchlistContext);
  const [saved, setSaved] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { setIsLoading } = useLoading();
  const navigate = useNavigate();

  if (isLoading || !movie) return <MovieCardSkeleton />;

  const id = movie?.id ?? movie?.medi-id;
  const mediaType = movie?.media_type ?? (movie?.title ? 'movie' : 'tv');
  const title = movie?.original_title || movie?.original_name || movie?.title || movie?.name;
  const date = movie?.release_date || movie?.first_air_date || 'Unknown';
  const rating = movie?.vote_average ?? 'N/A';

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
      className="group relative hover:z-[999] touch-manipulation"
    >
      <Link to={`/${mediaType}/${id}`} onClick={() => setIsLoading(true)} className="block">
        <div className="glass-card glass-hover rounded-2xl overflow-hidden transition-all duration-500 group-hover:scale-[1.02] h-full flex flex-col">
          {/* Image section */}
          <div className="relative aspect-[2/3] bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden flex-shrink-0">
            {!imageLoaded && !imageError && (
              <div className="absolute inset-0 bg-gray-600/30 animate-pulse flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-white/20 border-t-white/60 rounded-full animate-spin"></div>
              </div>
            )}

            <img
              src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '/placeholder.png'}
              alt={title}
              className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={handleImageLoad}
              onError={handleImageError}
            />

            {imageError && (
              <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                <div className="text-gray-400 text-center p-4">
                  <div className="w-12 h-12 mx-auto mb-2 bg-gray-600 rounded-lg flex items-center justify-center text-2xl">
                    🎬
                  </div>
                  <p className="text-xs">No Image</p>
                </div>
              </div>
            )}

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>

          {/* Content section */}
          <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
            {/* Title section */}
            <div className="mb-2 h-10"> {/* Added fixed height for consistency */}
              <h3 className="text-white font-semibold text-sm sm:text-base leading-tight line-clamp-2 group-hover:text-gradient transition-all duration-300">
                {title}
              </h3>
            </div>
            
            {/* Metadata section */}
            <div className="space-y-2 mt-auto">
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span className="truncate">{new Date(date).getFullYear() || 'Unknown'}</span>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <span className="text-yellow-400">⭐</span>
                  <span className="text-yellow-300 font-medium">
                    {rating !== 'N/A' ? Number(rating).toFixed(1) : 'N/A'}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-start">
                <span className={`px-2 py-1 rounded-full text-xs font-medium truncate max-w-full ${
                  mediaType === 'tv' 
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' 
                    : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                }`}>
                  {mediaType === 'tv' ? 'TV Show' : 'Movie'}
                </span>
              </div>
            </div>
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
        className={`absolute top-2 right-2 glass-subtle p-2 rounded-full transition-all duration-300 touch-manipulation ${
          saved 
            ? 'text-amber-400 border border-amber-500/30' 
            : 'text-gray-400 border border-gray-500/30 hover:text-amber-400 hover:border-amber-500/30'
        }`}
      >
        {saved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
      </button>
    </motion.div>
  );
};

// Enhanced skeleton component with glassmorphism
const MovieCardSkeleton = () => (
  <motion.div 
    initial={{ opacity: 0 }} 
    animate={{ opacity: 1 }} 
    className="relative animate-fade-in"
  >
    <div className="glass-card rounded-2xl overflow-hidden h-full flex flex-col">
      {/* Image skeleton */}
      <div className="aspect-[2/3] bg-gradient-to-r from-gray-600/30 via-gray-500/30 to-gray-600/30 bg-[length:200%_100%] animate-shimmer flex-shrink-0"></div>
      
      {/* Content skeleton */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between min-h-[120px]">
        {/* Title skeleton */}
        <div className="mb-2 h-10"> {/* Added fixed height for consistency */}
          <div className="h-4 bg-gradient-to-r from-gray-600/30 via-gray-500/30 to-gray-600/30 animate-shimmer rounded w-full"></div>
          <div className="h-4 bg-gradient-to-r from-gray-600/30 via-gray-500/30 to-gray-600/30 animate-shimmer rounded w-3/4 mt-1"></div> {/* Added mt-1 for spacing */}
        </div>
        
        {/* Metadata skeleton */}
        <div className="space-y-2 mt-auto">
          <div className="flex justify-between items-center">
            <div className="h-3 bg-gradient-to-r from-gray-600/30 via-gray-500/30 to-gray-600/30 animate-shimmer rounded w-1/3"></div>
            <div className="h-3 bg-gradient-to-r from-gray-600/30 via-gray-500/30 to-gray-600/30 animate-shimmer rounded w-1/4"></div>
          </div>
          <div className="h-6 bg-gradient-to-r from-gray-600/30 via-gray-500/30 to-gray-600/30 animate-shimmer rounded-full w-1/2"></div>
        </div>
      </div>
      
      {/* Bookmark skeleton */}
      <div className="absolute top-2 right-2 w-8 h-8 bg-gradient-to-r from-gray-600/30 via-gray-500/30 to-gray-600/30 animate-shimmer rounded-full"></div>
    </div>
  </motion.div>
);

export default MovieCard;
export { MovieCardSkeleton };
