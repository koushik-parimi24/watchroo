import { useRef, useState, useEffect } from 'react';

export default function Hero({
  showFilters,
  setShowFilters,
  isFiltering,
  isSearching,
  clearFilters,
}) {
  const videoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    // Autoplay video on mount (muted)
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.8;
      videoRef.current.play().catch(console.error);

      const slowDownTimeout = setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.playbackRate = 1;
        }
      }, 1000);

      return () => clearTimeout(slowDownTimeout);
    }
  }, []);

  const toggleSound = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  const shouldShowVideo = !isFiltering && !isSearching;

  return (
    <section className="relative w-full h-[70vh] sm:h-[80vh] md:h-[85vh] lg:h-[90vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden">
      {/* Background Media */}
      {shouldShowVideo ? (
        <video
          src="/hero.mp4"
          className="absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-500"
          playsInline
          loop
          muted={isMuted}
          ref={videoRef}
          preload="auto"
          style={{ transform: 'translate3d(0,0,0)' }}
        />
      ) : (
        <div
          className="absolute inset-0 w-full h-full object-cover object-center bg-cover bg-center transition-opacity duration-500"
          style={{ backgroundImage: 'url(\'/hero-bg.png\')' }}
        />
      )}

      {/* Overlays */}
      <div className="absolute inset-0 bg-black/40 sm:bg-black/30 md:bg-black/25 z-10" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60 z-10" />

      {/* Sound Toggle Button */}
      {shouldShowVideo && (
        <button
          onClick={toggleSound}
          className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 z-30 bg-black/60 hover:bg-black/80 text-white p-2 sm:p-3 rounded-full text-sm transition-all duration-200 hover:scale-110"
          aria-label={isMuted ? 'Unmute video' : 'Mute video'}
        >
          {isMuted ? '🔇' : '🔊'}
        </button>
      )}

      {/* Content */}
      <div className="relative z-20 max-w-4xl mx-auto flex flex-col items-center justify-center h-full">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4 animate-fade-in-up">
          Find{' '}
          <span className="text-gradient bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Movies
          </span>{' '}
          you'll enjoy
        </h1>

        <p className="text-white/90 text-sm sm:text-base md:text-lg mt-2 mb-8 max-w-2xl mx-auto animate-fade-in-up animation-delay-200">
          Discover the latest movies and TV shows with our powerful search and filter system
        </p>

      </div>
    </section>
  );
}
