const Transaction = require('../models/Transaction');

// @desc    Get all transactions for the logged-in user
// @route   GET /api/transactions
exports.getTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.findAll({
            where: { userId: req.user.id },
            order: [['date', 'DESC']], // مرتب‌سازی بر اساس تاریخ، جدیدترین‌ها اول
        });
        res.status(200).json(transactions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Add a new transaction
// @route   POST /api/transactions
exports.addTransaction = async (req, res) => {
    const { description, amount, type, category, date } = req.body;

    try {
        if (!description || !amount || !type) {
            return res.status(400).json({ message: 'Description, amount, and type are required.' });
        }
        
        const newTransaction = await Transaction.create({
            description,
            amount,
            type,
            category,
            date,
            userId: req.user.id // اتصال تراکنش به کاربر لاگین کرده
        });

        res.status(201).json(newTransaction);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
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

        // بسیار مهم: اطمینان حاصل کنید که کاربر فقط تراکنش‌های خودش را حذف می‌کند
        if (transaction.userId !== req.user.id) {
            return res.status(403).json({ message: 'Forbidden: You can only delete your own transactions.' });
        }

        await transaction.destroy();
        res.status(200).json({ message: 'Transaction deleted successfully.' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};