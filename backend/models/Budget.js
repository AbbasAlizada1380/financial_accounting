const { DataTypes } = require('sequelize');
const db = require('../config/db');
const User = require('./User');

const Budget = db.define('Budget', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    category: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [1, 100]
        }
    },
    budgetAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            isDecimal: true,
            min: 0.01
        }
    },
    color: {
        type: DataTypes.STRING,
        defaultValue: '#3B82F6',
        validate: {
            is: /^#[0-9A-F]{6}$/i
        }
    },
    active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    indexes: [
        {
            fields: ['userId', 'category'],
            unique: true
        }
    ]
});

User.hasMany(Budget, { foreignKey: 'userId', onDelete: 'CASCADE' });
Budget.belongsTo(User, { foreignKey: 'userId' });

module.exports = Budget;