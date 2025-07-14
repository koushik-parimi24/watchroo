import React from 'react'
import { useState,useEffect,useContext } from 'react';
import {supabase} from "@/lib/supabaseClient.js";
import { Link, useNavigate } from 'react-router-dom'; 
import { WatchlistContext } from '@/context/WatchlistContext'; //
const Navbar = () => {
   const { watchlist } = useContext(WatchlistContext);
      useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google' });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };
      const [session, setSession] = useState([]);
  return (
    <nav className="fixed top-0 left-0 w-full px-6 py-4 bg-black/30 backdrop-blur-md flex justify-between z-50">

    <Link to="/" className="flex items-center space-x-3">
    <img src="/headerlogo.png" alt="Logo" className="w-[50px] h-[40px]" />
    <h1 className="text-2xl font-bold text-white">Watchroo</h1>
    </Link>
  <div >
        {/* watch‑list button */}
        <Link to="/watchlist" >
          {/* any icon you like */}
          <svg width="28" height="28" className="text-amber-600 group-hover:scale-110 transition" viewBox="0 0 24 24" fill="currentColor"><path d="M5 3c-1.1 0-2 .9-2 2v16l9-4 9 4V5c0-1.1-.9-2-2-2H5z"/></svg>
          {watchlist.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-600 rounded-full w-5 h-5 text-[10px] flex items-center justify-center">
              {watchlist.length}
            </span>
          )}
        </Link>
  </div>
    {session?.user ? (
        <div className="flex items-center gap-4">
          <span className="text-sm text-white">Hi, {session.user.email.split('@')[0]}</span>
          <button onClick={handleLogout} className="bg-red-500 px-4 py-1 rounded hover:bg-red-100 transition-all duration-200 ease-linear">
            Logout
          </button>
        </div>
    ) : (
        <button onClick={handleLogin} className="bg-blue-600 px-4 py-1 hover:bg-blue-100 rounded transition-all duration-200 ease-linear">
          Login
        </button>
    )}
  </nav>
  )
}

export default Navbar