const { DataTypes } = require('sequelize');
const db = require('../config/db');
const User = require('./User');

const Transaction = db.define('Transaction', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    description: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [1, 255]
        }
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            isDecimal: true,
            min: 0.01
        }
    },
    type: {
        type: DataTypes.ENUM('income', 'expense'),
        allowNull: false,
    },
    category: {
        type: DataTypes.STRING,
        defaultValue: 'General',
        validate: {
            len: [0, 100]
        }
    },
    date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        validate: {
            isDate: true
        }
    },
    recurring: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    recurringInterval: {
        type: DataTypes.ENUM('daily', 'weekly', 'monthly', 'yearly'),
        allowNull: true
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    indexes: [
        {
            fields: ['userId', 'date']
        },
        {
            fields: ['userId', 'type']
        },
        {
            fields: ['userId', 'category']
        }
    ]
});

User.hasMany(Transaction, { foreignKey: 'userId', onDelete: 'CASCADE' });
Transaction.belongsTo(User, { foreignKey: 'userId' });

module.exports = Transaction;