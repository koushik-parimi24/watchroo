// context/LoadingContext.jsx
import { createContext, useState, useContext } from 'react';

export const LoadingContext = createContext();

export const LoadingProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const setLoading = (loading) => {
    setIsLoading(loading);
  };
  
  return (
    <LoadingContext.Provider value={{ isLoading, setIsLoading: setLoading }}>
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => useContext(LoadingContext);
