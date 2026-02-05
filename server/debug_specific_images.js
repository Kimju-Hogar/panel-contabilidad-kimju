const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

const checkImages = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/panel-contabilidad');
        console.log('Connected to DB');

        const products = await Product.find({ name: { $in: ['tasa', 'reloj'] } });

        console.log('--- Product Image Paths ---');
        products.forEach(p => {
            console.log(`Product: ${p.name}`);
            console.log(`Image Raw: '${p.image}'`);
        });
        console.log('---------------------------');

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkImages();
