const { scrape1337x, get1337xMagnet } = require('../helper/_1337xScraper');
const { scrapeYTS, scrapeYTSLink } = require('../helper/ytsScraper');

const searchTorrents = async (req, res) => {
  const { searchTerm } = req.query;
  if (!searchTerm) {
    return res.status(400).json({ error: true, message: 'Search term is required' });
  }

  try {
    const [torrents1337x, ytsTorrents] = await Promise.all([
      scrape1337x(searchTerm).catch(err => ({ error: err.message })),
      scrapeYTS(searchTerm).catch(err => ({ error: err.message })),
    ]);

    const payload = [
      { name: '1337x', torrents: torrents1337x.error ? [] : torrents1337x },
      { name: 'YTS', torrents: ytsTorrents.error ? [] : ytsTorrents },
    ];

    // If both scrapers failed, return an error
    if (torrents1337x.error && ytsTorrents.error) {
      console.error('Scraper errors:', { x1337: torrents1337x.error, yts: ytsTorrents.error });
      return res.status(500).json({ 
        error: true, 
        message: 'Failed to fetch results from torrent sources',
        details: {
          x1337: torrents1337x.error,
          yts: ytsTorrents.error
        }
      });
    }

    res.json({ error: false, payload });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: true, message: 'Internal server error', details: error.message });
  }
};

const getTorrentMagnet = async (req, res) => {
  const { url, torrentSource } = req.query;
  if (!url || !torrentSource) {
    return res.status(400).json({ error: true, message: 'URL and torrent source are required' });
  }

  try {
    let torrents;
    if (torrentSource.toLowerCase() === '1337x') {
      torrents = await get1337xMagnet(url);
    } else if (torrentSource.toLowerCase() === 'yts') {
      torrents = await scrapeYTSLink(url);
    } else {
      return res.status(400).json({ error: true, message: 'Invalid torrent source' });
    }

    res.json({ error: false, payload: { torrents } });
  } catch (error) {
    res.status(500).json({ error: true, message: 'Something went wrong' });
  }
};

module.exports = { searchTorrents, getTorrentMagnet };