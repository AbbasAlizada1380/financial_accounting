const User = require('../models/User');

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password'] }
        });
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        const { firstName, lastName, currency, dateFormat, language, timezone } = req.body;

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.firstName = firstName || user.firstName;
        user.lastName = lastName || user.lastName;
        user.currency = currency || user.currency;
        user.dateFormat = dateFormat || user.dateFormat;
        user.language = language || user.language;
        user.timezone = timezone || user.timezone;

        if (req.file) {
            user.photoUrl = `/uploads/${req.file.filename}`;
        }

        await user.save();
        
        const { password, ...userWithoutPassword } = user.get();
        res.status(200).json(userWithoutPassword);
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findByPk(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!(await user.isValidPassword(currentPassword))) {
            return res.status(401).json({ message: 'Incorrect current password.' });
        }
        
        user.password = newPassword;
        await user.save();

        res.status(200).json({ message: 'Password changed successfully.' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.updateSettings = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        const { notificationSettings, securitySettings } = req.body;

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (notificationSettings) {
            user.notificationSettings = { ...user.notificationSettings, ...notificationSettings };
        }

        if (securitySettings) {
            user.securitySettings = { ...user.securitySettings, ...securitySettings };
        }

        await user.save();
        
        const { password, ...userWithoutPassword } = user.get();
        res.status(200).json(userWithoutPassword);
    } catch (error) {
        console.error('Update settings error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};