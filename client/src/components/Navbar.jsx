import React, { useState, useEffect, useContext } from 'react';
import { supabase } from '@/lib/supabaseClient.js';
import { Link, useNavigate } from 'react-router-dom';
import { WatchlistContext } from '@/context/WatchlistContext';

const Navbar = () => {
  const { watchlist } = useContext(WatchlistContext);
  const [session, setSession] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);

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

  return (
    <nav className="fixed top-0 left-0 w-full bg-black/30 backdrop-blur-md z-50 px-4 py-3">
      <div className="flex flex-wrap justify-between items-center">
        {/* Logo and Title */}
        <Link to="/" className="flex items-center gap-2 mb-2 sm:mb-0">
          <img src="/headerlogo.png" alt="Logo" className="w-[40px] h-[40px]" />
          <h1 className="text-xl font-bold text-white">Watchroo</h1>
        </Link>

        {/* Right Side: Login/Logout + Watchlist */}
        <div className="flex items-center gap-4 text-white">
          {/* Watchlist Icon */}
          <div className="relative">
            <Link to="/watchlist">
              <svg
                width="26"
                height="26"
                className="text-amber-500 hover:scale-110 transition"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M5 3c-1.1 0-2 .9-2 2v16l9-4 9 4V5c0-1.1-.9-2-2-2H5z" />
              </svg>
              {watchlist.length > 0 && (
                <span className="absolute -top-1 -right-2 bg-red-600 rounded-full w-5 h-5 text-[10px] flex items-center justify-center text-white">
                  {watchlist.length}
                </span>
              )}
            </Link>
          </div>

          {/* User Section */}
          {session?.user ? (
            <>
              <span className="text-sm hidden sm:inline">Hi, {session.user.email.split('@')[0]}</span>
              <button
                onClick={handleLogout}
                className="bg-red-500 px-3 py-1 text-sm rounded hover:bg-red-400 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={handleLogin}
              className="bg-blue-600 px-3 py-1 text-sm rounded hover:bg-blue-500 transition"
            >
              Login
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
