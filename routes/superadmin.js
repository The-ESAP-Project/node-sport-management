const express = require('express');
const router = express.Router();

router.get('/dashboard', (req, res) => {
    res.json({ code: 0, message: 'Superadmin dashboard', data: null });
}
);

module.exports = router;