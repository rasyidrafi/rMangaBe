const cheerio = require('cheerio');
const { cacheRoot } = require('../utils/cache');
const base = process.env.BASE_URL; // Use environment variable for base URL

const processSidebarLi = (li) => {
    const thumbnail = li.find('.thumbnail-series');
    const image = thumbnail.find('img').attr('src');
    const url = thumbnail.find('a').attr('href');
    const title = thumbnail.find('a').attr('title');
    const info = li.find('.wgt-info-series');
    const rating = info.find('.loveviews').text().trim();
    return { title, image, url, rating };
};

const processNewDiv = (div) => {
    const title = div.find('.post-item-title').text().trim();
    const image = div.find('.limietles img').attr('src');
    const rating = div.find('.info-post-item-box').first().find('.info-col-post-item').eq(0).text().trim();
    const type = div.find('.info-post-item-box').first().find('.info-col-post-item').eq(1).text().trim();
    const views = div.find('.info-post-item-box').first().find('.info-col-post-item').eq(2).text().trim();
    const style = div.find('.info-post-item-box').first().find('.info-col-post-item').eq(3).text().trim();
    const status = div.find('.status-post-item').text().trim();
    const last_chapter = div.find('.list-ch-post-item-bx .lsch').first().find('a').text().trim();

    return {
        title,
        image,
        rating,
        type,
        views,
        style,
        status,
        last_chapter
    };
};

const processGenre = (div) => {
    const title = div.find('.post-item-title').text().trim();
    const image = div.find('.post-item-thumb img').attr('src');
    const rating = div.find('.rating i').text().trim();
    const flagCountry = div.find('.flag-country-type');
    const classAttribute = flagCountry.attr('class');
    const classParts = classAttribute.split(' ');
    const type = classParts.find(cls => cls !== 'flag-country-type');

    return {
        title,
        image,
        rating,
        type,
    };
};

const popular = async () => {
    const content = await cacheRoot(base);
    const $ = cheerio.load(content);
    const lis = $('#sidebar .list-series-manga.pop ul li');
    return lis.map((i, el) => processSidebarLi($(el))).get();
};

const terbaru = async () => {
    const content = await cacheRoot(base);
    const $ = cheerio.load(content);
    const divs = $('#container .post-padd.latest-chapter-padd .list-update.latest-update-ch-v2 .post-item');
    return divs.map((i, el) => processNewDiv($(el))).get();
};

const genres = async () => {
    const content = await cacheRoot(base);
    const $ = cheerio.load(content);

    const container = $('#container');
    const tabGenre = container.find('.block-box.block-tab-genre');
    const paddContent = tabGenre.find('.padd-content');
    const ulGenreList = paddContent.find(".idTabs.tabs-menu.custom-tab-menu li");

    const genreList = ulGenreList.map((i, el) => {
        const id = $(el).find("a").attr("href").replace("#", "");
        const title = $(el).text().trim();
        return { id, title, data: [] };
    }).get();

    const customSlider = paddContent.find(".list-update.customslider");
    const genreData = customSlider.find(".jonathan-slider");

    genreList.forEach(genre => {
        const data = genreData.find(`#${genre.id}`);
        const rawDatas = data.find(".post-item");
        genre.data = rawDatas.map((i, el) => processGenre($(el))).get();
    });

    return genreList;
};

module.exports = {
    popular,
    terbaru,
    genres
};
