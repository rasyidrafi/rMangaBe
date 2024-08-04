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
        throw new Error('Puppeteer initialization failed.');
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

const popular = async () => {
    const content = await cacheRoot();
    const $ = cheerio.load(content);

    const sidebar = $('#sidebar');
    const popular = sidebar.find('.list-series-manga.pop');
    const ul = popular.find('ul');
    const lis = ul.find('li');

    const popularManga = lis.map((i, el) => processSidebarLi($(el))).get();
    return popularManga;
}
app.get("/popular", async (req, res) => {
    try {
        const popularManga = await popular();
        res.status(200).json(popularManga);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).send('Internal Server Error');
    }
});

// Function to process the sidebar list items
const processNewDiv = (div) => {
    //     <div class="post-item-box">
    //         <div class="post-item-bx-top">
    //             <a
    //                 href="https://komikcast.cafe/komik/shitsugyou-kenja-no-nariagari/"
    //                 itemprop="url"
    //                 title="Komik Shitsugyou Kenja no Nariagari"
    //                 alt="Komik Shitsugyou Kenja no Nariagari"
    //                 rel="bookmark"
    //             >
    //                 <div class="limietles">
    //                     <img
    //                         src="https://komikcast.cafe/wp-content/uploads/2021/07/Komik-Shitsugyou-Kenja-no-Nariagari-79x114.jpg"
    //                         title=" Shitsugyou Kenja no Nariagari"
    //                         itemprop="image"
    //                     />
    //                 </div>
    //                 <div class="post-item-bx-top-bottom">
    //                     <div class="post-item-title">
    //                         <h4>Shitsugyou Kenja no Nariagari</h4>
    //                     </div>
    //                     <div class="info-post-item-box">
    //                         <div class="flex-infopost-item info-col-post-item">
    //                             <i class="fas fa-star"></i> 6.6
    //                         </div>
    //                         <div class="flex-infopost-item info-col-post-item">
    //                             <span class="flag-country-type Manga"></span> Manga
    //                         </div>
    //                         <div class="flex-infopost-item info-col-post-item">
    //                             <i class="far fa-eye"></i> 22 rb
    //                         </div>
    //                         <div class="flex-infopost-item info-col-post-item">
    //                             <i class="fas fa-palette"></i> Hitam Putih
    //                         </div>
    //                     </div>
    //                 </div>
    //             </a>
    //         </div>
    //         <div class="post-item-lsch-bottom">
    //             <div class="info-post-item-box">
    //                 <div
    //                     class="flex-infopost-item info-col-post-item status-post-item Ongoing"
    //                 >
    //                     <i class="fas fa-circle"></i> Ongoing
    //                 </div>
    //                 <div class="flex-infopost-item info-col-post-item list-ch-post-item-bx">
    //                     <div class="lsch">
    //                         <a
    //                             href="https://komikcast.cafe/shitsugyou-kenja-no-nariagari-chapter-66/"
    //                             itemprop="url"
    //                             rel="bookmark"
    //                             title="Komik Shitsugyou Kenja no Nariagari Chapter 66"
    //                         >Ch. 66</a
    //                         >
    //                     </div>
    //                     <div class="lsch">
    //                         <a
    //                             href="https://komikcast.cafe/shitsugyou-kenja-no-nariagari-chapter-65/"
    //                             itemprop="url"
    //                             rel="bookmark"
    //                             title="Komik Shitsugyou Kenja no Nariagari Chapter 65"
    //                         >Ch. 65</a
    //                         >
    //                     </div>
    //                     <div class="lsch">
    //                         <a
    //                             href="https://komikcast.cafe/shitsugyou-kenja-no-nariagari-chapter-64/"
    //                             itemprop="url"
    //                             rel="bookmark"
    //                             title="Komik Shitsugyou Kenja no Nariagari Chapter 64"
    //                         >Ch. 64</a
    //                         >
    //                     </div>
    //                 </div>
    //             </div>
    //         </div>
    //     </div>
    // </div >

    // Extract title
    const title = div.find('.post-item-title').text().trim();

    // Extract image URL
    const image = div.find('.limietles img').attr('src');

    // Extract rating
    const rating = div.find('.info-post-item-box').first().find('.info-col-post-item').eq(0).text().trim();

    // Extract genre
    const type = div.find('.info-post-item-box').first().find('.info-col-post-item').eq(1).text().trim();

    // Extract views
    const views = div.find('.info-post-item-box').first().find('.info-col-post-item').eq(2).text().trim();

    // Extract style
    const style = div.find('.info-post-item-box').first().find('.info-col-post-item').eq(3).text().trim();

    // Extract status
    const status = div.find('.status-post-item').text().trim();

    // Extract chapter links
    // const chapters = div.find('.list-ch-post-item-bx .lsch a').map((i, el) => {
    //     return {
    //         title: $(el).text().trim(),
    //         url: $(el).attr('href')
    //     };
    // }).get();
    const last_chapter = div.find('.list-ch-post-item-bx .lsch').first().find('a').text().trim()

    return {
        title,
        image,
        rating,
        type,
        views,
        style,
        status,
        last_chapter
        // chapters
    };
};

const terbaru = async () => {
    const content = await cacheRoot();
    const $ = cheerio.load(content);

    const container = $('#container');
    const latestChapter = container.find('.post-padd.latest-chapter-padd');
    const lastUpdate = latestChapter.find('.list-update.latest-update-ch-v2');
    const divs = lastUpdate.find(".post-item");

    const terbaruManga = divs.map((i, el) => processNewDiv($(el))).get();
    return terbaruManga;
}
app.get("/terbaru", async (req, res) => {
    try {
        const terbaruManga = await terbaru();
        res.status(200).json(terbaruManga);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).send('Internal Server Error');
    }
});

const processGenre = (div) => {
    // <div class="post-item">
    //     <div class="post-item-box">
    //         <a href="https://komikcast.cafe/komik/tayutau-kemuri-wa-tsukamenai/" itemprop="url" title="Komik Tayutau Kemuri wa Tsukamenai" alt="Komik Tayutau Kemuri wa Tsukamenai" rel="bookmark">
    //             <div class="post-item-thumb">
    //                 <div class="backdrop-thumb"></div>
    //                 <span class="flag-country-type Manga"></span> <img src="https://komikcast.cafe/wp-content/uploads/2023/09/Komik-Tayutau-Kemuri-wa-Tsukamenai-201x285.webp" title=" Tayutau Kemuri wa Tsukamenai" itemprop="image">      </div>
    //             <div class="post-item-ttl-s">
    //                 <div class="post-item-title">
    //                     <h4>Tayutau Kemuri wa Tsukamenai</h4>
    //                 </div>
    //                 <div class="post-item-additio">
    //                     <div class="rating">
    //                         <div class="rating-score-manga"><div class="clearfix archive-manga-rating"><div class="archive-manga-rating-content"><div class="archive-manga-rating-bar"><span style="width:70%"></span></div></div></div></div>  <i>7</i></div>
    //                 </div>
    //             </div>
    //         </a>
    //     </div>
    // </div>

    const title = div.find('.post-item-title').text().trim();
    const image = div.find('.post-item-thumb img').attr('src');
    const rating = div.find('.rating i').text().trim();

    // get type from //                 <span class="flag-country-type Manga"> <== after flag-country-type
    const flagCountry = div.find('.flag-country-type');
    const classAttribute = flagCountry.attr('class');

    const classParts = classAttribute.split(' ');
    const type = classParts.find(cls => cls !== 'flag-country-type');

    return {
        title,
        image,
        rating,
        type,
    }
}

const genres = async () => {
    const content = await cacheRoot();
    const $ = cheerio.load(content);

    const container = $('#container');
    const tabGenre = container.find('.block-box.block-tab-genre');
    const paddContent = tabGenre.find('.padd-content');
    const ulGenreList = paddContent.find(".idTabs.tabs-menu.custom-tab-menu")
    const genreLis = ulGenreList.find("li");

    const genreList = [];

    genreLis.each((i, el) => {
        const id = $(el).find("a").attr("href").replace("#", "");
        const title = $(el).text().trim();
        genreList.push({ id, title });
    })


    const postPadd = paddContent.find(".post-padd");
    const customSlider = postPadd.find(".list-update.customslider");
    const genreData = customSlider.find(".jonathan-slider");

    for (let i = 0; i < genreList.length; i++) {
        let id = genreList[i].id;
        const data = genreData.find(`#${id}`);
        const rawDatas = data.find(".post-item");
        const parsedDatas = rawDatas.map((i, el) => processGenre($(el))).get();
        genreList[i].data = parsedDatas;
    }

    return genreList;
};

app.get("/", async (req, res) => {
    try {
        // both popular and terbaru
        const popularManga = await popular();
        const terbaruManga = await terbaru();
        const genre_list = await genres();

        res.status(200).json({
            popular: popularManga,
            terbaru: terbaruManga,
            genre_list
        });
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
    console.log('Starting server...');
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
