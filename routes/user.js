const express = require('express');
const router = express.Router();

router.get('/:code', function(req, res, next) {
    const { code } = req.params;
    res.status(code).send('respond with a resource');
});

module.exports = router;