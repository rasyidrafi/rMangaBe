const express = require('express');
const chromium = require('@sparticuz/chromium');
const puppeteer = require('puppeteer-core');
const cheerio = require('cheerio');
const cors = require('cors');
const NodeCache = require('node-cache');
const myCache = new NodeCache({ stdTTL: 300 }); // 5 minutes cache

const base = 'https://komikcast.cafe/';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let browser; // Declare a global variable for the browser instance

// Initialize Puppeteer when the server starts
async function initPuppeteer() {
    browser = await puppeteer.launch({
        args: chromium.args,
        executablePath: await chromium.executablePath(),
        headless: 'new',
        ignoreHTTPSErrors: true
    });
}

// Function to process the sidebar list items
const processSidebarLi = (li) => {
    const thumbnail = li.find('.thumbnail-series');
    const image = thumbnail.find('img').attr('src');
    const url = thumbnail.find('a').attr('href');
    const title = thumbnail.find('a').attr('title');
    const info = li.find('.wgt-info-series');
    const rating = info.find('.loveviews').text().trim();
    return {
        title,
        image,
        url,
        rating
    };
};

// Cache HTML content for reuse
const cacheRoot = async () => {
    if (myCache.get('root')) {
        return myCache.get('root');
    }

    if (!browser) {
        throw new Error('Puppeteer not initialized');
    }

    try {
        const page = await browser.newPage();
        await page.goto(base, {
            waitUntil: 'domcontentloaded'
        });
        const content = await page.content();
        await page.close();
        myCache.set('root', content);
        return content;
    } catch (err) {
        console.error('Error caching HTML content:', err);
        throw err;
    }
};

app.get("/popular", async (req, res) => {
    try {
        const content = await cacheRoot();
        const $ = cheerio.load(content);

        const sidebar = $('#sidebar');
        const popular = sidebar.find('.list-series-manga.pop');
        const ul = popular.find('ul');
        const lis = ul.find('li');

        const popularManga = lis.map((i, el) => processSidebarLi($(el))).get();
        res.status(200).json(popularManga);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).send('Internal Server Error');
    }
});

app.get("/terbaru", async (req, res) => {
    try {
        const content = await cacheRoot();
        const $ = cheerio.load(content);

        // Implement processing logic for /terbaru route here
        // For example:
        // const terbaruSection = $('#terbaru');
        // const terbaruManga = terbaruSection.find('li').map((i, el) => processSidebarLi($(el))).get();

        res.status(200).json({ message: 'Terbaru endpoint is under construction.' });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).send('Internal Server Error');
    }
});

app.get("/detail", async (req, res) => {
    let url = req.query.url;
    // Implement detail retrieval logic here
});

const port = process.env.PORT || 3000;
app.listen(port, async () => {
    await initPuppeteer();
    console.log('Server is running on port ' + port);
});

// Handle server shutdown
process.on('SIGINT', async () => {
    if (browser) {
        await browser.close();
    }
    process.exit();
});
