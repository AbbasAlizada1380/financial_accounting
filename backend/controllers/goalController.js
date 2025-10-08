const Goal = require('../models/Goal');
const { Op } = require('sequelize');

// @desc    Get all goals for user
// @route   GET /api/goals
exports.getGoals = async (req, res) => {
    try {
        const goals = await Goal.findAll({
            where: { userId: req.user.id },
            order: [['deadline', 'ASC']]
        });

        res.status(200).json(goals);
    } catch (error) {
        console.error('Get goals error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Create a new goal
// @route   POST /api/goals
exports.createGoal = async (req, res) => {
    try {
        const { name, targetAmount, deadline, category, color, notes } = req.body;

        if (!name || !targetAmount || !deadline) {
            return res.status(400).json({ message: 'Name, target amount, and deadline are required.' });
        }

        const goal = await Goal.create({
            name,
            targetAmount,
            deadline,
            category: category || 'Savings',
            color: color || `#${Math.floor(Math.random()*16777215).toString(16)}`,
            notes,
            userId: req.user.id
        });

        res.status(201).json(goal);
    } catch (error) {
        console.error('Create goal error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Update a goal
// @route   PUT /api/goals/:id
exports.updateGoal = async (req, res) => {
    try {
        const goal = await Goal.findByPk(req.params.id);

        if (!goal) {
            return res.status(404).json({ message: 'Goal not found.' });
        }

        if (goal.userId !== req.user.id) {
            return res.status(403).json({ message: 'Forbidden: You can only update your own goals.' });
        }

        const { name, targetAmount, deadline, category, color, notes } = req.body;
        
        await goal.update({
            name: name || goal.name,
            targetAmount: targetAmount || goal.targetAmount,
            deadline: deadline || goal.deadline,
            category: category || goal.category,
            color: color || goal.color,
            notes: notes !== undefined ? notes : goal.notes
        });

        res.status(200).json(goal);
    } catch (error) {
        console.error('Update goal error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Add to goal savings
// @route   PUT /api/goals/:id/add
exports.addToGoal = async (req, res) => {
    try {
        const goal = await Goal.findByPk(req.params.id);

        if (!goal) {
            return res.status(404).json({ message: 'Goal not found.' });
        }

        if (goal.userId !== req.user.id) {
            return res.status(403).json({ message: 'Forbidden: You can only update your own goals.' });
        }

        const { amount } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ message: 'Valid amount is required.' });
        }

        const newSavedAmount = parseFloat(goal.savedAmount) + parseFloat(amount);
        const completed = newSavedAmount >= goal.targetAmount;

        await goal.update({
            savedAmount: newSavedAmount,
            completed: completed || goal.completed
        });

        res.status(200).json(goal);
    } catch (error) {
        console.error('Add to goal error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Delete a goal
// @route   DELETE /api/goals/:id
exports.deleteGoal = async (req, res) => {
    try {
        const goal = await Goal.findByPk(req.params.id);

        if (!goal) {
            return res.status(404).json({ message: 'Goal not found.' });
        }

        if (goal.userId !== req.user.id) {
            return res.status(403).json({ message: 'Forbidden: You can only delete your own goals.' });
        }

        await goal.destroy();
        res.status(200).json({ message: 'Goal deleted successfully.' });

    } catch (error) {
        console.error('Delete goal error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get goal statistics
// @route   GET /api/goals/stats
exports.getGoalStats = async (req, res) => {
    try {
        const goals = await Goal.findAll({
            where: { userId: req.user.id }
        });

        const totalTarget = goals.reduce((acc, goal) => acc + parseFloat(goal.targetAmount), 0);
        const totalSaved = goals.reduce((acc, goal) => acc + parseFloat(goal.savedAmount), 0);
        const completedGoals = goals.filter(goal => goal.completed).length;
        const activeGoals = goals.filter(goal => !goal.completed).length;

        res.status(200).json({
            totalTarget,
            totalSaved,
            completionRate: totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0,
            completedGoals,
            activeGoals,
            totalGoals: goals.length
        });
    } catch (error) {
        console.error('Get goal stats error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};