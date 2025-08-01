import { useCallback } from 'react';

export const useSmoothScroll = () => {
  const smoothScroll = useCallback((containerId, direction) => {
    const container = document.getElementById(containerId);
    if (!container) return;

    const scrollAmount = container.clientWidth * 0.8;
    const startPosition = container.scrollLeft;
    const targetPosition = direction === 'left' 
      ? startPosition - scrollAmount 
      : startPosition + scrollAmount;
    
    const animateScroll = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / 600, 1);
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      
      container.scrollLeft = startPosition + (targetPosition - startPosition) * easeOutCubic;
      
      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      }
    };
    
    const startTime = performance.now();
    requestAnimationFrame(animateScroll);
  }, []);

  return { smoothScroll };
}; 