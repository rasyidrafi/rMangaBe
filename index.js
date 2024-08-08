require('dotenv').config(); // Load environment variables

const express = require('express');
const cors = require('cors');
const { initPuppeteer, closePuppeteer } = require('./utils/puppeteer');
const indexRoute = require('./routes/index');
const popularRoute = require('./routes/popular');
const terbaruRoute = require('./routes/terbaru');
const genresRoute = require('./routes/genres');
const authRoute = require('./routes/auth');
const authMiddleware = require('./middleware/auth');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Auth routes
app.use('/auth', authRoute);

app.use('/', authMiddleware, indexRoute);
app.use('/popular', authMiddleware,  popularRoute);
app.use('/terbaru', authMiddleware, terbaruRoute);
app.use('/genres', authMiddleware, genresRoute);

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
