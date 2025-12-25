const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Tenant = require('./Tenant');
const Project = require('./Project');
const User = require('./User');

const Task = sequelize.define('Task', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT
    },
    status: {
        type: DataTypes.ENUM('todo', 'in_progress', 'completed'),
        defaultValue: 'todo'
    },
    priority: {
        type: DataTypes.ENUM('low', 'medium', 'high'),
        defaultValue: 'medium'
    },
    dueDate: {
        type: DataTypes.DATEONLY
    }
}, {
    timestamps: true,
    tableName: 'tasks'
});

// Associations
Task.belongsTo(Tenant, { foreignKey: 'tenantId', onDelete: 'CASCADE' });
Task.belongsTo(Project, { foreignKey: 'projectId', onDelete: 'CASCADE' });
Task.belongsTo(User, { foreignKey: 'assignedTo', as: 'assignee' });

Tenant.hasMany(Task, { foreignKey: 'tenantId' });
Project.hasMany(Task, { foreignKey: 'projectId' });

module.exports = Task;
