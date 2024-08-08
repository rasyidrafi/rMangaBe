const express = require('express');
const { terbaru } = require('../services/scraping');

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const terbaruManga = await terbaru();
        res.status(200).json(terbaruManga);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
