// src/context/RecentlyWatchedContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';

const RecentlyWatchedContext = createContext();

export const useRecentlyWatched = () => {
  const context = useContext(RecentlyWatchedContext);
  if (!context) {
    throw new Error('useRecentlyWatched must be used within a RecentlyWatchedProvider');
  }
  return context;
};

export const RecentlyWatchedProvider = ({ children }) => {
  const [recentlyWatched, setRecentlyWatched] = useState([]);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('recentlyWatched');
    if (saved) {
      try {
        setRecentlyWatched(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading recently watched data:', error);
      }
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('recentlyWatched', JSON.stringify(recentlyWatched));
  }, [recentlyWatched]);

  const addToRecentlyWatched = (item) => {
    const watchedItem = {
      id: item.id,
      title: item.title || item.name,
      poster_path: item.poster_path,
      backdrop_path: item.backdrop_path,
      media_type: item.media_type || (item.title ? 'movie' : 'tv'),
      lastWatched: new Date().toISOString(),
      season: item.season || null,
      episode: item.episode || null,
      overview: item.overview || '',
      vote_average: item.vote_average || 0,
      release_date: item.release_date || item.first_air_date || ''
    };

    setRecentlyWatched(prev => {
      // Remove existing entry if it exists
      const filtered = prev.filter(w => 
        !(w.id === item.id && 
          w.season === (item.season || null) && 
          w.episode === (item.episode || null))
      );
      
      // Add new entry at the beginning (most recent)
      return [watchedItem, ...filtered].slice(0, 24); // Keep only last 24 items
    });
  };

  const removeFromRecentlyWatched = (id, season = null, episode = null) => {
    setRecentlyWatched(prev => 
      prev.filter(item => 
        !(item.id === id && 
          item.season === season && 
          item.episode === episode)
      )
    );
  };

  const clearAll = () => {
    setRecentlyWatched([]);
  };

  return (
    <RecentlyWatchedContext.Provider
      value={{
        recentlyWatched,
        addToRecentlyWatched,
        removeFromRecentlyWatched,
        clearAll
      }}
    >
      {children}
    </RecentlyWatchedContext.Provider>
  );
};
