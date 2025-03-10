const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/UserModel');

router.post('/login', async function(req, res, next) {
    const { username, password } = req.body;
    try {

        if (!username || !password) {
            return res.status(401).json({ code: -1, message: 'Invalid username or password', data: null });
        }

        const user = await User.findOne({ where: { username: username, password: password } });

        if (!user) {
            return res.status(401).json({ code: -1, message: 'Invalid username or password', data: null });
        }

        const token = jwt.sign({ username: username, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

        return res.status(200).json({ code: 0, message: 'Login success', data: { token: token } });
    } catch (err) {
        return res.status(500).json({ code: -1, message: err.message, data: null });
    }
});

module.exports = router;
