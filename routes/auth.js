const express = require('express');
const { usersDb } = require('../utils/database');
const { hashPassword, comparePassword, generateToken } = require('../utils/auth');

const router = express.Router();

// Register a new user
router.post('/register', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    const hashedPassword = await hashPassword(password);
    try {
        const newUser = await usersDb.put({ email, password: hashedPassword });
        res.status(201).json({ message: 'User registered successfully', user: newUser });
    } catch (err) {
        res.status(500).json({ message: 'Error registering user', error: err.message });
    }
});

// Login a user
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        const user = await usersDb.fetch({ email }).next();
        if (user.count === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const validPassword = await comparePassword(password, user.items[0].password);
        if (!validPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = generateToken(user.items[0]);
        res.status(200).json({ message: 'Login successful', token });
    } catch (err) {
        res.status(500).json({ message: 'Error logging in', error: err.message });
    }
});

// Logout a user (for token-based auth, this is client-side; just an example)
router.post('/logout', (req, res) => {
    res.status(200).json({ message: 'Logout successful' });
});

module.exports = router;
