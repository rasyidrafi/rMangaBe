const express = require('express');
const { popular } = require('../services/scraping');

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const popularManga = await popular();
        res.status(200).json(popularManga);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
