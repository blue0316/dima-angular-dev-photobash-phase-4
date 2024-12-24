// Get dependencies
const express = require('express');
const path = require('path');
const http = require('http');
const app = express();
const cron = require('node-cron');
const request = require('request');
/**
 * Schedule cron for subcription update
 * 0 0 0 * * *
 */
cron.schedule('0 0 0 * * *', () => {
  console.log('Cron Fired for', new Date());
  request({
    method: 'GET',
    rejectUnauthorized: false,
    url: 'https://admin.photobash.co/cron/sub_status_1f3858053',
    headers: { 'Content-Type': 'application/json' }
  })
    .on('response', function(response) {
      console.log(response.statusCode); // 200
    })
    .on('error', err => {
      console.log('====================================');
      console.log('error', err);
      console.log('====================================');
    });
});
// Point static path to dist
app.use(express.static(path.join(__dirname, 'dist')));

// Catch all other routes and return the index file
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});
/**
 * Get port from environment and store in Express.
 */
const port = process.env.PORT || '4200';

app.set('port', port);
/**
 * Create HTTP server.
 */
const server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */
server.listen(port, () => console.log(`API running on PORT :${port}`));
