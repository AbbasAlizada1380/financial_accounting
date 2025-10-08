const User = require('../models/User');

// @desc    Get all users
// @route   GET /api/users
exports.getUsers = async (req, res) => {
    try {
        // پسورد را از نتیجه حذف می‌کنیم
        const users = await User.findAll({
            attributes: { exclude: ['password'] }
        });
        res.status(200).json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update user account status
// @route   PUT /api/users/:id/status
exports.updateUserStatus = async (req, res) => {
    const { accountStatus } = req.body;
    const { id } = req.params;

    try {
        const user = await User.findByPk(id);

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // ولیدیشن برای اطمینان از اینکه وضعیت معتبر است
        const validStatuses = ['active', 'pending_activation', 'deactivated'];
        if (!validStatuses.includes(accountStatus)) {
            return res.status(400).json({ message: 'Invalid account status.' });
        }

        user.accountStatus = accountStatus;
        
        // اگر کاربر فعال می‌شود، دوره آزمایشی را null می‌کنیم
        if (accountStatus === 'active') {
            user.trialEndsAt = null;
        }
        
        await user.save();
        
        // کاربر به‌روز شده را بدون پسورد برمی‌گردانیم
        const { password, ...userWithoutPassword } = user.get();
        res.status(200).json(userWithoutPassword);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};