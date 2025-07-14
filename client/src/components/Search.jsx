import React, { useState } from 'react'

const Search = ({searchTerm,setSearchTerm,onSearch}) => {
const handleKeyPress =(e)=>{
  if(e.key === 'Enter'){
    onSearch()
  }
}
  return (
    <div className="py-8 flex items-center justify-center ">
      <div className="flex items-center gap-3 px-6 py-3 rounded-full w-full max-w-md
                      shadow-blue-50 border-b-2 border-transparent hover:border-blue-500
                      transition-all duration-1000 ease-in-out">
        <img src="search.svg" alt="search" className="w-5 h-5" />
        <input
          type="text"
          placeholder="Search through thousands of movies"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyPress}
          className="w-full outline-none text-sm text-gray-100  "
        />

      </div>
      <button
        onClick={onSearch}
        className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-4xl"
      >
        Search
      </button>
    </div>
  )
}

export default Search
