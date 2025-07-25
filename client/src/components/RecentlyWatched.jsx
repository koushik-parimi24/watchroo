// src/components/RecentlyWatched.jsx
import { Link } from 'react-router-dom';
import { useRecentlyWatched } from '@/context/RecentlyWatchedContext';
import { formatDistanceToNow } from 'date-fns';

const RecentlyWatched = () => {
  const { recentlyWatched, removeFromRecentlyWatched } = useRecentlyWatched();

  if (recentlyWatched.length === 0) {
    return null;
  }

  const getDetailUrl = (item) => {
    const baseUrl = `/${item.media_type}/${item.id}`;
    return baseUrl;
  };

  return (
    <section className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Recently Watched
        </h2>
        <div className="text-purple-400 text-sm font-medium bg-purple-400/10 px-3 py-1 rounded-full border border-purple-400/20">
          🕒 Recent
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        {recentlyWatched.map((item) => (
          <div
            key={`${item.id}-${item.season || 0}-${item.episode || 0}`}
            className="group relative bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden shadow-xl hover:shadow-2xl transition-all hover:scale-105"
          >
            <Link to={getDetailUrl(item)} className="block">
              {/* Thumbnail */}
              <div className="relative">
                <img
                  src={
                    item.poster_path
                      ? `https://image.tmdb.org/t/p/w342${item.poster_path}`
                      : '/placeholder.png'
                  }
                  alt={item.title}
                  className="w-full h-64 object-cover"
                />
                
                {/* Play overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="bg-white/20 backdrop-blur-sm rounded-full p-3 border border-white/30">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                </div>

                {/* Media type badge */}
                <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm rounded-full px-2 py-1 text-xs font-medium">
                  {item.media_type === 'tv' ? '📺 TV' : '🎬 Movie'}
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="text-white font-semibold text-sm mb-2 line-clamp-2 group-hover:text-purple-400 transition-colors">
                  {item.title}
                  {item.season && item.episode && (
                    <span className="text-gray-400 text-xs block mt-1">
                      S{item.season} E{item.episode}
                    </span>
                  )}
                </h3>
                
                <div className="space-y-1 text-xs text-gray-300">
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-400">⭐</span>
                    <span>{item.vote_average.toFixed(1)}</span>
                  </div>
                  
                  <p className="text-gray-400">
                    Watched {formatDistanceToNow(new Date(item.lastWatched), { addSuffix: true })}
                  </p>
                </div>
              </div>
            </Link>

            {/* Remove button */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                removeFromRecentlyWatched(item.id, item.season, item.episode);
              }}
              className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default RecentlyWatched;
