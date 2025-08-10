import { useContext, useState } from 'react';
import { WatchlistContext } from '@/context/WatchlistContext';
import MovieCard from './MovieCard';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';

const WatchList = () => {
  const { watchlist } = useContext(WatchlistContext);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  // Handle search navigation
  const handleSearch = () => {
    if (searchTerm.trim()) {
      navigate(`/?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <div className="min-h-screen text-white animate-fade-in">
      <Navbar 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onSearch={handleSearch}
        onLogoClick={() => {
          setSearchTerm('');
          navigate('/');
        }}
      />
      
      <main className="pt-20 sm:pt-24 md:pt-28">
      <div className="content-padding pb-20">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-8 sm:mb-12 animate-slide-up my-3">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gradient mb-4">
              📚 Watchlist
            </h1>
            <p className="text-gray-300 text-lg">
              {watchlist.length > 0 
                ? `${watchlist.length} item${watchlist.length !== 1 ? 's' : ''} saved for later`
                : 'Your personal collection of movies and shows to watch'
              }
            </p>
          </div>

          {watchlist.length === 0 ? (
            <div className="glass rounded-3xl card-spacing text-center animate-slide-up">
              <div className="max-w-md mx-auto">
                <div className="text-6xl mb-6 animate-float">🍿</div>
                <h3 className="text-xl sm:text-2xl font-semibold text-white mb-4">
                  Your watchlist is empty
                </h3>
                <p className="text-gray-400 mb-6">
                  Start exploring and add some amazing movies and TV shows to your collection!
                </p>
                <Link 
                  to="/" 
                  className="glass-hover inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all duration-300 border border-white/20"
                >
                  <span>🔍</span>
                  Discover Movies
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6 animate-slide-up">
              {watchlist.map((item, index) => (
                <div
                  key={item.media_id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <Link
                    to={`/${item.media_type}/${item.media_id}`}
                    className="block hover:scale-105 transition-transform duration-300 touch-manipulation"
                  >
                    <MovieCard
                      movie={{
                        ...item,
                        id: item.media_id, // ensure compatibility
                        original_title: item.original_title || item.title,
                        original_name: item.original_name,
                        vote_average: item.vote_average,
                        media_type: item.media_type,
                        poster_path: item.poster_path,
                        release_date: item.release_date,
                        first_air_date: item.first_air_date,
                      }}
                    />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      </main>
    </div>
  );
};

export default WatchList;
