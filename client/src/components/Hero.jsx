import { useRef, useState } from 'react';

export default function Hero({
  showFilters,
  setShowFilters,
  isFiltering,
  isSearching,
  clearFilters,
}) {
  const videoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true);

  const toggleSound = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  return (
    <section className="relative w-full h-[70vh] sm:h-[80vh] md:h-[85vh] lg:h-[90vh] overflow-hidden flex items-center justify-center text-center px-4">
      <video
        src="/hero.mp4"
        className="absolute inset-0 w-full h-full object-cover object-center"
        autoPlay
        loop
        playsInline
        muted
        ref={videoRef}
        muted={isMuted}
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
      <div className="relative z-20 max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
          Find <span className="text-gradient bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Movies</span> you'll enjoy
        </h1>

        <p className="text-white/90 text-sm sm:text-base md:text-lg mt-4 mb-6 max-w-2xl mx-auto">
          Discover the latest movies and TV shows with our powerful search and filter system
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg transition-colors text-sm sm:text-base font-medium"
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>

          {(isFiltering || isSearching) && (
            <button
              onClick={clearFilters}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg transition-colors text-sm sm:text-base font-medium"
            >
              Clear All
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
