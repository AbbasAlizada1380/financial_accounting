const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');
const { Op } = require('sequelize');

// Helper functions for date calculations
function startOfMonth(date) {
    return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);
}

// @desc    Get all budgets for user
// @route   GET /api/budgets
exports.getBudgets = async (req, res) => {
    try {
        const budgets = await Budget.findAll({
            where: { userId: req.user.id, active: true },
            order: [['category', 'ASC']]
        });

        // Calculate spent amounts for each budget
        const budgetsWithSpent = await Promise.all(
            budgets.map(async (budget) => {
                const spent = await Transaction.sum('amount', {
                    where: {
                        userId: req.user.id,
                        type: 'expense',
                        category: budget.category,
                        date: {
                            [Op.between]: [startOfMonth(new Date()), endOfMonth(new Date())]
                        }
                    }
                });

                return {
                    ...budget.toJSON(),
                    spent: spent || 0,
                    remaining: budget.budgetAmount - (spent || 0),
                    percentage: ((spent || 0) / budget.budgetAmount) * 100
                };
            })
        );

        res.status(200).json(budgetsWithSpent);
    } catch (error) {
        console.error('Get budgets error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Create a new budget
// @route   POST /api/budgets
exports.createBudget = async (req, res) => {
    try {
        const { category, budgetAmount, color } = req.body;

        if (!category || !budgetAmount) {
            return res.status(400).json({ message: 'Category and budget amount are required.' });
        }

        // Check if budget already exists for this category
        const existingBudget = await Budget.findOne({
            where: { userId: req.user.id, category }
        });

        if (existingBudget) {
            return res.status(400).json({ message: 'Budget for this category already exists.' });
        }

        const budget = await Budget.create({
            category,
            budgetAmount,
            color: color || `#${Math.floor(Math.random()*16777215).toString(16)}`,
            userId: req.user.id
        });

        res.status(201).json(budget);
    } catch (error) {
        console.error('Create budget error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Update a budget
// @route   PUT /api/budgets/:id
exports.updateBudget = async (req, res) => {
    try {
        const budget = await Budget.findByPk(req.params.id);

        if (!budget) {
            return res.status(404).json({ message: 'Budget not found.' });
        }

        if (budget.userId !== req.user.id) {
            return res.status(403).json({ message: 'Forbidden: You can only update your own budgets.' });
        }

        const { budgetAmount, color, active } = req.body;
        
        await budget.update({
            budgetAmount: budgetAmount || budget.budgetAmount,
            color: color || budget.color,
            active: active !== undefined ? active : budget.active
        });

        res.status(200).json(budget);
    } catch (error) {
        console.error('Update budget error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Delete a budget
// @route   DELETE /api/budgets/:id
exports.deleteBudget = async (req, res) => {
    try {
        const budget = await Budget.findByPk(req.params.id);

        if (!budget) {
            return res.status(404).json({ message: 'Budget not found.' });
        }

        if (budget.userId !== req.user.id) {
            return res.status(403).json({ message: 'Forbidden: You can only delete your own budgets.' });
        }

        await budget.destroy();
        res.status(200).json({ message: 'Budget deleted successfully.' });

    } catch (error) {
        console.error('Delete budget error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get budget statistics
// @route   GET /api/budgets/stats
exports.getBudgetStats = async (req, res) => {
    try {
        const budgets = await Budget.findAll({
            where: { userId: req.user.id, active: true }
        });

        const totalBudget = budgets.reduce((acc, budget) => acc + parseFloat(budget.budgetAmount), 0);

        // Calculate total spent this month
        const totalSpent = await Transaction.sum('amount', {
            where: {
                userId: req.user.id,
                type: 'expense',
                date: {
                    [Op.between]: [startOfMonth(new Date()), endOfMonth(new Date())]
                }
            }
        });

        res.status(200).json({
            totalBudget,
            totalSpent: totalSpent || 0,
            totalRemaining: totalBudget - (totalSpent || 0),
            budgetCount: budgets.length
        });
    } catch (error) {
        console.error('Get budget stats error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};