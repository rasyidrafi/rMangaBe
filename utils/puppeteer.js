const chromium = require('@sparticuz/chromium');
const puppeteer = require('puppeteer-core');

let browser;

const initPuppeteer = async () => {
    try {
        console.log('Initializing Puppeteer...');
        browser = await puppeteer.launch({
            args: chromium.args,
            executablePath: await chromium.executablePath(),
            headless: 'new',
            ignoreHTTPSErrors: true
        });
        console.log('Puppeteer initialized successfully.');
    } catch (error) {
        console.error('Error initializing Puppeteer:', error);
    }
};

const closePuppeteer = async () => {
    if (browser) {
        await browser.close();
        console.log('Puppeteer closed.');
    }
};

const getBrowser = () => {
    if (!browser) {
        throw new Error('Puppeteer not initialized.');
    }
    return browser;
};

module.exports = {
    initPuppeteer,
    closePuppeteer,
    getBrowser
};
