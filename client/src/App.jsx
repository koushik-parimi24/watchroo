import './App.css'
import Search from './components/Search'
import {useEffect, useState } from 'react'
import MovieCard from './components/MovieCard'
import Navbar from './components/Navbar';
import FilterPanel from './components/FilterPanel';
import SkeletonGrid from './components/SkeletonGrid';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY
const API_URL_BASE = 'https://api.themoviedb.org/3'

const API_OPTIONS ={
  method: 'GET',
  headers :{
    Authorization: `Bearer ${API_KEY}`,
    'Content-Type': 'application/json',
  }
}

function App() {
  const [searchTerm, setSearchTerm] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [movies, setMovies] = useState([]);
  const [topMovies, setTopMovies] = useState([]);
  const [topTvShow, setTopTvShows] = useState([]);
  const [tvShows, setTvShows] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [genres, setGenres] = useState([]);
  const [isFiltering, setIsFiltering] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Separate loading states for better UX
  const [initialLoading, setInitialLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [filterLoading, setFilterLoading] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState({
    genre: '',
    sortBy: 'popularity.desc',
    year: '',
    rating: '',
    mediaType: 'all'
  });

  const handleSearch = async() =>{
    if(!searchTerm.trim()){
      setIsSearching(false); 
      setIsFiltering(false);
      fetchMovies();
      fetchTvShows();
      return;
    }

    try{
      setSearchLoading(true);
      setIsSearching(true);
      setIsFiltering(false);
      
      const endpoint = `${API_URL_BASE}/search/multi?query=${encodeURIComponent(searchTerm)}`
      const response = await fetch(endpoint,API_OPTIONS);
      if (!response.ok) throw new Error("Search request failed");

      const data = await response.json();
      setMovies(data.results);
      if(data.results.length === 0){
        setErrorMessage(`No results found for "${searchTerm}"`);
      }else{
        setErrorMessage('');
      }
    }catch(error){
      console.error("Error Searching:",error);
      setErrorMessage("Search failed. Please try again later")
    } finally {
      setSearchLoading(false);
    }
  }

  const handleFilter = async (newFilters) => {
    setFilters(newFilters);
    setIsFiltering(true);
    setIsSearching(false);
    setSearchTerm('');
    
    try {
      setFilterLoading(true);
      let endpoint;
      const baseParams = {
        sort_by: newFilters.sortBy,
        page: 1
      };

      // Add genre filter
      if (newFilters.genre) baseParams.with_genres = newFilters.genre;
      if (newFilters.rating) baseParams['vote_average.gte'] = newFilters.rating;

      if (newFilters.mediaType === 'movie') {
        if (newFilters.year) baseParams.year = newFilters.year;
        const params = new URLSearchParams(baseParams);
        endpoint = `${API_URL_BASE}/discover/movie?${params}`;
        
      } else if (newFilters.mediaType === 'tv') {
        if (newFilters.year) baseParams.first_air_date_year = newFilters.year;
        const params = new URLSearchParams(baseParams);
        endpoint = `${API_URL_BASE}/discover/tv?${params}`;
        
      } else {
        const movieParams = { ...baseParams };
        const tvParams = { ...baseParams };
        
        if (newFilters.year) {
          movieParams.year = newFilters.year;
          tvParams.first_air_date_year = newFilters.year;
        }
        
        const movieEndpoint = `${API_URL_BASE}/discover/movie?${new URLSearchParams(movieParams)}`;
        const tvEndpoint = `${API_URL_BASE}/discover/tv?${new URLSearchParams(tvParams)}`;
        
        const [movieResponse, tvResponse] = await Promise.all([
          fetch(movieEndpoint, API_OPTIONS),
          fetch(tvEndpoint, API_OPTIONS)
        ]);
        
        const movieData = await movieResponse.json();
        const tvData = await tvResponse.json();
        
        const combinedResults = [
          ...movieData.results.map(item => ({ ...item, media_type: 'movie' })),
          ...tvData.results.map(item => ({ ...item, media_type: 'tv' }))
        ];
        
        if (newFilters.sortBy.includes('popularity')) {
          combinedResults.sort((a, b) => {
            return newFilters.sortBy.includes('desc') 
              ? b.popularity - a.popularity 
              : a.popularity - b.popularity;
          });
        }
        
        setMovies(combinedResults);
        setErrorMessage('');
        return;
      }

      const response = await fetch(endpoint, API_OPTIONS);
      const data = await response.json();
      
      setMovies(data.results.map(item => ({
        ...item,
        media_type: newFilters.mediaType === 'movie' ? 'movie' : 'tv'
      })));
      
      if (data.results.length === 0) {
        setErrorMessage("No results found for the selected filters");
      } else {
        setErrorMessage('');
      }
    } catch (error) {
      console.error("Error filtering:", error);
      setErrorMessage("Filter failed. Please try again later");
    } finally {
      setFilterLoading(false);
    }
  };

  const fetchGenres = async () => {
    try {
      const [movieGenres, tvGenres] = await Promise.all([
        fetch(`${API_URL_BASE}/genre/movie/list`, API_OPTIONS),
        fetch(`${API_URL_BASE}/genre/tv/list`, API_OPTIONS)
      ]);
      
      const movieData = await movieGenres.json();
      const tvData = await tvGenres.json();
      
      const allGenres = [...movieData.genres, ...tvData.genres];
      const uniqueGenres = allGenres.filter((genre, index, self) => 
        index === self.findIndex(g => g.id === genre.id)
      );
      
      setGenres(uniqueGenres);
    } catch (error) {
      console.error("Error fetching genres:", error);
    }
  };

  const fetchMovies = async () =>{
    try{
      const endpoint = `${API_URL_BASE}/movie/popular`
      const response = await fetch(endpoint, API_OPTIONS)
      if(!response.ok){
        throw new Error('Failed to fetch movies')
      }
      const data = await response.json();
      setMovies(data.results);
    } catch(error){
      console.log(`Error fetching movies:${error}`)
      setErrorMessage('Error fetching movies. Please try again later')
    }
  }

  const fetchTvShows = async () =>{
    try{
      const endpoint = `${API_URL_BASE}/tv/popular`
      const response = await fetch(endpoint, API_OPTIONS)
      if(!response.ok){
        throw new Error('Failed to fetch tv shows')
      }
      const data = await response.json();
      setTvShows(data.results);
    } catch(error){
      console.log(`Error fetching tv shows:${error}`)
      setErrorMessage('Error fetching tv shows. Please try again later')
    }
  }

  const fetchTopMovies = async () =>{
    try{
      const res = await fetch(`${API_URL_BASE}/movie/top_rated`,API_OPTIONS)
      const data = await res.json();
      setTopMovies(data.results);
    }catch(error){
      console.log("Error fetching top movies",error);
    }
  };

  const fetchTopTvShows = async () =>{
    try{
      const res = await fetch(`${API_URL_BASE}/tv/top_rated`,API_OPTIONS)
      const data = await res.json();
      setTopTvShows(data.results);
    }catch(error){
      console.log("Error fetching top TV shows",error);
    }
  };

  const clearFilters = () => {
    setFilters({
      genre: '',
      sortBy: 'popularity.desc',
      year: '',
      rating: '',
      mediaType: 'all'
    });
    setIsFiltering(false);
    setIsSearching(false);
    setSearchTerm('');
    setErrorMessage('');
    fetchMovies();
    fetchTvShows();
  };

  // Load initial data with proper loading state
  useEffect(() => {
    const loadInitialData = async () => {
      setInitialLoading(true);
      try {
        await Promise.all([
          fetchTvShows(),
          fetchMovies(),
          fetchTopMovies(),
          fetchTopTvShows(),
          fetchGenres()
        ]);
      } catch (error) {
        console.error("Error loading initial data:", error);
      } finally {
        setInitialLoading(false);
      }
    };

    loadInitialData();
  }, []);

  return (
    <main className="py-24 flex items-center justify-center">
      <Navbar/>
      <div
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{ backgroundImage: `url('./hero-bg.png')` }}
      />
      <div className="wrapper relative z-10 text-center px-4">
        <header className="mb-6">
          <img src="./hero.png" alt="Hero Banner" className="mx-auto max-h-96" />
          <h1 className="text-4xl md:text-5xl font-bold text-white">
            Find <span className="text-gradient">Movies</span> you'll enjoy
          </h1>
          
          <div className="flex flex-col items-center gap-4 mt-6">
            <Search
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              onSearch={handleSearch}
            />
            
            <div className="flex gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </button>
              
              {(isFiltering || isSearching) && (
                <button
                  onClick={clearFilters}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>
        </header>

        {showFilters && (
          <FilterPanel
            filters={filters}
            genres={genres}
            onFilterChange={handleFilter}
          />
        )}

        <section className="all-movies">
          {errorMessage && <p className='text-red-400 py-2'>{errorMessage}</p>}

          {(isSearching || isFiltering) ? (
            <>
              <h2 className='text-white text-2xl mb-4 py-6'>
                {isSearching ? 'Search Results' : 'Filtered Results'}
              </h2>
              {(searchLoading || filterLoading) ? (
                <SkeletonGrid count={12} className="py-8" />
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 py-8">
                  {movies.map((item) => (
                    <MovieCard key={`${item.id}-${item.media_type}`} movie={item} />
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              {/* Top Movies Section */}
              <h2 className='text-white text-2xl mb-4'>Top Movies</h2>
              {initialLoading ? (
                <SkeletonGrid count={8} className="py-4" />
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 py-4">
                  {topMovies.map((movie) => (
                    <MovieCard key={movie.id} movie={movie} />
                  ))}
                </div>
              )}

              {/* Top TV Shows Section */}
              <h2 className='text-white text-2xl mb-4'>Top TV Shows</h2>
              {initialLoading ? (
                <SkeletonGrid count={8} className="py-4" />
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 py-4">
                  {topTvShow.map((tv) => (
                    <MovieCard key={tv.id} movie={tv} />
                  ))}
                </div>
              )}

              {/* Popular Movies Section */}
              <h2 className='text-white text-2xl mb-4 py-6'>Popular Movies</h2>
              {initialLoading ? (
                <SkeletonGrid count={12} className="py-8" />
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 py-8">
                  {movies.map((movie) => (
                    <MovieCard key={movie.id} movie={movie} />
                  ))}
                </div>
              )}

              {/* Popular TV Shows Section */}
              <h2 className='text-white text-2xl mb-4 py-6'>Popular TV Shows</h2>
              {initialLoading ? (
                <SkeletonGrid count={12} className="py-8" />
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 py-8">
                  {tvShows.map((tv) => (
                    <MovieCard key={tv.id} movie={tv} />
                  ))}
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  )
}

export default App
