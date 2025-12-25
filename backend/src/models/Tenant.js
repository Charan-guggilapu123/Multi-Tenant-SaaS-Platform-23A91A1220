const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Tenant = sequelize.define('Tenant', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    subdomain: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    status: {
        type: DataTypes.ENUM('active', 'suspended', 'trial'),
        defaultValue: 'active'
    },
    subscriptionPlan: {
        type: DataTypes.ENUM('free', 'pro', 'enterprise'),
        defaultValue: 'free'
    },
    maxUsers: {
        type: DataTypes.INTEGER,
        defaultValue: 5 // Default for free plan
    },
    maxProjects: {
        type: DataTypes.INTEGER,
        defaultValue: 3 // Default for free plan
    }
}, {
    timestamps: true,
    tableName: 'tenants'
});

module.exports = Tenant;
