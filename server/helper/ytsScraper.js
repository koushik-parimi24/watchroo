const cheerio = require('cheerio');
const getHTML = require('./getHTML');

const url = 'https://yts.pm';

const scrapeYTS = async (searchTerm) => {
  try {
    // Use encodeURIComponent to properly handle special characters in the search term
    const encodedSearch = encodeURIComponent(searchTerm);
    const searchUrl = `${url}/browse-movies/${encodedSearch}/all/all/0/latest`;
    
    console.log('Fetching from YTS:', searchUrl);
    const html = await getHTML(searchUrl);
    
    if (!html) {
      console.log('No HTML content received from YTS');
      return [];
    }

    const $ = cheerio.load(html);
    const torrents = [];

    $('.browse-movie-wrap').each((i, el) => {
      try {
        const movieName = $(el).find('.browse-movie-title').text().trim();
        const torrentUrl = $(el).find('.browse-movie-link').attr('href');

        if (movieName && torrentUrl) {
          torrents.push({
            torrentName: movieName,
            torrentUrl,
          });
        }
      } catch (parseError) {
        console.log('Error parsing movie element:', parseError.message);
        // Continue with next element
      }
    });

    console.log(`Found ${torrents.length} movies on YTS`);
    return torrents;
  } catch (error) {
    console.error('YTS scraping error:', error);
    throw new Error(`YTS scraping failed: ${error.message}`);
  }
};

const scrapeYTSLink = async (torrentUrl) => {
  const html = await getHTML(torrentUrl);
  if (!html) return [];

  const $ = cheerio.load(html);
  const downloadLinks = [];

  $('.modal-torrent').each((i, el) => {
    const quality = $(el).find('.modal-quality').text();
    const torrentDownloadLink = $(el).find('.download-torrent').attr('href');
    
    if (quality && torrentDownloadLink) {
      downloadLinks.push({
        quality,
        torrentDownloadLink,
      });
    }
  });

  return downloadLinks;
};

module.exports = { scrapeYTS, scrapeYTSLink };