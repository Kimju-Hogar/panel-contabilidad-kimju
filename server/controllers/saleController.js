const Sale = require('../models/Sale');
const Product = require('../models/Product');

// @desc    Register a new sale
// @route   POST /api/sales
// @access  Private
const createSale = async (req, res) => {
    try {
        const {
            products: saleProducts,
            paymentMethod,
            channel,
            customer
        } = req.body;

        let totalAmount = 0;
        let totalProfit = 0;
        const processedProducts = [];

        // Validate products and stock, calculate totals
        for (const item of saleProducts) {
            const product = await Product.findById(item.product);

            if (!product) {
                return res.status(404).json({ message: `Product not found: ${item.product}` });
            }

            if (product.stock < item.quantity) {
                return res.status(400).json({ message: `Insufficient stock for product: ${product.name}` });
            }

            const subtotal = item.unitPrice * item.quantity;
            const itemProfit = (item.unitPrice - product.costPrice) * item.quantity;

            totalAmount += subtotal;
            totalProfit += itemProfit;

            processedProducts.push({
                product: product._id,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                unitCost: product.costPrice,
                subtotal
            });

            // Deduct Stock
            product.stock -= item.quantity;
            await product.save();
        }

        const sale = new Sale({
            products: processedProducts,
            totalAmount,
            totalProfit,
            paymentMethod,
            channel,
            customer,
            createdBy: req.user ? req.user._id : null // Assuming auth middleware populates req.user
        });

        const createdSale = await sale.save();
        res.status(201).json(createdSale);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all sales
// @route   GET /api/sales
// @access  Private
const getSales = async (req, res) => {
    try {
        const { startDate, endDate, paymentMethod, channel } = req.query;
        let query = {};

        // Date Filter
        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                query.date.$lte = end;
            }
        }

        // Exact Match Filters
        if (paymentMethod) query.paymentMethod = paymentMethod;
        if (channel) query.channel = channel;

        const sales = await Sale.find(query)
            .populate('products.product', 'name sku')
            .populate('createdBy', 'name')
            .sort({ date: -1 });

        res.json(sales);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createSale,
    getSales
};
