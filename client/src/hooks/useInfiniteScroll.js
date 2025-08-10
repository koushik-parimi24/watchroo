import { useEffect, useState, useCallback } from 'react';

export const useInfiniteScroll = (loadMore, hasMore, threshold = 100) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleScroll = useCallback(async () => {
    // Don't trigger if already loading or no more content
    if (isLoading || !hasMore) return;

    const scrollTop = window.pageYOffset;
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = window.innerHeight;

    // Check if user is near the bottom (within threshold pixels)
    if (scrollTop + clientHeight >= scrollHeight - threshold) {
      setIsLoading(true);
      try {
        await loadMore();
      } catch (error) {
        console.error('Error loading more content:', error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [loadMore, hasMore, isLoading, threshold]);

  useEffect(() => {
    const throttledScrollHandler = throttle(handleScroll, 200);
    
    window.addEventListener('scroll', throttledScrollHandler);
    return () => window.removeEventListener('scroll', throttledScrollHandler);
  }, [handleScroll]);

  return { isLoading };
};

// Throttle function to limit how often scroll events are processed
const throttle = (func, delay) => {
  let timeoutId;
  let lastExecTime = 0;
  
  return function (...args) {
    const currentTime = Date.now();
    
    if (currentTime - lastExecTime > delay) {
      func.apply(this, args);
      lastExecTime = currentTime;
    } else {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func.apply(this, args);
        lastExecTime = Date.now();
      }, delay - (currentTime - lastExecTime));
    }
  };
};
