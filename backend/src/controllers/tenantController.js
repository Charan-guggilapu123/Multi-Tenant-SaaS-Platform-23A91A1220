const { Tenant, User, Project, Task, AuditLog } = require('../models');

exports.getTenant = async (req, res) => {
    try {
        const { tenantId } = req.params;

        // Authorization: User must belong to this tenant OR be super_admin
        if (req.user.role !== 'super_admin' && req.user.tenantId !== tenantId) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        const tenant = await Tenant.findByPk(tenantId);
        if (!tenant) {
            return res.status(404).json({ success: false, message: 'Tenant not found' });
        }

        // Stats
        const totalUsers = await User.count({ where: { tenantId } });
        const totalProjects = await Project.count({ where: { tenantId } });
        const totalTasks = await Task.count({ where: { tenantId } });

        res.status(200).json({
            success: true,
            data: {
                ...tenant.toJSON(),
                stats: {
                    totalUsers,
                    totalProjects,
                    totalTasks
                }
            }
        });
    } catch (error) {
        console.error('Get Tenant Error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

exports.updateTenant = async (req, res) => {
    try {
        const { tenantId } = req.params;
        const updates = req.body;

        // Authorization: tenant_admin OR super_admin
        // Note: Middleware checks role, but we need to ensure tenant_admin owns this tenant
        if (req.user.role !== 'super_admin' && req.user.tenantId !== tenantId) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        const tenant = await Tenant.findByPk(tenantId);
        if (!tenant) {
            return res.status(404).json({ success: false, message: 'Tenant not found' });
        }

        // Super admins can update everything
        // Tenant admins can ONLY update name
        if (req.user.role !== 'super_admin') {
            const allowedUpdates = ['name'];
            const attemptedUpdates = Object.keys(updates);
            const isAuthorized = attemptedUpdates.every(field => allowedUpdates.includes(field));

            if (!isAuthorized) {
                return res.status(403).json({ success: false, message: 'Tenant admin can only update name' });
            }
        }

        await tenant.update(updates);

        // Audit Log
        await AuditLog.create({
            tenantId: tenant.id,
            userId: req.user.id,
            action: 'UPDATE_TENANT',
            entityType: 'tenant',
            entityId: tenant.id,
            ipAddress: req.ip
        });

        res.status(200).json({
            success: true,
            message: 'Tenant updated successfully',
            data: tenant
        });
    } catch (error) {
        console.error('Update Tenant Error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

exports.getAllTenants = async (req, res) => {
    try {
        // Authorization: super_admin ONLY (handled by route middleware)

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const { status, subscriptionPlan } = req.query;
        const whereClause = {};
        if (status) whereClause.status = status;
        if (subscriptionPlan) whereClause.subscriptionPlan = subscriptionPlan;

        const { count, rows } = await Tenant.findAndCountAll({
            where: whereClause,
            limit,
            offset,
            order: [['createdAt', 'DESC']]
        });

        // Calculate stats for each tenant
        // This can be expensive, so be careful. For now, doing it in loop as requested.
        const tenantsWithStats = await Promise.all(rows.map(async (tenant) => {
            const totalUsers = await User.count({ where: { tenantId: tenant.id } });
            const totalProjects = await Project.count({ where: { tenantId: tenant.id } });
            return {
                ...tenant.toJSON(),
                totalUsers,
                totalProjects
            };
        }));

        res.status(200).json({
            success: true,
            data: {
                tenants: tenantsWithStats,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(count / limit),
                    totalTenants: count,
                    limit
                }
            }
        });

    } catch (error) {
        console.error('List Tenants Error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};
