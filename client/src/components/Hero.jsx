import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function Hero({
  showFilters,
  setShowFilters,
  isFiltering,
  isSearching,
  clearFilters,
}) {
  const videoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true);
  const [shouldPlay, setShouldPlay] = useState(false);

  // Delay video playback until text animations complete
  useEffect(() => {
    const timer = setTimeout(() => {
      setShouldPlay(true);
      if (videoRef.current) {
        // Reduce video quality for better performance during animations
        videoRef.current.playbackRate = 0.8;
        videoRef.current.play().catch(console.error);
        
        // Restore normal playback rate after animations complete
        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.playbackRate = 1;
          }
        }, 1000);
      }
    }, 2500); // Increased delay to let animations fully complete

    return () => clearTimeout(timer);
  }, []);

  const toggleSound = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  return (
    <section className="relative w-full h-[70vh] sm:h-[80vh] md:h-[85vh] lg:h-[90vh] overflow-hidden flex items-center justify-center text-center px-4">
      <video
        src="/hero1.mp4"
        className="absolute inset-0 w-full h-full object-cover object-center"
        loop
        playsInline
        muted
        ref={videoRef}
        preload="metadata"
        style={{
          willChange: 'auto',
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden'
        }}
      />

      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/40 sm:bg-black/30 md:bg-black/25 z-10" />
      
      {/* Gradient overlay for better text contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60 z-10" />

      {/* Sound toggle button - responsive positioning */}
      <button
        onClick={toggleSound}
        className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 z-30 bg-black/60 hover:bg-black/80 text-white p-2 sm:p-3 rounded-full text-sm transition-all duration-200 hover:scale-110"
      >
        {isMuted ? '🔇' : '🔊'}
      </button>

      {/* Main content */}
      <div
        className="relative z-20 max-w-4xl mx-auto"
        style={{
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
          perspective: '1000px'
        }}
      >
        <motion.h1
          initial={{ x: -200, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{
            duration: 0.8,
            ease: [0.25, 0.46, 0.45, 0.94],
            delay: 0.2
          }}
          style={{ willChange: 'transform, opacity' }}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight"
        >
          Find <motion.span
            initial={{ x: 200, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{
              duration: 0.8,
              ease: [0.25, 0.46, 0.45, 0.94],
              delay: 0.5
            }}
            style={{ willChange: 'transform, opacity' }}
            className="text-gradient bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent"
          >
            Movies
          </motion.span> you'll enjoy
        </motion.h1>

        <motion.p
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            duration: 0.6,
            ease: [0.25, 0.46, 0.45, 0.94],
            delay: 0.8
          }}
          style={{ willChange: 'transform, opacity' }}
          className="text-white/90 text-sm sm:text-base md:text-lg mt-4 mb-6 max-w-2xl mx-auto"
        >
          Discover the latest movies and TV shows with our powerful search and filter system
        </motion.p>

        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            duration: 0.5,
            ease: [0.25, 0.46, 0.45, 0.94],
            delay: 1.1
          }}
          style={{ willChange: 'transform, opacity' }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4"
        >
          <motion.button
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              duration: 0.4,
              ease: [0.25, 0.46, 0.45, 0.94],
              delay: 1.3
            }}
            whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
            whileTap={{ scale: 0.95, transition: { duration: 0.1 } }}
            style={{ willChange: 'transform, opacity' }}
            onClick={() => setShowFilters(!showFilters)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg transition-colors text-sm sm:text-base font-medium"
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </motion.button>

          {(isFiltering || isSearching) && (
            <motion.button
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{
                duration: 0.3,
                ease: [0.25, 0.46, 0.45, 0.94]
              }}
              whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
              whileTap={{ scale: 0.95, transition: { duration: 0.1 } }}
              style={{ willChange: 'transform, opacity' }}
              onClick={clearFilters}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg transition-colors text-sm sm:text-base font-medium"
            >
              Clear All
            </motion.button>
          )}
        </motion.div>
      </div>
    </section>
  );
}
