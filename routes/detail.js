const express = require('express');

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        res.status(200).json({ "status": "ok" });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
