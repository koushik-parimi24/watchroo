import { useContext } from 'react';
import { WatchlistContext } from '@/context/WatchlistContext';
import MovieCard from './MovieCard';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';
const WatchList = () => {
  const { watchlist } = useContext(WatchlistContext);

  return (
    <main className="pt-28 px-6 min-h-screen bg-gradient-to-b from-black via-gray-900 to-black">
      <Navbar/>
      <h2 className="text-3xl font-bold text-white mb-6">My Watchlist</h2>

      {watchlist.length === 0 ? (
        <p className="text-gray-400">
          Your watchlist is empty. Start adding some titles!
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {watchlist.map((item) => (
            <Link
              key={item.media_id}
              to={`/${item.media_type}/${item.media_id}`}
              className="block hover:scale-105 transition-transform"
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
          ))}
        </div>
      )}
    </main>
  );
};

export default WatchList;
