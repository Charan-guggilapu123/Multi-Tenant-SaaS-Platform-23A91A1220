const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Tenant = require('./Tenant');
const User = require('./User');

const Project = sequelize.define('Project', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT
    },
    status: {
        type: DataTypes.ENUM('active', 'archived', 'completed'),
        defaultValue: 'active'
    }
}, {
    timestamps: true,
    tableName: 'projects'
});

// Associations
Project.belongsTo(Tenant, { foreignKey: 'tenantId', onDelete: 'CASCADE' });
Project.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
Tenant.hasMany(Project, { foreignKey: 'tenantId' });

module.exports = Project;
