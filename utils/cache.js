const NodeCache = require('node-cache');
const { getBrowser } = require('./puppeteer');

const myCache = new NodeCache({ stdTTL: 300 });

const cacheRoot = async (url) => {
    if (myCache.get('root')) {
        return myCache.get('root');
    }

    try {
        const browser = getBrowser();
        const page = await browser.newPage();
        await page.goto(url, {
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

module.exports = {
    cacheRoot
};
