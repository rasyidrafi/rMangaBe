require('dotenv').config(); // Load environment variables

const express = require('express');
const cors = require('cors');
const { initPuppeteer, closePuppeteer } = require('./utils/puppeteer');
const indexRoute = require('./routes/index');
const popularRoute = require('./routes/popular');
const terbaruRoute = require('./routes/terbaru');
const genresRoute = require('./routes/genres');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/', indexRoute);
app.use('/popular', popularRoute);
app.use('/terbaru', terbaruRoute);
app.use('/genres', genresRoute);

const port = process.env.PORT || 3000;
app.listen(port, async () => {
    console.log('Starting server...');
    await initPuppeteer();
    console.log('Server is running on port ' + port);
});

// Handle server shutdown
process.on('SIGINT', async () => {
    await closePuppeteer();
    process.exit();
});
