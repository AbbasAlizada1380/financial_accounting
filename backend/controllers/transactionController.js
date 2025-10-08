const Transaction = require('../models/Transaction');
const { Op } = require('sequelize');

// Helper functions for date calculations
function startOfMonth(date) {
    return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);
}

// @desc    Get all transactions for the logged-in user with filters
// @route   GET /api/transactions
exports.getTransactions = async (req, res) => {
    try {
        const { type, category, startDate, endDate, search, page = 1, limit = 50 } = req.query;
        
        const whereClause = { userId: req.user.id };
        
        // Add filters
        if (type && type !== 'all') {
            whereClause.type = type;
        }
        
        if (category && category !== 'all') {
            whereClause.category = category;
        }
        
        if (startDate && endDate) {
            whereClause.date = {
                [Op.between]: [new Date(startDate), new Date(endDate)]
            };
        }
        
        if (search) {
            whereClause.description = {
                [Op.like]: `%${search}%`
            };
        }

        const offset = (page - 1) * limit;
        
        const transactions = await Transaction.findAndCountAll({
            where: whereClause,
            order: [['date', 'DESC']],
            limit: parseInt(limit),
            offset: offset
        });

        res.status(200).json({
            transactions: transactions.rows,
            totalCount: transactions.count,
            totalPages: Math.ceil(transactions.count / limit),
            currentPage: parseInt(page)
        });
    } catch (error) {
        console.error('Get transactions error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Add a new transaction
// @route   POST /api/transactions
exports.addTransaction = async (req, res) => {
    const { description, amount, type, category, date, recurring, recurringInterval, notes } = req.body;

    try {
        if (!description || !amount || !type) {
            return res.status(400).json({ message: 'Description, amount, and type are required.' });
        }
        
        const newTransaction = await Transaction.create({
            description,
            amount,
            type,
            category: category || 'General',
            date: date || new Date(),
            recurring: recurring || false,
            recurringInterval,
            notes,
            userId: req.user.id
        });

        res.status(201).json(newTransaction);
    } catch (error) {
        console.error('Add transaction error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Update a transaction
// @route   PUT /api/transactions/:id
exports.updateTransaction = async (req, res) => {
    try {
        const transaction = await Transaction.findByPk(req.params.id);

        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found.' });
        }

        if (transaction.userId !== req.user.id) {
            return res.status(403).json({ message: 'Forbidden: You can only update your own transactions.' });
        }

        const { description, amount, type, category, date, notes } = req.body;
        
        await transaction.update({
            description: description || transaction.description,
            amount: amount || transaction.amount,
            type: type || transaction.type,
            category: category || transaction.category,
            date: date || transaction.date,
            notes: notes || transaction.notes
        });

        res.status(200).json(transaction);
    } catch (error) {
        console.error('Update transaction error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Delete a transaction
// @route   DELETE /api/transactions/:id
exports.deleteTransaction = async (req, res) => {
    try {
        const transaction = await Transaction.findByPk(req.params.id);

        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found.' });
        }

        if (transaction.userId !== req.user.id) {
            return res.status(403).json({ message: 'Forbidden: You can only delete your own transactions.' });
        }

        await transaction.destroy();
        res.status(200).json({ message: 'Transaction deleted successfully.' });

    } catch (error) {
        console.error('Delete transaction error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get transaction statistics
// @route   GET /api/transactions/stats
exports.getTransactionStats = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        const whereClause = { userId: req.user.id };
        
        if (startDate && endDate) {
            whereClause.date = {
                [Op.between]: [new Date(startDate), new Date(endDate)]
            };
        }

        const transactions = await Transaction.findAll({
            where: whereClause,
            attributes: ['type', 'amount', 'category', 'date']
        });

        const totalIncome = transactions
            .filter(tx => tx.type === 'income')
            .reduce((acc, tx) => acc + parseFloat(tx.amount), 0);

        const totalExpenses = transactions
            .filter(tx => tx.type === 'expense')
            .reduce((acc, tx) => acc + parseFloat(tx.amount), 0);

        const categoryBreakdown = transactions
            .filter(tx => tx.type === 'expense')
            .reduce((acc, tx) => {
                const category = tx.category || 'General';
                acc[category] = (acc[category] || 0) + parseFloat(tx.amount);
                return acc;
            }, {});

        res.status(200).json({
            totalIncome,
            totalExpenses,
            netSavings: totalIncome - totalExpenses,
            categoryBreakdown,
            transactionCount: transactions.length
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};