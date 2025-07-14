import { createContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export const WatchlistContext = createContext();

export const WatchlistProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [watchlist, setWatchlist] = useState([]);

  /* ---------- auth listener ---------- */
  useEffect(() => {
    setUser(supabase.auth.getSession().data?.session?.user ?? null);

    const { data: sub } = supabase.auth.onAuthStateChange((_e, sess) =>
      setUser(sess?.user ?? null)
    );
    return () => sub?.unsubscribe();
  }, []);

  /* ---------- data ---------- */
  const load = async () => {
    if (!user) return setWatchlist([]);
    const { data } = await supabase
      .from('watchlists')
      .select('*')
      .eq('user_id', user.id)
      .order('inserted_at', { ascending: false });
    setWatchlist(data ?? []);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const add = async (item) => {
    if (!user) return;
    await supabase.from('watchlists').upsert(
      {
        user_id: user.id,
        media_id: item.id,
        media_type: item.media_type ?? (item.title ? 'movie' : 'tv'),
        title: item.original_title || item.original_name,
        poster_path: item.poster_path,
        release_date: item.release_date || item.first_air_date,
      },
      { onConflict: ['user_id', 'media_id'] }
    );
    load();
  };

  const remove = async (media_id) => {
    if (!user) return;
    await supabase.from('watchlists')
      .delete()
      .match({ user_id: user.id, media_id });
    load();
  };

  return (
    <WatchlistContext.Provider value={{ watchlist, add, remove }}>
      {children}
    </WatchlistContext.Provider>
  );
};
