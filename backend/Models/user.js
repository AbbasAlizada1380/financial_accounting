import { DataTypes } from 'sequelize';
import sequelize from '../dbconnection.js';

const User = sequelize.define('User', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isEmail: true
        },
        // unique: true,
    },
    role: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    mode: {
        type: DataTypes.STRING,
        allowNull: true,
    }
},{
        timestamps: true
    });

export default User;



