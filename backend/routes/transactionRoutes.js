const express = require('express');
const router = express.Router();
const { getTransactions, addTransaction, updateTransaction, deleteTransaction, getTransactionStats } = require('../controllers/transactionController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getTransactions)
    .post(protect, addTransaction);

router.route('/:id')
    .put(protect, updateTransaction)
    .delete(protect, deleteTransaction);

router.get('/stats', protect, getTransactionStats); // NEW

module.exports = router;