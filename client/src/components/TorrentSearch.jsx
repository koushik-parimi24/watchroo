import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Icons for UI clarity
const MagnetIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 6V3a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h4m3 0v3a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-6a1 1 0 0 0-1-1h-4m0 0L9 9m3 3l6-6"/>
  </svg>
);
const DownloadIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);

const TorrentSearch = ({ title, year }) => {
  const [torrents, setTorrents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('1337x'); // Default to 1337x
  const [searched, setSearched] = useState(false);

  const searchTorrents = async () => {
    if (!title) return;

    setIsLoading(true);
    setError('');
    setSearched(true);
    setTorrents([]);

    try {
      // Use the local torrents-api endpoint
      const params = new URLSearchParams({
        searchTerm: title,
        ...(year && { year: year.toString() })
      });
      const response = await fetch(`http://localhost:3000/api/search?${params}`);
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'No error details available');
        throw new Error(`Server returned ${response.status}: ${errorText}`);
      }
      const data = await response.json();
      
      if (data.error) {
        const errorMessage = data.message || 'Failed to fetch torrents.';
        const errorDetails = data.details ? `\nDetails: ${JSON.stringify(data.details)}` : '';
        throw new Error(errorMessage + errorDetails);
      }

      // Process and set torrents from all providers
      const allTorrents = data.payload.reduce((acc, provider) => {
        // Normalize provider name to match activeTab values ('yts' or '1337x')
        const providerKey = provider.name.toLowerCase().includes('yts') ? 'yts' : '1337x';
        acc[providerKey] = provider.torrents;
        return acc;
      }, {});
      setTorrents(allTorrents);

    } catch (err) {
      console.error('Error fetching torrents:', err);
      setError('Could not fetch torrents. Make sure the local torrents-api is running.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderTorrentList = (providerKey) => {
    const providerTorrents = torrents[providerKey] || [];
    
    if (providerTorrents.length === 0) {
      return <p className="text-gray-400 text-center py-4">No results found for this provider.</p>;
    }

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="space-y-3"
      >
        {providerTorrents.map((torrent, index) => (
          <div key={index} className="glass-subtle p-4 rounded-xl flex justify-between items-center transition-all hover:bg-white/10">
            <div className="flex-1 overflow-hidden pr-4">
              <p className="text-white font-semibold truncate" title={torrent.torrentName}>
                {torrent.torrentName}
              </p>
              <div className="flex items-center gap-4 text-xs text-gray-400 mt-1">
                {torrent.torrentSeeds && (
                  <span className="text-green-400 font-medium">Seeds: {torrent.torrentSeeds}</span>
                )}
                {torrent.torrentLeeches && (
                  <span className="text-red-400 font-medium">Leeches: {torrent.torrentLeeches}</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              {torrent.torrentMagnetLink && (
                <a href={torrent.torrentMagnetLink} target="_blank" rel="noopener noreferrer" className="p-2 glass-hover rounded-full text-blue-400 hover:text-blue-300" title="Magnet Link">
                  <MagnetIcon />
                </a>
              )}
              {torrent.torrentDownloadLink && (
                <a href={torrent.torrentDownloadLink} target="_blank" rel="noopener noreferrer" className="p-2 glass-hover rounded-full text-green-400 hover:text-green-300" title="Download Torrent">
                  <DownloadIcon />
                </a>
              )}
            </div>
          </div>
        ))}
      </motion.div>
    );
  };
  
  return (
    <div className="glass rounded-3xl card-spacing border border-white/10 shadow-2xl animate-slide-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-gradient mb-4 sm:mb-0">
          🔗 Find Torrents
        </h2>
        <button
          onClick={searchTorrents}
          disabled={isLoading}
          className="glass-hover flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 px-6 py-3 rounded-xl font-semibold text-white transition-all border border-blue-500/30 touch-manipulation group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
              Searching...
            </>
          ) : (
            <>
              <svg className="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              Search for "{title}"
            </>
          )}
        </button>
      </div>

      {error && <p className="text-red-400 text-center py-4">{error}</p>}
      
      {searched && !isLoading && !error && (
        <>
          <div className="flex border-b border-white/10 mb-4">
            <button
              onClick={() => setActiveTab('1337x')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === '1337x' ? 'text-white border-b-2 border-blue-500' : 'text-gray-400 hover:text-white'}`}
            >
              1337x
            </button>
            <button
              onClick={() => setActiveTab('yts')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'yts' ? 'text-white border-b-2 border-blue-500' : 'text-gray-400 hover:text-white'}`}
            >
              YTS
            </button>
          </div>
          <AnimatePresence mode="wait">
            {renderTorrentList(activeTab)}
          </AnimatePresence>
        </>
      )}
    </div>
  );
};

export default TorrentSearch;