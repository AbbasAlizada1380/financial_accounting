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
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2), // مناسب برای مقادیر مالی
        allowNull: false,
        validate: {
            isDecimal: true
        }
    },
    type: {
        type: DataTypes.ENUM('income', 'expense'),
        allowNull: false,
    },
    category: {
        type: DataTypes.STRING,
        defaultValue: 'General',
    },
    date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
});

// تعریف رابطه: هر تراکنش متعلق به یک کاربر است
// این کار یک ستون userId به جدول Transaction اضافه می‌کند
User.hasMany(Transaction, { foreignKey: 'userId', onDelete: 'CASCADE' });
Transaction.belongsTo(User, { foreignKey: 'userId' });

module.exports = Transaction;