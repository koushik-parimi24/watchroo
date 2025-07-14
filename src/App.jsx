
import './App.css'
import Search from './components/Search'
import {useEffect, useState } from 'react'
import MovieCard from './components/MovieCard'
import {supabase} from "@/lib/supabaseClient.js";
import Navbar from './components/Navbar';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY
const API_URL_BASE = 'https://api.themoviedb.org/3'

const API_OPTIONS ={
  method: 'GET',
  headers :{
      Authorization: `Bearer ${API_KEY}`, // v4 token
    'Content-Type': 'application/json',

  }
}

function App() {
  const [searchTerm, setSearchTerm] = useState('')
  const [errorMessage, setErrorMessage] =useState('')
  const [movies, setMovies] = useState([]);
  const [topMovies, setTopMovies] = useState([]);
  const [topTvShow, setTopTvShows] = useState([]);
  const [tvShows, setTvShows] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [session, setSession] = useState([]);


  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google' });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleSearch = async() =>{
  if(!searchTerm.trim()){
    setIsSearching(false); 
    fetchMovies();
    fetchTvShows();
    return;
  }

  try{
    setIsSearching(true);
    const endpoint = `${API_URL_BASE}/search/multi?query=${encodeURIComponent(searchTerm)}`
    const response = await fetch(endpoint,API_OPTIONS);
    if (!response.ok) throw new Error("Search request failed");

    const data = await response.json();
    setMovies(data.results);
    if(data.results.length === 0){
      setErrorMessage( `No movies found"${searchTerm}"`);
    }else{
      setErrorMessage('');
    }
  }catch(error){
    console.error("Error Searching movies:",error);
    setErrorMessage("search failed.Please Try again later")
  }
}

  const fetchMovies = async () =>{
    try{
      const endpoint = `${API_URL_BASE}/movie/popular`

      const response = await fetch(endpoint, API_OPTIONS)
      if(!response.ok){
        throw new Error('Failed to fetch movies')
      }
      const data = await response.json();
      setMovies(data.results);
      console.log(data.results);
    } catch(error){
      console.log( `Error fetching movies:${error}`)
      setErrorMessage('Error fetching movies,Please try again later')
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
      console.log(data.results);
    } catch(error){
      console.log( `Error fetching tv shows:${error}`)
      setErrorMessage('Error fetching tv shows,Please try again later')
    }
  }

  const fetchTopMovies = async () =>{
    try{
      const res = await fetch(`${API_URL_BASE}/movie/top_rated`,API_OPTIONS)
      const data = await res.json();
      setTopMovies(data.results);
    }catch(error){
      console.log("There error fetching top shows",error);
    }
  };

  const fetchTopTvShows = async () =>{
    try{
      const res = await fetch(`${API_URL_BASE}/tv/top_rated`,API_OPTIONS)
      const data = await res.json();
      setTopTvShows(data.results);
    }catch(error){
      console.log("There error fetching top movies",error);

    }
  };
  useEffect(()=>{
    fetchTvShows()
    fetchMovies();
    fetchTopMovies();
    fetchTopTvShows();
  },[])

  return (
<main className="py-24 flex items-center justify-center ">
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
        <Search
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onSearch = {handleSearch}
        />
        </header>
        <section className="all-movies">
          {errorMessage && <p className='text-red-400 py-2'>{errorMessage}</p>}

          {isSearching ? (
              <>
                <h2 className='text-white text-2xl mb-4 py-6'>Search Results</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 py-8">
                  {movies.map((item) => (
                      <MovieCard key={item.id} movie={item} />
                  ))}
                </div>
              </>
          ) : (
              <>
                <h2 className='text-white text-2xl mb-4'>Top Movies</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 py-4">
                  {topMovies.map((movie) => (
                      <MovieCard key={movie.id} movie={movie} />
                  ))}
                </div>

                <h2 className='text-white text-2xl mb-4'>Top TV Shows</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 py-4">
                  {topTvShow.map((tv) => (
                      <MovieCard key={tv.id} movie={tv} />
                  ))}
                </div>

                <h2 className='text-white text-2xl mb-4 py-6'>Popular Movies</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 py-8">
                  {movies.map((movie) => (
                      <MovieCard key={movie.id} movie={movie} />
                  ))}
                </div>

                <h2 className='text-white text-2xl mb-4 py-6'>Popular TV Shows</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 py-8">
                  {tvShows.map((tv) => (
                      <MovieCard key={tv.id} movie={tv} />
                  ))}
                </div>
              </>
          )}
        </section>

      </div>
    </main>
  )
}

export default App
