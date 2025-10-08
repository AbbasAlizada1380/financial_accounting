const express = require('express');
const router = express.Router();
const { getBudgets, createBudget, updateBudget, deleteBudget, getBudgetStats } = require('../controllers/budgetController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getBudgets)
    .post(protect, createBudget);

router.route('/:id')
    .put(protect, updateBudget)
    .delete(protect, deleteBudget);

router.get('/stats', protect, getBudgetStats);

module.exports = router;