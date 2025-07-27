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
    <section className="relative w-full h-[90vh] overflow-hidden flex items-center justify-center text-center px-4">
   <video
  src="/hero.mp4"
  className="absolute inset-0 w-full h-full object-cover"
  autoPlay
  loop
  playsInline
  ref={videoRef}
  muted={isMuted} // this alone is correct
>
    </video>


      <div className="absolute inset-0 bg-black/50 z-10" />
      <div className="absolute bottom-0 w-full h-32 bg-gradient-to-b from-transparent to-black z-10" />

      <button
        onClick={toggleSound}
        className="absolute bottom-5 right-5 z-30 bg-black/60 hover:bg-black/80 text-white px-4 py-2 rounded-full text-sm transition"
      >
        {isMuted ? '🔇' : '🔊'}
      </button>

      <div className="relative z-20">
        <h1 className="text-4xl md:text-5xl font-bold text-white">
          Find <span className="text-gradient">Movies</span> you'll enjoy
        </h1>

        <div className="flex flex-col items-center gap-4 mt-6">
    

          <div className="flex gap-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>

            {(isFiltering || isSearching) && (
              <button
                onClick={clearFilters}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Clear All
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
