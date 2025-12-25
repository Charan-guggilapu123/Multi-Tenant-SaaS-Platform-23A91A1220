const sequelize = require('../config/database');
const Tenant = require('./Tenant');
const User = require('./User');
const Project = require('./Project');
const Task = require('./Task');
const AuditLog = require('./AuditLog');

// Export models and sequelize instance
module.exports = {
    sequelize,
    Tenant,
    User,
    Project,
    Task,
    AuditLog
};
