const express = require('express');
const router = express.Router();
const { createSale, getSales, getSalesByProduct, updateSale, deleteSale } = require('../controllers/saleController');
// const { protect } = require('../middleware/authMiddleware'); // TODO: Add middleware

router.route('/')
    .post(createSale)
    .get(getSales);

router.route('/:id')
    .put(updateSale)
    .delete(deleteSale);

router.get('/by-product', getSalesByProduct);

module.exports = router;
