import { useState } from 'react';

const LoadMoreButton = ({ onLoadMore, loading, hasMore, children }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    if (loading || isLoading) return;
    
    setIsLoading(true);
    try {
      await onLoadMore();
    } finally {
      setIsLoading(false);
    }
  };

  if (!hasMore) return null;

  return (
    <div className="flex justify-center py-8">
      <button
        onClick={handleClick}
        disabled={loading || isLoading}
        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg transition-colors duration-200 font-medium flex items-center gap-2"
      >
        {loading || isLoading ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Loading...
          </>
        ) : (
          <>
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            {children || 'Load More'}
          </>
        )}
      </button>
    </div>
  );
};

export default LoadMoreButton; 