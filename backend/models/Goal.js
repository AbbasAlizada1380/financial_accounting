const { DataTypes } = require('sequelize');
const db = require('../config/db');
const User = require('./User');

const Goal = db.define('Goal', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [1, 255]
        }
    },
    targetAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            isDecimal: true,
            min: 0.01
        }
    },
    savedAmount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
        validate: {
            isDecimal: true,
            min: 0
        }
    },
    deadline: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
            isDate: true,
            isAfter: new Date().toISOString().split('T')[0]
        }
    },
    category: {
        type: DataTypes.STRING,
        defaultValue: 'Savings',
        validate: {
            len: [0, 100]
        }
    },
    color: {
        type: DataTypes.STRING,
        defaultValue: '#3B82F6',
        validate: {
            is: /^#[0-9A-F]{6}$/i
        }
    },
    completed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    }
});

User.hasMany(Goal, { foreignKey: 'userId', onDelete: 'CASCADE' });
Goal.belongsTo(User, { foreignKey: 'userId' });

module.exports = Goal;