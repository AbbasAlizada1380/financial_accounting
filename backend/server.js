require('dotenv').config();
const express = require('express');
const cors = require('cors');
const passport = require('passport');
const db = require('./config/db');
const path = require('path');

// Import models to ensure they are registered with Sequelize
require('./models/User');
require('./models/Transaction');
require('./models/Budget'); // NEW
require('./models/Goal');   // NEW

// Import routes
const authRoutes = require('./routes/authRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const userRoutes = require('./routes/userRoutes');
const profileRoutes = require('./routes/profileRoutes');
const budgetRoutes = require('./routes/budgetRoutes'); // NEW
const goalRoutes = require('./routes/goalRoutes');     // NEW

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(passport.initialize());

// Passport Config
require('./config/passport')(passport);
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/users', userRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/budgets', budgetRoutes); // NEW
app.use('/api/goals', goalRoutes);     // NEW

// Health check route
app.get('/api/health', (req, res) => {
    res.status(200).json({ 
        message: 'Server is running', 
        timestamp: new Date().toISOString() 
    });
});

const PORT = process.env.PORT || 5000;

// Database connection and model synchronization
const startServer = async () => {
    try {
        await db.authenticate();
        console.log('MySQL Database Connected...');

        // Sync all models with the database
        await db.sync({ alter: true }); 
        console.log('All models were synchronized successfully.');

        app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
};

startServer();