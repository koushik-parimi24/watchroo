import { useContext } from 'react';
import { WatchlistContext } from '@/context/WatchlistContext';
import MovieCard from './MovieCard';
import { Link } from 'react-router-dom';

const WatchList = () => {
  const { watchlist } = useContext(WatchlistContext);

  return (
    <main className="pt-28 px-6 min-h-screen bg-gradient-to-b from-black via-gray-900 to-black">
      
      <h2 className="text-3xl font-bold text-white mb-6">My Watchlist</h2>

      {watchlist.length === 0 ? (
        <p className="text-gray-400">Your watchlist is empty. Start adding some titles!</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {watchlist.map((item) => (
            <Link
              key={item.id}                                       // row id is fine for React keys
              to={`/${item.media_type}/${item.tmdb_id}`}          // 👈 **THE IMPORTANT BIT**
              className="block hover:scale-105 transition-transform"
            >
              <MovieCard movie={item} />
            </Link>

          ))}
        </div>
      )}
    </main>
  );
};

export default WatchList;
