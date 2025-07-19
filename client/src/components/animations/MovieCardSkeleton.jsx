import { motion } from 'framer-motion';

const MovieCardSkeleton = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative animate-pulse"
    >
      <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl shadow-lg">
        {/* Poster skeleton */}
        <div className="w-full h-72 bg-gray-600/50 rounded mb-3"></div>
        
        {/* Title skeleton */}
        <div className="h-6 bg-gray-600/50 rounded mb-2 w-3/4"></div>
        
        {/* Release date skeleton */}
        <div className="h-4 bg-gray-600/50 rounded mb-1 w-1/2"></div>
        
        {/* Media type skeleton */}
        <div className="h-3 bg-gray-600/50 rounded mb-1 w-1/3"></div>
        
        {/* Rating skeleton */}
        <div className="h-4 bg-gray-600/50 rounded w-1/4"></div>
      </div>
      
      {/* Bookmark button skeleton */}
      <div className="absolute top-3 right-3 w-10 h-10 bg-gray-600/50 rounded-full"></div>
    </motion.div>
  );
};

export default MovieCardSkeleton;
