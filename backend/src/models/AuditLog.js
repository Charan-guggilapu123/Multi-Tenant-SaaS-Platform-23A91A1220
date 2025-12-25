const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Tenant = require('./Tenant');
const User = require('./User');

const AuditLog = sequelize.define('AuditLog', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    action: {
        type: DataTypes.STRING,
        allowNull: false
    },
    entityType: {
        type: DataTypes.STRING
    },
    entityId: {
        type: DataTypes.STRING
    },
    ipAddress: {
        type: DataTypes.STRING
    }
}, {
    timestamps: true,
    updatedAt: false, // Only createdAt is needed
    tableName: 'audit_logs'
});

// Associations
AuditLog.belongsTo(Tenant, { foreignKey: 'tenantId', onDelete: 'CASCADE' });
AuditLog.belongsTo(User, { foreignKey: 'userId' });

module.exports = AuditLog;
