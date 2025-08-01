import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { useSession } from '@supabase/auth-helpers-react';
import { useEffect } from 'react';
import Search from './Search';
import { useContext } from 'react';
import { WatchlistContext } from '@/context/WatchlistContext';

const Navbar = ({ searchTerm, setSearchTerm, onSearch, onLogoClick }) => {
  const session = useSession();
  const { watchlist } = useContext(WatchlistContext); // ✅ Access watchlist from context

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google' });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('user');
    window.location.reload();
  };

  useEffect(() => {
    if (session?.user) {
      localStorage.setItem('user', JSON.stringify(session.user));
    }
  }, [session]);

  return (
    <nav className="bg-black/20 backdrop-blur-md px-4 py-2 fixed top-0 w-full z-50 border-b border-white/10">
      <div className="w-full flex items-center justify-between gap-3 ">
        {/* Logo and Brand - Clickable to home */}
        <button 
          onClick={onLogoClick}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity "
        >
          <img src="/headerlogo.png" alt="Watchroo" className='w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 block sm:hidden'/>
          <h1 className='text-white text-xl sm:text-2xl lg:text-3xl font-bold hidden sm:block'>watchroo</h1>
        </button>
        
        {/* Search Bar - Centered on larger screens */}
        <div className="flex-1 max-w-md lg:max-w-lg mx-4">
          <Search
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onSearch={onSearch}
          />
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 sm:gap-3 text-white">
                    {/* Auth Buttons */}
                    {session?.user ? (
            <>
              <span className="text-xs sm:text-sm hidden sm:inline">Hi, {session.user.email.split('@')[0]}</span>
              <button
                onClick={handleLogout}
                className="bg-red-500 px-2 py-1 text-xs sm:text-sm rounded hover:bg-red-400 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={handleLogin}
              className="bg-blue-600 px-2 py-1 text-xs sm:text-sm rounded hover:bg-blue-500 transition"
            >
              Login
            </button>
          )}
          {/* Watchlist icon */}
          <div className="relative">
            <Link to="/watchlist">
              <svg width="22" height="22" className="text-amber-500 hover:scale-110 transition" viewBox="0 0 24 24" fill="currentColor">
                <path d="M5 3c-1.1 0-2 .9-2 2v16l9-4 9 4V5c0-1.1-.9-2-2-2H5z" />
              </svg>
              {watchlist.length > 0 && (
                <span className="absolute -top-1 -right-2 bg-red-600 rounded-full w-4 h-4 text-[8px] flex items-center justify-center text-white">
                  {watchlist.length}
                </span>
              )}
            </Link>
          </div>


        </div>
      </div>
    </nav>
  );
};

export default Navbar;
