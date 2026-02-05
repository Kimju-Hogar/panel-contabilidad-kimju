const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const adminEmail = 'soporte@kimjuhogar.com';
        const adminPassword = 'k1mjuh0g4r';

        const userExists = await User.findOne({ email: adminEmail });

        if (userExists) {
            console.log('Admin user already exists');
            // Optional: Update password if needed
            // userExists.password = adminPassword;
            // await userExists.save();
            // console.log('Admin password updated');
        } else {
            const user = await User.create({
                name: 'Admin Kimju',
                email: adminEmail,
                password: adminPassword,
                role: 'admin'
            });
            console.log(`Admin user created: ${user.email}`);
        }

        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

seedAdmin();
