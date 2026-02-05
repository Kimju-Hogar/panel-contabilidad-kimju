const express = require('express');
const router = express.Router();
const { createSale, getSales, getSalesByProduct } = require('../controllers/saleController');
// const { protect } = require('../middleware/authMiddleware'); // TODO: Add middleware

router.route('/')
    .post(createSale)
    .get(getSales);

router.get('/by-product', getSalesByProduct);

module.exports = router;
