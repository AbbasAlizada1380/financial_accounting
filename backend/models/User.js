const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const db = require('../config/db');

const User = db.define('User', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    firstName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
        },
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    accountStatus: {
        type: DataTypes.ENUM('active', 'pending_activation', 'deactivated'),
        defaultValue: 'active',
    },
    trialEndsAt: {
        type: DataTypes.DATE,
    },
    role: {
        type: DataTypes.ENUM('user', 'admin'),
        defaultValue: 'user',
    }
}, {
    // Model Hooks: برای اجرای کد قبل از رویدادهای خاص
    hooks: {
        beforeCreate: async (user) => {
            if (user.password) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(user.password, salt);
            }
        },
    }
});

// اضافه کردن یک متد به نمونه‌های User برای مقایسه پسورد
User.prototype.isValidPassword = async function(password) {
    return await bcrypt.compare(password, this.password);
}

module.exports = User;