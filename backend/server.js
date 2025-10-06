require('dotenv').config();
const express = require('express');
const cors = require('cors');
const passport = require('passport');
const db = require('./config/db');

// Import models to ensure they are registered with Sequelize
require('./models/User');
require('./models/Transaction');

// Import routes
const authRoutes = require('./routes/authRoutes');
const transactionRoutes = require('./routes/transactionRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(passport.initialize());

// Passport Config
require('./config/passport')(passport);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);

const PORT = process.env.PORT || 5000;

// اتصال به دیتابیس و همگام‌سازی مدل‌ها
const startServer = async () => {
    try {
        await db.authenticate();
        console.log('MySQL Database Connected...');

        // Sync all models with the database
        // alter: true به شما اجازه می‌دهد ستون‌ها را تغییر دهید بدون اینکه داده‌ها حذف شوند (در حالت توسعه مفید است)
        await db.sync({ alter: true }); 
        console.log('All models were synchronized successfully.');

        app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
};

startServer();