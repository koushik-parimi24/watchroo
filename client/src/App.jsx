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
import LoadMoreButton from './components/LoadMoreButton'


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
  const [isFiltering, setIsFiltering] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Separate loading states for better UX
  const [initialLoading, setInitialLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [filterLoading, setFilterLoading] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreMovies, setHasMoreMovies] = useState(true);
  const [hasMoreTvShows, setHasMoreTvShows] = useState(true);
  const [hasMoreTopMovies, setHasMoreTopMovies] = useState(true);
  const [hasMoreTopTvShows, setHasMoreTopTvShows] = useState(true);
  
  // Additional content states for new sections
  const [additionalMovies, setAdditionalMovies] = useState([]);
  const [additionalTvShows, setAdditionalTvShows] = useState([]);
  const [additionalTopMovies, setAdditionalTopMovies] = useState([]);
  const [additionalTopTvShows, setAdditionalTopTvShows] = useState([]);
  
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
      setSearchParams({ search: searchTerm });
      
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
    fetchMovies();
    fetchTvShows();
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
      
      setHasMoreMovies(data.page < data.total_pages);
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
      
      setHasMoreTvShows(data.page < data.total_pages);
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
      
      setHasMoreTopMovies(data.page < data.total_pages);
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
      
      setHasMoreTopTvShows(data.page < data.total_pages);
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

  // Load more functions for new sections
  const loadMoreMovies = async () => {
    const nextPage = Math.ceil((movies.length + additionalMovies.length) / 20) + 1;
    const response = await fetch(`${API_URL_BASE}/movie/popular?page=${nextPage}`, API_OPTIONS);
    const data = await response.json();
    setAdditionalMovies(prev => [...prev, ...data.results]);
    setHasMoreMovies(data.page < data.total_pages);
  };

  const loadMoreTvShows = async () => {
    const nextPage = Math.ceil((tvShows.length + additionalTvShows.length) / 20) + 1;
    const response = await fetch(`${API_URL_BASE}/tv/popular?page=${nextPage}`, API_OPTIONS);
    const data = await response.json();
    setAdditionalTvShows(prev => [...prev, ...data.results]);
    setHasMoreTvShows(data.page < data.total_pages);
  };

  const loadMoreTopMovies = async () => {
    const nextPage = Math.ceil((topMovies.length + additionalTopMovies.length) / 20) + 1;
    const response = await fetch(`${API_URL_BASE}/movie/top_rated?page=${nextPage}`, API_OPTIONS);
    const data = await response.json();
    setAdditionalTopMovies(prev => [...prev, ...data.results]);
    setHasMoreTopMovies(data.page < data.total_pages);
  };

  const loadMoreTopTvShows = async () => {
    const nextPage = Math.ceil((topTvShow.length + additionalTopTvShows.length) / 20) + 1;
    const response = await fetch(`${API_URL_BASE}/tv/top_rated?page=${nextPage}`, API_OPTIONS);
    const data = await response.json();
    setAdditionalTopTvShows(prev => [...prev, ...data.results]);
    setHasMoreTopTvShows(data.page < data.total_pages);
  };

  // Load more for all sections at once
  const loadMoreAll = async () => {
    const promises = [];
    
    if (hasMoreMovies) {
      promises.push(loadMoreMovies());
    }
    
    if (hasMoreTvShows) {
      promises.push(loadMoreTvShows());
    }
    
    if (hasMoreTopMovies) {
      promises.push(loadMoreTopMovies());
    }
    
    if (hasMoreTopTvShows) {
      promises.push(loadMoreTopTvShows());
    }
    
    await Promise.all(promises);
  };

  // Check for search parameter in URL on component mount
  useEffect(() => {
    const urlSearchTerm = searchParams.get('search');
    if (urlSearchTerm) {
      setSearchTerm(urlSearchTerm);
      // Perform search automatically when URL has search parameter
      const performSearch = async () => {
        try {
          setSearchLoading(true);
          setIsSearching(true);
          setIsFiltering(false);
          
          const endpoint = `${API_URL_BASE}/search/multi?query=${encodeURIComponent(urlSearchTerm)}`
          const response = await fetch(endpoint, API_OPTIONS);
          if (!response.ok) throw new Error("Search request failed");

          const data = await response.json();
          setMovies(data.results);
          if(data.results.length === 0){
            setErrorMessage(`No results found for "${urlSearchTerm}"`);
          }else{
            setErrorMessage('');
          }
        }catch(error){
          console.error("Error Searching:",error);
          setErrorMessage("Search failed. Please try again later")
        } finally {
          setSearchLoading(false);
        }
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
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        isFiltering={isFiltering}
        isSearching={isSearching}
        clearFilters={clearFilters}
      />
      {/* Filters below hero */}
      {showFilters && (
        <div className="px-4">
          <FilterPanel
            filters={filters}
            genres={genres}
            onFilterChange={handleFilter}
          />
        </div>
      )}
    </>
  )}

  {/* Main Content */}
  <section className={`wrapper px-4 ${isSearching ? 'pt-20' : ''}`}>
    {errorMessage && <p className="text-red-400 py-2">{errorMessage}</p>}

    {(isSearching || isFiltering) ? (
      <>
        {(searchLoading || filterLoading) ? (
          <SkeletonGrid count={12} className="py-8" />
        ) : (
          <>
            <ScrollableSection
              title={isSearching ? 'Search Results' : 'Filtered Results'}
              items={movies}
              containerId="search-results-scroll"
              loading={false}
              skeletonCount={12}
              MovieCardComponent={MovieCard}
            />
            {movies.length > 0 && (
              <LoadMoreButton
                onLoadMore={() => {
                  // For search results, we could implement pagination here
                  console.log('Load more search results');
                }}
                loading={false}
                hasMore={false} // Set to true if you implement search pagination
              >
                Load More Results
              </LoadMoreButton>
            )}
          </>
        )}
      </>
    ) : (
      <>
        <div className="space-y-12">
          <RecentlyWatched />

          <ScrollableSection
            title="Popular Movies"
            items={movies}
            containerId="popular-movies-scroll"
            loading={initialLoading}
            skeletonCount={12}
            MovieCardComponent={MovieCard}
          />

          <ScrollableSection
            title="Top Movies"
            items={topMovies}
            containerId="top-movies-scroll"
            loading={initialLoading}
            skeletonCount={8}
            MovieCardComponent={MovieCard}
          />

          <ScrollableSection
            title="Top TV Shows"
            items={topTvShow}
            containerId="top-tv-scroll"
            loading={initialLoading}
            skeletonCount={8}
            MovieCardComponent={MovieCard}
          />

          <ScrollableSection
            title="Popular TV Shows"
            items={tvShows}
            containerId="popular-tv-scroll"
            loading={initialLoading}
            skeletonCount={12}
            MovieCardComponent={MovieCard}
          />

          {/* Single Load More Button for all sections */}
          <LoadMoreButton
            onLoadMore={loadMoreAll}
            loading={initialLoading}
            hasMore={hasMoreMovies || hasMoreTvShows || hasMoreTopMovies || hasMoreTopTvShows}
          >
            Load More Content
          </LoadMoreButton>

          {/* Additional Movies Section */}
          {additionalMovies.length > 0 && (
            <ScrollableSection
              title="More Popular Movies"
              items={additionalMovies}
              containerId="additional-movies-scroll"
              loading={false}
              skeletonCount={12}
              MovieCardComponent={MovieCard}
            />
          )}

          {/* Additional Top Movies Section */}
          {additionalTopMovies.length > 0 && (
            <ScrollableSection
              title="More Top Movies"
              items={additionalTopMovies}
              containerId="additional-top-movies-scroll"
              loading={false}
              skeletonCount={8}
              MovieCardComponent={MovieCard}
            />
          )}

          {/* Additional Top TV Shows Section */}
          {additionalTopTvShows.length > 0 && (
            <ScrollableSection
              title="More Top TV Shows"
              items={additionalTopTvShows}
              containerId="additional-top-tv-scroll"
              loading={false}
              skeletonCount={8}
              MovieCardComponent={MovieCard}
            />
          )}

          {/* Additional TV Shows Section */}
          {additionalTvShows.length > 0 && (
            <ScrollableSection
              title="More Popular TV Shows"
              items={additionalTvShows}
              containerId="additional-tv-scroll"
              loading={false}
              skeletonCount={12}
              MovieCardComponent={MovieCard}
            />
          )}
        </div>
      </>
    )}
  </section>
</main>

    </>
  )
}

export default App
