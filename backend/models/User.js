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
        validate: {
            notEmpty: true
        }
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
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
        validate: {
            len: [6, 100]
        }
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
    },
    photoUrl: {
        type: DataTypes.STRING,
        defaultValue: '/uploads/default-avatar.png'
    },
    currency: {
        type: DataTypes.STRING,
        defaultValue: 'USD'
    },
    dateFormat: {
        type: DataTypes.STRING,
        defaultValue: 'MM/DD/YYYY'
    },
    language: {
        type: DataTypes.STRING,
        defaultValue: 'en'
    },
    timezone: {
        type: DataTypes.STRING,
        defaultValue: 'UTC'
    },
    notificationSettings: {
        type: DataTypes.JSON,
        defaultValue: {
            emailNotifications: true,
            pushNotifications: false,
            monthlyReports: true,
            largeTransactions: true,
            budgetAlerts: true
        }
    },
    securitySettings: {
        type: DataTypes.JSON,
        defaultValue: {
            twoFactorAuth: false,
            sessionTimeout: 30,
            loginAlerts: true
        }
    }
}, {
    hooks: {
        beforeCreate: async (user) => {
            if (user.password) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(user.password, salt);
            }
        },
        beforeUpdate: async (user) => {
            if (user.changed('password')) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(user.password, salt);
            }
        }
    }
});

User.prototype.isValidPassword = async function(password) {
    return await bcrypt.compare(password, this.password);
}

module.exports = User;