const express = require('express');
const { genres, popular,terbaru } = require('../services/scraping');

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const popularManga = await popular();
        const terbaruManga = await terbaru();
        const genreList = await genres();
        res.status(200).json({ popular: popularManga, terbaru: terbaruManga, genre_list: genreList });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
