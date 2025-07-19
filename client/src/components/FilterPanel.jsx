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
    <div className="bg-gray-800 bg-opacity-90 rounded-lg p-6 mb-8 text-white">
      <h3 className="text-xl font-bold mb-4">Filters</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Media Type Filter */}
        <div>
          <label className="block text-sm font-medium mb-2">Type</label>
          <select
            value={localFilters.mediaType}
            onChange={(e) => handleFilterUpdate('mediaType', e.target.value)}
            className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-blue-500"
          >
            <option value="all">All</option>
            <option value="movie">Movies</option>
            <option value="tv">TV Shows</option>
          </select>
        </div>

        {/* Genre Filter */}
        <div>
          <label className="block text-sm font-medium mb-2">Genre</label>
          <select
            value={localFilters.genre}
            onChange={(e) => handleFilterUpdate('genre', e.target.value)}
            className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-blue-500"
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
        <div>
          <label className="block text-sm font-medium mb-2">Sort By</label>
          <select
            value={localFilters.sortBy}
            onChange={(e) => handleFilterUpdate('sortBy', e.target.value)}
            className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-blue-500"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Year Filter */}
  <div>
  <label className="block text-sm font-medium mb-2">Year</label>
  <select
    value={localFilters.year}
    onChange={(e) => handleFilterUpdate('year', e.target.value)}
    className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-blue-500"
  >
    <option value="">All Years</option>
    {years.map((year) => (
      <option key={year} value={year}>
        {year}
      </option>
    ))}
  </select>
  {localFilters.year && (
    <p className="text-xs text-gray-400 mt-1">
      Filtering by: {localFilters.year}
    </p>
  )}
</div>

        {/* Rating Filter */}
        <div>
          <label className="block text-sm font-medium mb-2">Min Rating</label>
          <select
            value={localFilters.rating}
            onChange={(e) => handleFilterUpdate('rating', e.target.value)}
            className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-blue-500"
          >
            <option value="">Any Rating</option>
            <option value="7">7+ Stars</option>
            <option value="8">8+ Stars</option>
            <option value="9">9+ Stars</option>
          </select>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <span className="text-sm text-gray-300">
          Active filters: {Object.values(localFilters).filter(v => v && v !== 'all' && v !== 'popularity.desc').length}
        </span>
      </div>
    </div>
  );
};

export default FilterPanel;
