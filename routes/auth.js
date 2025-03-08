const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

router.post('/login', function(req, res, next) {
    const { userID, password } = req.body;
    if (userID !== 'admin' || password !== 'admin') {
        return res.status(401).json({ code: -1, message: 'Invalid username or password', data: null });
    }

    const token = jwt.sign({ userID, username: "AptS:1547", grade: "2023", className: "高一一班" }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return res.status(200).json({ code: 0, message: 'Login successful', data: { accessToken: token } });
});

module.exports = router;
