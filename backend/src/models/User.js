const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Tenant = require('./Tenant');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false
    },
    passwordHash: {
        type: DataTypes.STRING,
        allowNull: false
    },
    fullName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role: {
        type: DataTypes.ENUM('super_admin', 'tenant_admin', 'user'),
        defaultValue: 'user'
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    timestamps: true,
    tableName: 'users',
    indexes: [
        {
            unique: true,
            fields: ['tenantId', 'email']
        }
    ]
});

// Associations
User.belongsTo(Tenant, { foreignKey: 'tenantId', onDelete: 'CASCADE' });
Tenant.hasMany(User, { foreignKey: 'tenantId' });

module.exports = User;
