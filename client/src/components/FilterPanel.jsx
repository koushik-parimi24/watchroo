import { useState } from 'react';

const FilterPanel = ({ filters, genres, onFilterChange }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleFilterUpdate = (key, value) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const sortOptions = [
    { value: 'popularity.desc', label: 'Most Popular' },
    { value: 'popularity.asc', label: 'Least Popular' },
    { value: 'vote_average.desc', label: 'Highest Rated' },
    { value: 'vote_average.asc', label: 'Lowest Rated' },
    { value: 'release_date.desc', label: 'Newest First' },
    { value: 'release_date.asc', label: 'Oldest First' },
    { value: 'title.asc', label: 'A-Z' },
    { value: 'title.desc', label: 'Z-A' }
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

  return (
    <div className="glass rounded-2xl content-padding section-spacing animate-slide-up">
      <div className="max-w-7xl mx-auto">
        <h3 className="text-xl sm:text-2xl font-bold mb-6 text-gradient">Filters</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
          {/* Media Type Filter */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">Type</label>
            <select
              value={localFilters.mediaType}
              onChange={(e) => handleFilterUpdate('mediaType', e.target.value)}
              className="w-full p-3 rounded-xl glass-subtle text-white border border-white/10 focus:border-blue-400/50 focus:outline-none transition-all duration-300 touch-manipulation"
            >
              <option value="all">All</option>
              <option value="movie">Movies</option>
              <option value="tv">TV Shows</option>
            </select>
          </div>

          {/* Genre Filter */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">Genre</label>
            <select
              value={localFilters.genre}
              onChange={(e) => handleFilterUpdate('genre', e.target.value)}
              className="w-full p-3 rounded-xl glass-subtle text-white border border-white/10 focus:border-blue-400/50 focus:outline-none transition-all duration-300 touch-manipulation"
            >
              <option value="">All Genres</option>
              {genres.map((genre) => (
                <option key={genre.id} value={genre.id}>
                  {genre.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By Filter */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">Sort By</label>
            <select
              value={localFilters.sortBy}
              onChange={(e) => handleFilterUpdate('sortBy', e.target.value)}
              className="w-full p-3 rounded-xl glass-subtle text-white border border-white/10 focus:border-blue-400/50 focus:outline-none transition-all duration-300 touch-manipulation"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Year Filter */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">Year</label>
            <select
              value={localFilters.year}
              onChange={(e) => handleFilterUpdate('year', e.target.value)}
              className="w-full p-3 rounded-xl glass-subtle text-white border border-white/10 focus:border-blue-400/50 focus:outline-none transition-all duration-300 touch-manipulation"
            >
              <option value="">All Years</option>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            {localFilters.year && (
              <p className="text-xs text-blue-300 mt-1 animate-fade-in">
                🗓️ Filtering by: {localFilters.year}
              </p>
            )}
          </div>

          {/* Rating Filter */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">Min Rating</label>
            <select
              value={localFilters.rating}
              onChange={(e) => handleFilterUpdate('rating', e.target.value)}
              className="w-full p-3 rounded-xl glass-subtle text-white border border-white/10 focus:border-blue-400/50 focus:outline-none transition-all duration-300 touch-manipulation"
            >
              <option value="">Any Rating</option>
              <option value="7">7+ Stars</option>
              <option value="8">8+ Stars</option>
              <option value="9">9+ Stars</option>
            </select>
          </div>
        </div>

        {/* Active filters summary */}
        <div className="mt-6 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300">
              🎯 Active filters: <span className="text-blue-300 font-medium">
                {Object.values(localFilters).filter(v => v && v !== 'all' && v !== 'popularity.desc').length}
              </span>
            </span>
            {Object.values(localFilters).filter(v => v && v !== 'all' && v !== 'popularity.desc').length > 0 && (
              <div className="flex flex-wrap gap-2">
                {localFilters.mediaType && localFilters.mediaType !== 'all' && (
                  <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full border border-blue-500/30">
                    {localFilters.mediaType === 'tv' ? 'TV Shows' : 'Movies'}
                  </span>
                )}
                {localFilters.genre && (
                  <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full border border-purple-500/30">
                    {genres.find(g => g.id.toString() === localFilters.genre)?.name || 'Genre'}
                  </span>
                )}
                {localFilters.year && (
                  <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded-full border border-green-500/30">
                    {localFilters.year}
                  </span>
                )}
                {localFilters.rating && (
                  <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 text-xs rounded-full border border-yellow-500/30">
                    {localFilters.rating}+ ⭐
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;
