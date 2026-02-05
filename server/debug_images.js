const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('./models/Product');
const connectDB = require('./config/db');

connectDB().then(async () => {
    console.log("Connected to DB");
    const products = await Product.find({}, 'name image');
    console.log("Products and Images:");
    products.forEach(p => {
        console.log(`Name: ${p.name}, Image Path: '${p.image}'`);
    });
    process.exit();
});
