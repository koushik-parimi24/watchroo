import { createContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export const WatchlistContext = createContext();

export const WatchlistProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [watchlist, setWatchlist] = useState([]);

  // Auth listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data?.session?.user ?? null);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_e, sess) => {
      setUser(sess?.user ?? null);
    });

    return () => sub?.subscription?.unsubscribe();
  }, []);

  // Load watchlist
  const load = async () => {
    if (!user) return setWatchlist([]);
    const { data, error } = await supabase
      .from('watchlists')
      .select('*')
      .eq('user_id', user.id)
      .order('inserted_at', { ascending: false });

    if (error) {
      console.error('Failed to load watchlist:', error.message);
    } else {
      setWatchlist(data ?? []);
    }
  };

  useEffect(() => {
    load();
  }, [user]);

  // Add movie (optimistic update)
  const add = async (item) => {
    if (!user) return;

    const newItem = {
      user_id: user.id,
      media_id: item.id,
      media_type: item.media_type ?? (item.title ? 'movie' : 'tv'),
      title: item.original_title || item.original_name,
      original_title: item.original_title,
      original_name: item.original_name,
      poster_path: item.poster_path,
      release_date: item.release_date || item.first_air_date,
      first_air_date: item.first_air_date,
      vote_average: item.vote_average,
    };

    const { error } = await supabase
      .from('watchlists')
      .upsert(newItem, { onConflict: ['user_id', 'media_id'] });

    if (error) {
      console.error('Add error:', error.message);
    } else {
      setWatchlist((prev) => [newItem, ...prev.filter(w => w.media_id !== newItem.media_id)]);
    }
  };

  // Remove movie (optimistic update)
  const remove = async (media_id) => {
    if (!user) return;

    const { error } = await supabase
      .from('watchlists')
      .delete()
      .match({ user_id: user.id, media_id });

    if (error) {
      console.error('Remove error:', error.message);
    } else {
      setWatchlist((prev) => prev.filter((w) => w.media_id !== media_id));
    }
  };

  return (
    <WatchlistContext.Provider value={{ watchlist, add, remove }}>
      {children}
    </WatchlistContext.Provider>
  );
};
