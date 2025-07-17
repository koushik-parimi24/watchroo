import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MovieDetails from './pages/MovieDetails';
import { WatchlistProvider } from './context/WatchlistContext'; 
import WatchList from './components/WatchList';
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {  LoadingProvider } from './context/LoadingContext';

createRoot(document.getElementById('root')).render(
  <WatchlistProvider> 
    <LoadingProvider>     
    <BrowserRouter>
      <Routes>
        <Route path="/"           element={<App />} />
        <Route path="/movie/:id"  element={<MovieDetails type="movie" />} />
        <Route path="/tv/:id"     element={<MovieDetails type="tv" />} />
        <Route path="/watchlist"  element={<WatchList />} />
      </Routes>
    </BrowserRouter>
    </LoadingProvider>  
  </WatchlistProvider> 
)
