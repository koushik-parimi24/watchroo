// src/context/ContinueWatchingContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';

const ContinueWatchingContext = createContext();

export const useContinueWatching = () => {
  const context = useContext(ContinueWatchingContext);
  if (!context) {
    throw new Error('useContinueWatching must be used within a ContinueWatchingProvider');
  }
  return context;
};

export const ContinueWatchingProvider = ({ children }) => {
  const [continueWatching, setContinueWatching] = useState([]);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('continueWatching');
    if (saved) {
      try {
        setContinueWatching(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading continue watching data:', error);
      }
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('continueWatching', JSON.stringify(continueWatching));
  }, [continueWatching]);

  const addToWatching = (item, progress = 0, currentTime = 0, duration = 0) => {
    const watchingItem = {
      id: item.id,
      title: item.title || item.name,
      poster_path: item.poster_path,
      backdrop_path: item.backdrop_path,
      media_type: item.media_type || (item.title ? 'movie' : 'tv'),
      progress: Math.min(progress, 100), // Ensure progress doesn't exceed 100%
      currentTime,
      duration,
      lastWatched: new Date().toISOString(),
      season: item.season || null,
      episode: item.episode || null
    };

    setContinueWatching(prev => {
      // Remove existing entry if it exists
      const filtered = prev.filter(w => 
        !(w.id === item.id && 
          w.season === (item.season || null) && 
          w.episode === (item.episode || null))
      );
      
      // Don't add if progress is less than 5% or more than 95% (considered finished)
      if (progress < 5 || progress > 95) {
        return filtered;
      }

      // Add new entry at the beginning (most recent)
      return [watchingItem, ...filtered].slice(0, 20); // Keep only last 20 items
    });
  };

  const removeFromWatching = (id, season = null, episode = null) => {
    setContinueWatching(prev => 
      prev.filter(item => 
        !(item.id === id && 
          item.season === season && 
          item.episode === episode)
      )
    );
  };

  const updateProgress = (id, progress, currentTime, duration, season = null, episode = null) => {
    setContinueWatching(prev => 
      prev.map(item => {
        if (item.id === id && item.season === season && item.episode === episode) {
          const newProgress = Math.min(progress, 100);
          
          // Remove if finished (>95%)
          if (newProgress > 95) {
            return null;
          }
          
          return {
            ...item,
            progress: newProgress,
            currentTime,
            duration,
            lastWatched: new Date().toISOString()
          };
        }
        return item;
      }).filter(Boolean)
    );
  };

  const clearAll = () => {
    setContinueWatching([]);
  };

  return (
    <ContinueWatchingContext.Provider
      value={{
        continueWatching,
        addToWatching,
        removeFromWatching,
        updateProgress,
        clearAll
      }}
    >
      {children}
    </ContinueWatchingContext.Provider>
  );
};
