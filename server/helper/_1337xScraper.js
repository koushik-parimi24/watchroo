const cheerio = require('cheerio');
const getHTML = require('./getHTML');

const url = 'https://www.1337x.to';

const scrape1337x = async (searchTerm) => {
  try {
    // Use encodeURIComponent to properly handle special characters in the search term
    const encodedSearch = encodeURIComponent(searchTerm);
    const searchUrl = `${url}/search/${encodedSearch}/1/`;
    
    console.log('Fetching from 1337x:', searchUrl);
    const html = await getHTML(searchUrl);
    
    if (!html) {
      console.log('No HTML content received from 1337x');
      return [];
    }

    const $ = cheerio.load(html);
    const torrents = [];

    $('tbody tr').each((i, el) => {
      try {
        const torrentName = $(el).find('.name').text().trim();
        const torrentUrl = url + $(el).find('.name a').next().attr('href');
        const torrentSeeds = $(el).find('.seeds').text().trim();
        const torrentLeeches = $(el).find('.leeches').text().trim();
        
        if (torrentName && torrentUrl) {
          torrents.push({
            torrentName,
            torrentUrl,
            torrentSeeds,
            torrentLeeches,
          });
        }
      } catch (parseError) {
        console.log('Error parsing torrent row:', parseError.message);
        // Continue with next row
      }
    });

    console.log(`Found ${torrents.length} torrents on 1337x`);
    return torrents;
  } catch (error) {
    console.error('1337x scraping error:', error);
    throw new Error(`1337x scraping failed: ${error.message}`);
  }
};

const get1337xMagnet = async (torrentUrl) => {
  try {
    const html = await getHTML(torrentUrl);
    const $ = cheerio.load(html);
    const magnetLink = $('.clearfix ul li a').attr('href');
    
    if (!magnetLink) {
      throw new Error('Magnet link not found');
    }
    
    return magnetLink;
  } catch (error) {
    throw new Error(`Failed to get magnet link: ${error.message}`);
  }
};

module.exports = { scrape1337x, get1337xMagnet };