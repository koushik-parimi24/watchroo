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
    <nav className="glass fixed top-0 w-full z-50 border-b border-white/10 transition-all duration-300">
      <div className="content-padding py-3 sm:py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo and Brand - Clickable to home */}
          <button 
            onClick={onLogoClick}
            className="flex items-center gap-3 hover:opacity-80 transition-all duration-300 group touch-manipulation"
          >
            <div className="relative">
              <img 
                src="/headerlogo.png" 
                alt="Watchroo" 
                className='w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 transition-transform duration-300 group-hover:scale-110'
              />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-500/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse"></div>
            </div>
            <h1 className='text-white text-xl sm:text-2xl lg:text-3xl font-bold hidden sm:block text-gradient'>
              watchroo
            </h1>
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
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Auth Buttons */}
            {session?.user ? (
              <>
                <span className="text-xs sm:text-sm hidden md:inline text-gray-300 truncate max-w-20">
                  Hi, {session.user.email.split('@')[0]}
                </span>
                <button
                  onClick={handleLogout}
                  className="glass-hover px-3 py-2 text-xs sm:text-sm rounded-lg text-white border border-red-500/20 hover:border-red-500/40 transition-all duration-300 touch-manipulation"
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={handleLogin}
                className="glass-hover px-3 py-2 text-xs sm:text-sm rounded-lg text-white border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300 touch-manipulation"
              >
                Login
              </button>
            )}
            
            {/* Watchlist icon */}
            <div className="relative">
              <Link to="/watchlist" className="block touch-manipulation">
                <div className="relative p-2 rounded-lg glass-hover transition-all duration-300 group">
                  <svg 
                    width="20" 
                    height="20" 
                    className="text-amber-400 group-hover:text-amber-300 transition-colors duration-300" 
                    viewBox="0 0 24 24" 
                    fill="currentColor"
                  >
                    <path d="M5 3c-1.1 0-2 .9-2 2v16l9-4 9 4V5c0-1.1-.9-2-2-2H5z" />
                  </svg>
                  {watchlist.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-red-600 rounded-full w-5 h-5 text-[10px] flex items-center justify-center text-white font-bold border border-white/20 shadow-lg animate-pulse">
                      {watchlist.length > 9 ? '9+' : watchlist.length}
                    </span>
                  )}
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
