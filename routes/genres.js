const express = require('express');
const { genres } = require('../services/scraping');

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const genreList = await genres();
        res.status(200).json(genreList);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
