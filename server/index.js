const express = require('express');
const cors = require('cors');
const torrentController = require('./controller/torrentController');

const app = express();
const port = 3000;

// Enable CORS for all routes
app.use(cors());

// Define API routes
app.get('/api/search', torrentController.searchTorrents);
app.get('/api/search/torrent', torrentController.getTorrentMagnet);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});