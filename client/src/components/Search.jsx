import { useState } from 'react';

const Search = ({ searchTerm, setSearchTerm, onSearch }) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  return (
    <div className="search-container w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <div className={`relative transition-all duration-300 ${isFocused ? 'scale-105' : ''}`}>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyPress={handleKeyPress}
            placeholder="Search movies, TV shows, actors..."
            className="w-full px-6 py-4 pr-12 text-lg rounded-full bg-white/90 backdrop-blur-sm border-2 border-transparent focus:border-blue-500 focus:bg-white focus:outline-none shadow-lg transition-all duration-300"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full transition-colors duration-300"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
};

export default Search;
