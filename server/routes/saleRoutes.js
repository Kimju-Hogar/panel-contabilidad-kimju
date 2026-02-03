const express = require('express');
const router = express.Router();
const { createSale, getSales } = require('../controllers/saleController');
// const { protect } = require('../middleware/authMiddleware'); // TODO: Add middleware

router.route('/')
    .post(createSale)
    .get(getSales);

module.exports = router;
