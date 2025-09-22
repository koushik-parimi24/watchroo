import './App.css'
import { Analytics } from '@vercel/analytics/react';
import {useEffect, useState,useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import MovieCard from './components/MovieCard'
import Navbar from './components/Navbar';
import FilterPanel from './components/FilterPanel';
import SkeletonGrid from './components/SkeletonGrid';
import RecentlyWatched from './components/RecentlyWatched'
import Hero from './components/Hero'
import ScrollableSection from './components/ScrollableSection'


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
  const [searchParams, setSearchParams] = useSearchParams(); 
  const [searchTerm, setSearchTerm] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [movies, setMovies] = useState([]);
  const [topMovies, setTopMovies] = useState([]);
  const [topTvShow, setTopTvShows] = useState([]);
  const [tvShows, setTvShows] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [genres, setGenres] = useState([]);

  // New states for additional sections
  const [popularThisWeekMovies, setPopularThisWeekMovies] = useState([]);
  const [popularThisWeekTvShows, setPopularThisWeekTvShows] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [trendingTvShows, setTrendingTvShows] = useState([]);
  const [nowPlayingMovies, setNowPlayingMovies] = useState([]); // Movies only

  // States for genre sections
  const [actionMovies, setActionMovies] = useState([]);
  const [actionTvShows, setActionTvShows] = useState([]);
  const [familyMovies, setFamilyMovies] = useState([]);
  const [familyTvShows, setFamilyTvShows] = useState([]);
  const [comedyMovies, setComedyMovies] = useState([]);
  const [comedyTvShows, setComedyTvShows] = useState([]);
  const [romanceMovies, setRomanceMovies] = useState([]);
  const [romanceTvShows, setRomanceTvShows] = useState([]);
  const [horrorMovies, setHorrorMovies] = useState([]);
  const [horrorTvShows, setHorrorTvShows] = useState([]);
  const [crimeMovies, setCrimeMovies] = useState([]);
  const [crimeTvShows, setCrimeTvShows] = useState([]);
  const [dramaMovies, setDramaMovies] = useState([]);
  const [dramaTvShows, setDramaTvShows] = useState([]);
  const [animationMovies, setAnimationMovies] = useState([]);
  const [animationTvShows, setAnimationTvShows] = useState([]);
  const [documentaryMovies, setDocumentaryMovies] = useState([]);
  const [documentaryTvShows, setDocumentaryTvShows] = useState([]);

  const [isFiltering, setIsFiltering] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Separate loading states for better UX
  const [initialLoading, setInitialLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [filterLoading, setFilterLoading] = useState(false);
  
  // New state for media type toggle
  const [mediaType, setMediaType] = useState('movie'); // 'movie' or 'tv'

  // New state for global view mode
  const [viewMode, setViewMode] = useState('card'); // 'card' or 'list'
  
  // Filter states
  const [filters, setFilters] = useState({
    genre: '',
    sortBy: 'popularity.desc',
    year: '',
    rating: '',
    mediaType: 'all'
  });

  const handleSearch = async(page = 1, append = false) =>{
    if(!searchTerm.trim()){
      setIsSearching(false); 
      setIsFiltering(false);
      // Fetch content based on current mediaType
      if (mediaType === 'movie') {
      fetchMovies();
      } else {
      fetchTvShows();
      }
      return;
    }

    try{
      setSearchLoading(true);
      if (page === 1) {
        setIsSearching(true);
        setIsFiltering(false);
        setSearchParams({ search: searchTerm });
      }
      
      const endpoint = `${API_URL_BASE}/search/multi?query=${encodeURIComponent(searchTerm)}&page=${page}`
      const response = await fetch(endpoint,API_OPTIONS);
      if (!response.ok) throw new Error("Search request failed");

      const data = await response.json();
      
      if (append) {
        setMovies(prev => [...prev, ...data.results]);
      } else {
        setMovies(data.results);
      }
      
      if(data.results.length === 0 && page === 1){
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
    setSearchParams({}); // Clear URL params
    setErrorMessage('');
    // Fetch content based on current mediaType
    if (mediaType === 'movie') {
    fetchMovies();
    } else {
    fetchTvShows();
    }
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

  const fetchMovies = async (page = 1, append = false) =>{
    try{
      const endpoint = `${API_URL_BASE}/movie/popular?page=${page}`
      const response = await fetch(endpoint, API_OPTIONS)
      if(!response.ok){
        throw new Error('Failed to fetch movies')
      }
      const data = await response.json();
      
      if (append) {
        setMovies(prev => [...prev, ...data.results]);
      } else {
        setMovies(data.results);
      }
      
    } catch(error){
      console.log(`Error fetching movies:${error}`)
      setErrorMessage('Error fetching movies. Please try again later')
    }
  }

  const fetchTvShows = async (page = 1, append = false) =>{
    try{
      const endpoint = `${API_URL_BASE}/tv/popular?page=${page}`
      const response = await fetch(endpoint, API_OPTIONS)
      if(!response.ok){
        throw new Error('Failed to fetch tv shows')
      }
      const data = await response.json();
      
      if (append) {
        setTvShows(prev => [...prev, ...data.results]);
      } else {
        setTvShows(data.results);
      }
      
    } catch(error){
      console.log(`Error fetching tv shows:${error}`)
      setErrorMessage('Error fetching tv shows. Please try again later')
    }
  }

  const fetchTopMovies = async (page = 1, append = false) =>{
    try{
      const res = await fetch(`${API_URL_BASE}/movie/top_rated?page=${page}`,API_OPTIONS)
      const data = await res.json();
      
      if (append) {
        setTopMovies(prev => [...prev, ...data.results]);
      } else {
        setTopMovies(data.results);
      }
      
    }catch(error){
      console.log("Error fetching top movies",error);
    }
  };

  const fetchTopTvShows = async (page = 1, append = false) =>{
    try{
      const res = await fetch(`${API_URL_BASE}/tv/top_rated?page=${page}`,API_OPTIONS)
      const data = await res.json();
      
      if (append) {
        setTopTvShows(prev => [...prev, ...data.results]);
      } else {
        setTopTvShows(data.results);
      }
      
    }catch(error){
      console.log("Error fetching top TV shows",error);
    }
  };

  const fetchPopularThisWeek = async (type) => {
    try {
      const endpoint = `${API_URL_BASE}/trending/${type}/week`;
      const response = await fetch(endpoint, API_OPTIONS);
      if (!response.ok) {
        throw new Error(`Failed to fetch popular ${type} this week`);
      }
    const data = await response.json();
      if (type === 'movie') {
        setPopularThisWeekMovies(data.results);
      } else {
        setPopularThisWeekTvShows(data.results);
      }
    } catch (error) {
      console.error(`Error fetching popular ${type} this week:`, error);
    }
  };

  const fetchTrending = async (type) => {
    try {
      const endpoint = `${API_URL_BASE}/trending/${type}/day`;
      const response = await fetch(endpoint, API_OPTIONS);
      if (!response.ok) {
        throw new Error(`Failed to fetch trending ${type}`);
      }
    const data = await response.json();
      if (type === 'movie') {
        setTrendingMovies(data.results);
      } else {
        setTrendingTvShows(data.results);
      }
    } catch (error) {
      console.error(`Error fetching trending ${type}:`, error);
    }
  };

  const fetchGenreContent = async (type, genreId, setStateFunction) => {
    try {
      const endpoint = `${API_URL_BASE}/discover/${type}?with_genres=${genreId}`;
      const response = await fetch(endpoint, API_OPTIONS);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${type} for genre ${genreId}`);
      }
    const data = await response.json();
      setStateFunction(data.results);
    } catch (error) {
      console.error(`Error fetching ${type} for genre ${genreId}:`, error);
    }
  };

  const fetchAllGenreContent = async (mediaType) => {
    const genreMap = new Map(genres.map(genre => [genre.name, genre.id]));

    const genreFetches = [];

    const addGenreFetch = (genreName, movieSetter, tvSetter) => {
      const genreId = genreMap.get(genreName);
      if (genreId) {
        if (mediaType === 'movie') {
          genreFetches.push(fetchGenreContent('movie', genreId, movieSetter));
        } else {
          genreFetches.push(fetchGenreContent('tv', genreId, tvSetter));
        }
      }
    };

    addGenreFetch('Action', setActionMovies, setActionTvShows);
    addGenreFetch('Family', setFamilyMovies, setFamilyTvShows);
    addGenreFetch('Comedy', setComedyMovies, setComedyTvShows);
    addGenreFetch('Romance', setRomanceMovies, setRomanceTvShows);
    addGenreFetch('Horror', setHorrorMovies, setHorrorTvShows);
    addGenreFetch('Crime', setCrimeMovies, setCrimeTvShows);
    addGenreFetch('Drama', setDramaMovies, setDramaTvShows);
    addGenreFetch('Animation', setAnimationMovies, setAnimationTvShows);
    addGenreFetch('Documentary', setDocumentaryMovies, setDocumentaryTvShows);

    await Promise.all(genreFetches);
  };

  const fetchNowPlayingMovies = async () => {
    try {
      const endpoint = `${API_URL_BASE}/movie/now_playing`;
      const response = await fetch(endpoint, API_OPTIONS);
      if (!response.ok) {
        throw new Error('Failed to fetch now playing movies');
      }
      const data = await response.json();
      setNowPlayingMovies(data.results);
    } catch (error) {
      console.error("Error fetching now playing movies:", error);
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
    // Fetch content based on current mediaType
    if (mediaType === 'movie') {
      fetchMovies();
    } else {
      fetchTvShows();
    }
  };

  // Check for search parameter in URL on component mount
  useEffect(() => {
    const urlSearchTerm = searchParams.get('search');
    if (urlSearchTerm) {
      setSearchTerm(urlSearchTerm);
      // Perform search automatically when URL has search parameter
      const performSearch = async () => {
        setSearchTerm(urlSearchTerm);
        await handleSearch(1, false);
      };
      
      performSearch();
    }
  }, [searchParams]);

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

    // Only load initial data if there's no search parameter
    const urlSearchTerm = searchParams.get('search');
    if (!urlSearchTerm) {
      loadInitialData();
    }
  }, []);

  // Refetch data when mediaType changes
  useEffect(() => {
    if (!isSearching && !isFiltering) {
      setInitialLoading(true);
      const fetchData = async () => {
        if (mediaType === 'movie') {
          await Promise.all([
            fetchMovies(),
            fetchTopMovies(),
            fetchPopularThisWeek('movie'),
            fetchTrending('movie'),
            fetchNowPlayingMovies(),
            fetchAllGenreContent('movie'),
          ]);
          setTvShows([]);
          setTopTvShows([]);
          setPopularThisWeekTvShows([]);
          setTrendingTvShows([]);
          setActionTvShows([]);
          setFamilyTvShows([]);
          setComedyTvShows([]);
          setRomanceTvShows([]);
          setHorrorTvShows([]);
          setCrimeTvShows([]);
          setDramaTvShows([]);
          setAnimationTvShows([]);
          setDocumentaryTvShows([]);

        } else {
          await Promise.all([
            fetchTvShows(),
            fetchTopTvShows(),
            fetchPopularThisWeek('tv'),
            fetchTrending('tv'),
            fetchAllGenreContent('tv'),
          ]);
          setMovies([]);
          setTopMovies([]);
          setPopularThisWeekMovies([]);
          setTrendingMovies([]);
          setNowPlayingMovies([]);
          setActionMovies([]);
          setFamilyMovies([]);
          setComedyMovies([]);
          setRomanceMovies([]);
          setHorrorMovies([]);
          setCrimeMovies([]);
          setDramaMovies([]);
          setAnimationMovies([]);
          setDocumentaryMovies([]);
        }
        setInitialLoading(false);
      };
      fetchData();
    }
  }, [mediaType, isSearching, isFiltering, genres]);

  return (
    <>
<main>
   <Analytics />
  <Navbar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onSearch={handleSearch}
        onLogoClick={() => {
          setSearchTerm('');
          setIsSearching(false);
          setIsFiltering(false);
          setErrorMessage('');
          setSearchParams({});
          fetchMovies();
          fetchTvShows();
        }}
  />
  
  {/* Only show Hero when not searching */}
  {!isSearching && (
    <>
      <Hero
        isFiltering={isFiltering}
        isSearching={isSearching}
        clearFilters={clearFilters}
      />
      {/* Media Type Toggle */}
      <div className="flex justify-center mb-8 mt-10 ">
        <div className="bg-gray-800/50 backdrop-blur-md rounded-full p-1 flex space-x-2">
          <button
            className={`px-5 py-2 rounded-full text-sm font-medium transition-colors duration-200
              ${mediaType === 'movie' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-300 hover:text-white hover:bg-gray-700/70'}`}
            onClick={() => setMediaType('movie')}
          >
            Movies
          </button>
          <button
            className={`px-5 py-2 rounded-full text-sm font-medium transition-colors duration-200
              ${mediaType === 'tv' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-300 hover:text-white hover:bg-gray-700/70'}`}
            onClick={() => setMediaType('tv')}
          >
            TV Shows
          </button>
        </div>
        {/* View Mode Toggle */}
        <div className="flex items-center space-x-2 ml-4">
          <button
            onClick={() => setViewMode('card')}
            className={`p-2 rounded-full transition-colors duration-200 ${viewMode === 'card' ? 'bg-blue-600 text-white' : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/70'}`}
            aria-label="Card View"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm1.414.707a1 1 0 00-1.414 1.414L5.586 9H4a1 1 0 100 2h1.586l-1.586 1.586a1 1 0 101.414 1.414L7 12.414V14a1 1 0 102 0v-1.586l1.586 1.586a1 1 0 101.414-1.414L12.414 11H14a1 1 0 100-2h-1.586l1.586-1.586a1 1 0 10-1.414-1.414L10 8.586V7a1 1 0 10-2 0v1.586L5.414 5.707z" clipRule="evenodd" />
            </svg>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-full transition-colors duration-200 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/70'}`}
            aria-label="List View"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        {/* Filter Toggle Button */}
        <button
          className={`ml-4 p-3 rounded-full transition-colors duration-200
            ${showFilters ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-800/50 text-gray-300 hover:text-white hover:bg-gray-700/70'}`}
          onClick={() => setShowFilters(prev => !prev)}
          aria-label="Toggle Filters"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </>
  )}

  {/* Filters section - appears below hero/toggles when active */}
      {showFilters && (
    <div className="px-4 mb-8">
          <FilterPanel
            filters={filters}
            genres={genres}
            onFilterChange={handleFilter}
          />
        </div>
  )}

  {/* Main Content */}
  <section className={`content-padding ${isSearching ? 'pt-24 sm:pt-28' : 'pt-4'} pb-16 animate-fade-in`}>
    <div className="max-w-7xl mx-auto">
      {errorMessage && (
        <div className="glass-card rounded-xl p-4 mb-8 border-l-4 border-red-500/50 animate-slide-up">
          <p className="text-red-400 flex items-center gap-2">
            <span>⚠️</span>
            {errorMessage}
          </p>
        </div>
      )}

      {(isSearching || isFiltering) ? (
        <div className="animate-slide-up">
          {(searchLoading || filterLoading) ? (
            <SkeletonGrid count={12} className="section-spacing" />
          ) : (
            <>
              <ScrollableSection
                title={isSearching ? '🔍 Search Results' : '🎯 Filtered Results'}
                items={movies}
                containerId="search-results-scroll"
                loading={false}
                skeletonCount={12}
                MovieCardComponent={MovieCard}
                viewMode={viewMode}
              />
            </>
          )}
        </div>
      ) : (
        <div className="space-y-16 sm:space-y-20">
          <div className="animate-slide-up">
            <RecentlyWatched />
          </div>

          {mediaType === 'movie' ? (
            <>
              <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <ScrollableSection
                  title="⭐ Top Movies"
                  items={topMovies}
                  containerId="top-movies-scroll"
                  loading={initialLoading}
                  skeletonCount={8}
                  MovieCardComponent={MovieCard}
                  viewMode={viewMode}
                />
                  </div>

              {/* Popular This Week Movies */}
              {popularThisWeekMovies.length > 0 && (
                <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
                  <ScrollableSection
                    title="📈 Popular This Week (Movies)"
                    items={popularThisWeekMovies}
                    containerId="popular-this-week-movie-scroll"
                    loading={initialLoading}
                    skeletonCount={12}
                    MovieCardComponent={MovieCard}
                    viewMode={viewMode}
                  />
                </div>
              )}
              
              {/* Trending Movies */}
              {trendingMovies.length > 0 && (
                <div className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
                  <ScrollableSection
                    title="⚡ Trending Movies"
                    items={trendingMovies}
                    containerId="trending-movie-scroll"
                    loading={initialLoading}
                    skeletonCount={12}
                    MovieCardComponent={MovieCard}
                    viewMode={viewMode}
                  />
                  </div>
              )}

              {/* Now Playing Movies */}
              {nowPlayingMovies.length > 0 && (
                <div className="animate-slide-up" style={{ animationDelay: '0.5s' }}>
                  <ScrollableSection
                    title="🍿 Showing in Cinemas"
                    items={nowPlayingMovies}
                    containerId="now-playing-movie-scroll"
                    loading={initialLoading}
                    skeletonCount={12}
                    MovieCardComponent={MovieCard}
                    viewMode={viewMode}
                  />
                </div>
              )}

              {/* Movie Genre Sections */}
              {actionMovies.length > 0 && (
                <div className="animate-slide-up" style={{ animationDelay: '0.6s' }}>
                  <ScrollableSection
                    title="💥 Action Movies"
                    items={actionMovies}
                    containerId="action-movie-scroll"
                    loading={initialLoading}
                    skeletonCount={12}
                    MovieCardComponent={MovieCard}
                    viewMode={viewMode}
                  />
                </div>
              )}

              {familyMovies.length > 0 && (
                <div className="animate-slide-up" style={{ animationDelay: '0.7s' }}>
                  <ScrollableSection
                    title="👨‍👩‍👧‍👦 Family Movies"
                    items={familyMovies}
                    containerId="family-movie-scroll"
                    loading={initialLoading}
                    skeletonCount={12}
                    MovieCardComponent={MovieCard}
                    viewMode={viewMode}
                  />
        </div>
              )}

              {comedyMovies.length > 0 && (
                <div className="animate-slide-up" style={{ animationDelay: '0.8s' }}>
                  <ScrollableSection
                    title="😂 Comedy Movies"
                    items={comedyMovies}
                    containerId="comedy-movie-scroll"
                    loading={initialLoading}
                    skeletonCount={12}
                    MovieCardComponent={MovieCard}
                    viewMode={viewMode}
                  />
          </div>
              )}

              {romanceMovies.length > 0 && (
                <div className="animate-slide-up" style={{ animationDelay: '0.9s' }}>
            <ScrollableSection
                    title="❤️ Romance Movies"
                    items={romanceMovies}
                    containerId="romance-movie-scroll"
              loading={initialLoading}
              skeletonCount={12}
              MovieCardComponent={MovieCard}
              viewMode={viewMode}
            />
          </div>
              )}

              {horrorMovies.length > 0 && (
                <div className="animate-slide-up" style={{ animationDelay: '1.0s' }}>
            <ScrollableSection
                    title="👻 Horror Movies"
                    items={horrorMovies}
                    containerId="horror-movie-scroll"
              loading={initialLoading}
                    skeletonCount={12}
              MovieCardComponent={MovieCard}
              viewMode={viewMode}
            />
          </div>
              )}

              {crimeMovies.length > 0 && (
                <div className="animate-slide-up" style={{ animationDelay: '1.1s' }}>
                  <ScrollableSection
                    title="🔪 Crime Movies"
                    items={crimeMovies}
                    containerId="crime-movie-scroll"
                    loading={initialLoading}
                    skeletonCount={12}
                    MovieCardComponent={MovieCard}
                    viewMode={viewMode}
                  />
                </div>
              )}

              {dramaMovies.length > 0 && (
                <div className="animate-slide-up" style={{ animationDelay: '1.2s' }}>
                  <ScrollableSection
                    title="🎭 Drama Movies"
                    items={dramaMovies}
                    containerId="drama-movie-scroll"
                    loading={initialLoading}
                    skeletonCount={12}
                    MovieCardComponent={MovieCard}
                    viewMode={viewMode}
                  />
                </div>
              )}

              {animationMovies.length > 0 && (
                <div className="animate-slide-up" style={{ animationDelay: '1.3s' }}>
                  <ScrollableSection
                    title="🎨 Animation Movies"
                    items={animationMovies}
                    containerId="animation-movie-scroll"
                    loading={initialLoading}
                    skeletonCount={12}
                    MovieCardComponent={MovieCard}
                    viewMode={viewMode}
                  />
                </div>
              )}

              {documentaryMovies.length > 0 && (
                <div className="animate-slide-up" style={{ animationDelay: '1.4s' }}>
                  <ScrollableSection
                    title="🌍 Documentary Movies"
                    items={documentaryMovies}
                    containerId="documentary-movie-scroll"
                    loading={initialLoading}
                    skeletonCount={12}
                    MovieCardComponent={MovieCard}
                    viewMode={viewMode}
                  />
                </div>
              )}
            </>
          ) : (
            <>
          <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <ScrollableSection
                  title="📺 Popular TV Shows"
                  items={tvShows}
                  containerId="popular-tv-scroll"
                  loading={initialLoading}
                  skeletonCount={12}
                  MovieCardComponent={MovieCard}
                  viewMode={viewMode}
                />
              </div>

              <div className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
                <ScrollableSection
                  title="⭐ Top TV Shows"
              items={topTvShow}
              containerId="top-tv-scroll"
              loading={initialLoading}
              skeletonCount={8}
              MovieCardComponent={MovieCard}
              viewMode={viewMode}
            />
          </div>

              {/* Popular This Week TV Shows */}
              {popularThisWeekTvShows.length > 0 && (
                <div className="animate-slide-up" style={{ animationDelay: '0.5s' }}>
            <ScrollableSection
                    title="📈 Popular This Week (TV Shows)"
                    items={popularThisWeekTvShows}
                    containerId="popular-this-week-tv-scroll"
              loading={initialLoading}
              skeletonCount={12}
              MovieCardComponent={MovieCard}
              viewMode={viewMode}
            />
          </div>
              )}

              {/* Trending TV Shows */}
              {trendingTvShows.length > 0 && (
                <div className="animate-slide-up" style={{ animationDelay: '0.6s' }}>
                  <ScrollableSection
                    title="⚡ Trending TV Shows"
                    items={trendingTvShows}
                    containerId="trending-tv-scroll"
                    loading={initialLoading}
                    skeletonCount={12}
                    MovieCardComponent={MovieCard}
                    viewMode={viewMode}
                  />
              </div>
              )}

              {/* TV Show Genre Sections */}
              {actionTvShows.length > 0 && (
                <div className="animate-slide-up" style={{ animationDelay: '0.7s' }}>
                  <ScrollableSection
                    title="💥 Action TV Shows"
                    items={actionTvShows}
                    containerId="action-tv-scroll"
                    loading={initialLoading}
                    skeletonCount={12}
                    MovieCardComponent={MovieCard}
                    viewMode={viewMode}
                  />
            </div>
          )}
          
              {familyTvShows.length > 0 && (
                <div className="animate-slide-up" style={{ animationDelay: '0.8s' }}>
                  <ScrollableSection
                    title="👨‍👩‍👧‍👦 Family TV Shows"
                    items={familyTvShows}
                    containerId="family-tv-scroll"
                    loading={initialLoading}
                    skeletonCount={12}
                    MovieCardComponent={MovieCard}
                    viewMode={viewMode}
                  />
              </div>
              )}

              {comedyTvShows.length > 0 && (
                <div className="animate-slide-up" style={{ animationDelay: '0.9s' }}>
                  <ScrollableSection
                    title="😂 Comedy TV Shows"
                    items={comedyTvShows}
                    containerId="comedy-tv-scroll"
                    loading={initialLoading}
                    skeletonCount={12}
                    MovieCardComponent={MovieCard}
                    viewMode={viewMode}
                  />
            </div>
          )}

              {romanceTvShows.length > 0 && (
                <div className="animate-slide-up" style={{ animationDelay: '1.0s' }}>
              <ScrollableSection
                    title="❤️ Romance TV Shows"
                    items={romanceTvShows}
                    containerId="romance-tv-scroll"
                    loading={initialLoading}
                skeletonCount={12}
                MovieCardComponent={MovieCard}
                viewMode={viewMode}
              />
            </div>
          )}

              {horrorTvShows.length > 0 && (
                <div className="animate-slide-up" style={{ animationDelay: '1.1s' }}>
              <ScrollableSection
                    title="👻 Horror TV Shows"
                    items={horrorTvShows}
                    containerId="horror-tv-scroll"
                    loading={initialLoading}
                    skeletonCount={12}
                MovieCardComponent={MovieCard}
                viewMode={viewMode}
              />
            </div>
          )}

              {crimeTvShows.length > 0 && (
                <div className="animate-slide-up" style={{ animationDelay: '1.2s' }}>
              <ScrollableSection
                    title="🔪 Crime TV Shows"
                    items={crimeTvShows}
                    containerId="crime-tv-scroll"
                    loading={initialLoading}
                    skeletonCount={12}
                MovieCardComponent={MovieCard}
                viewMode={viewMode}
              />
            </div>
          )}

              {dramaTvShows.length > 0 && (
                <div className="animate-slide-up" style={{ animationDelay: '1.3s' }}>
              <ScrollableSection
                    title="🎭 Drama TV Shows"
                    items={dramaTvShows}
                    containerId="drama-tv-scroll"
                    loading={initialLoading}
                skeletonCount={12}
                MovieCardComponent={MovieCard}
                viewMode={viewMode}
              />
            </div>
          )}

              {animationTvShows.length > 0 && (
                <div className="animate-slide-up" style={{ animationDelay: '1.4s' }}>
                  <ScrollableSection
                    title="🎨 Animation TV Shows"
                    items={animationTvShows}
                    containerId="animation-tv-scroll"
                    loading={initialLoading}
                    skeletonCount={12}
                    MovieCardComponent={MovieCard}
                    viewMode={viewMode}
                  />
                </div>
              )}

              {documentaryTvShows.length > 0 && (
                <div className="animate-slide-up" style={{ animationDelay: '1.5s' }}>
                  <ScrollableSection
                    title="🌍 Documentary TV Shows"
                    items={documentaryTvShows}
                    containerId="documentary-tv-scroll"
                    loading={initialLoading}
                    skeletonCount={12}
                    MovieCardComponent={MovieCard}
                    viewMode={viewMode}
                  />
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  </section>
</main>

    </>
  )
}

export default App
