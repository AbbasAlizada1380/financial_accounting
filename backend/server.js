require('dotenv').config();
const express = require('express');
const cors = require('cors');
const passport = require('passport');
const db = require('./config/db');
const path = require('path');

require('./models/User');
require('./models/Transaction');
require('./models/Budget'); 
require('./models/Goal');   

const authRoutes = require('./routes/authRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const userRoutes = require('./routes/userRoutes');
const profileRoutes = require('./routes/profileRoutes');
const budgetRoutes = require('./routes/budgetRoutes'); 
const goalRoutes = require('./routes/goalRoutes');     

const app = express();

// CORS configuration for production
app.use(cors({
    origin: [
        'http://yougoal.tanmadonprintingpress.com',
        'https://yougoal.tanmadonprintingpress.com',
        'http://backendyougoal.tanmadonprintingpress.com',
        'https://backendyougoal.tanmadonprintingpress.com'
    ],
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(passport.initialize());

require('./config/passport')(passport);

// Serve static files from React build
app.use(express.static(path.join(__dirname, '../client/build')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/users', userRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/goals', goalRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({ 
        message: 'Server is running', 
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Serve React app for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

const PORT = process.env.PORT || 5000;

// Database connection and model synchronization
const startServer = async () => {
    try {
        await db.authenticate();
        console.log('MySQL Database Connected...');

        // Sync all models with the database
        await db.sync({ alter: false }); // Changed to false for production
        console.log('All models were synchronized successfully.');

        app.listen(PORT, '0.0.0.0', () => {
            console.log(`Server started on port ${PORT}`);
            console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
        });
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        process.exit(1);
    }
};

startServer();