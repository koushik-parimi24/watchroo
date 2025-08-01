import { useSmoothScroll } from '../hooks/useSmoothScroll';

const ScrollableSection = ({ 
  title, 
  items, 
  containerId, 
  loading, 
  skeletonCount = 8,
  MovieCardComponent 
}) => {
  const { smoothScroll } = useSmoothScroll();

  if (loading) {
    return (
      <div className="mb-8">
        <h2 className="text-white text-2xl mb-4 px-4">{title}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 py-8">
          {Array.from({ length: skeletonCount }).map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-gray-700 rounded-lg h-64"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <h2 className="text-white text-2xl mb-4 px-4">{title}</h2>
      <div className="relative group">
        <div 
          className="flex overflow-x-auto scrollbar-hide gap-4 px-4 pb-4" 
          id={containerId}
        >
          {items.map((item) => (
            <div key={item.id} className="flex-shrink-0 w-48 sm:w-56 md:w-64 lg:w-72">
              <MovieCardComponent movie={item} />
            </div>
          ))}
        </div>
        
        {/* Scroll Buttons */}
        <button
          onClick={() => smoothScroll(containerId, 'left')}
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
        >
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
          </svg>
        </button>
        <button
          onClick={() => smoothScroll(containerId, 'right')}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
        >
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ScrollableSection; 