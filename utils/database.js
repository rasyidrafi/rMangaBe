require('dotenv').config();
const { Deta } = require('deta');

// Initialize with a project key
const deta = Deta(process.env.DETA_PROJECT_KEY);

// Create or connect to a database
const db = deta.Base('rManga_db'); // You can change the base name
const usersDb = deta.Base('rManga-users');

module.exports = {
    db, usersDb
};