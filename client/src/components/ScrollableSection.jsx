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
      <div className="mb-12 sm:mb-16 animate-fade-in">
        <div className="content-padding">
          <h2 className="text-white text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-gradient">{title}</h2>
        </div>
        <div className="content-padding">
          <div className="flex overflow-x-auto scrollbar-hide gap-4 sm:gap-6 pb-4">
            {Array.from({ length: skeletonCount }).map((_, index) => (
              <div 
                key={index} 
                className="flex-shrink-0 w-48 sm:w-56 md:w-64 lg:w-72 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="glass-card rounded-2xl overflow-hidden">
                  <div className="aspect-[2/3] bg-gradient-to-r from-gray-600/30 via-gray-500/30 to-gray-600/30 bg-[length:200%_100%] animate-shimmer"></div>
                  <div className="card-spacing space-y-2">
                    <div className="h-5 bg-gradient-to-r from-gray-600/30 via-gray-500/30 to-gray-600/30 animate-shimmer rounded w-3/4"></div>
                    <div className="h-3 bg-gradient-to-r from-gray-600/30 via-gray-500/30 to-gray-600/30 animate-shimmer rounded w-1/2"></div>
                    <div className="h-6 bg-gradient-to-r from-gray-600/30 via-gray-500/30 to-gray-600/30 animate-shimmer rounded-full w-1/3"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-12 sm:mb-16 animate-fade-in">
      <div className="content-padding">
        <h2 className="text-white text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-gradient">{title}</h2>
      </div>
      
      <div className="relative group">
        <div 
          className="flex overflow-x-auto scrollbar-hide gap-4 sm:gap-6 content-padding pb-4 smooth-scroll" 
          id={containerId}
        >
          {items.map((item, index) => (
            <div 
              key={item.id} 
              className="flex-shrink-0 w-48 sm:w-56 md:w-64 lg:w-72 animate-slide-up h-auto"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <MovieCardComponent movie={item} />
            </div>
          ))}
        </div>
        
        {/* Enhanced Scroll Buttons */}
        <button
          onClick={() => smoothScroll(containerId, 'left')}
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 glass-hover w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 hover:scale-110 touch-manipulation"
        >
          <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
          </svg>
        </button>
        <button
          onClick={() => smoothScroll(containerId, 'right')}
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 glass-hover w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 hover:scale-110 touch-manipulation"
        >
          <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ScrollableSection; 