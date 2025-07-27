import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { useSession } from '@supabase/auth-helpers-react';
import { useEffect } from 'react';
import Search from './Search';
import { useContext } from 'react';
import { WatchlistContext } from '@/context/WatchlistContext';

const Navbar = ({ searchTerm, setSearchTerm, onSearch }) => {
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
    <nav className="bg-black bg-opacity-70 backdrop-blur-md px-4 py-3 fixed top-0 w-full z-50 border-b border-white/10">
      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4">
        <img src="/headerlogo.png" alt="" className='w-16 h-16 hidden lg:block'/>
        <h1 className='text-white hidden lg:block text-4xl'>watchroo</h1>
        {/* Search Bar */}
        <div className="w-full flex justify-center">
          <Search
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onSearch={onSearch}
          />
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3 text-white">
          {/* Watchlist icon */}
          <div className="relative">
            <Link to="/watchlist">
              <svg width="26" height="26" className="text-amber-500 hover:scale-110 transition" viewBox="0 0 24 24" fill="currentColor">
                <path d="M5 3c-1.1 0-2 .9-2 2v16l9-4 9 4V5c0-1.1-.9-2-2-2H5z" />
              </svg>
              {watchlist.length > 0 && (
                <span className="absolute -top-1 -right-2 bg-red-600 rounded-full w-5 h-5 text-[10px] flex items-center justify-center text-white">
                  {watchlist.length}
                </span>
              )}
            </Link>
          </div>

          {/* Auth Buttons */}
          {session?.user ? (
            <>
              <span className="text-sm hidden sm:inline">Hi,{session.user.email.split('@')[0]}</span>
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
