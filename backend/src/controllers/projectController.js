const { Project, Tenant, User, Task, AuditLog } = require('../models');
const { Op } = require('sequelize');

exports.createProject = async (req, res) => {
    try {
        const { name, description, status } = req.body;
        const tenantId = req.user.tenantId;

        // Check subscription limits
        const tenant = await Tenant.findByPk(tenantId);
        const currentProjectCount = await Project.count({ where: { tenantId } });

        if (currentProjectCount >= tenant.maxProjects) {
            return res.status(403).json({ success: false, message: 'Subscription project limit reached' });
        }

        const newProject = await Project.create({
            tenantId,
            name,
            description,
            status: status || 'active',
            createdBy: req.user.id
        });

        await AuditLog.create({
            tenantId,
            userId: req.user.id,
            action: 'CREATE_PROJECT',
            entityType: 'project',
            entityId: newProject.id,
            ipAddress: req.ip
        });

        res.status(201).json({
            success: true,
            data: newProject
        });

    } catch (error) {
        console.error('Create Project Error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

exports.listProjects = async (req, res) => {
    try {
        const tenantId = req.user.tenantId;
        const { search, status, page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        const whereClause = { tenantId };
        if (search) {
            whereClause.name = { [Op.iLike]: `%${search}%` };
        }
        if (status) {
            whereClause.status = status;
        }

        const { count, rows } = await Project.findAndCountAll({
            where: whereClause,
            include: [
                { model: User, as: 'creator', attributes: ['id', 'fullName'] }
            ],
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        // Calculate stats
        const projectsWithStats = await Promise.all(rows.map(async (project) => {
            const taskCount = await Task.count({ where: { projectId: project.id } });
            const completedTaskCount = await Task.count({ where: { projectId: project.id, status: 'completed' } });

            return {
                ...project.toJSON(),
                taskCount,
                completedTaskCount
            };
        }));

        res.status(200).json({
            success: true,
            data: {
                projects: projectsWithStats,
                total: count,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(count / limit),
                    limit: parseInt(limit)
                }
            }
        });

    } catch (error) {
        console.error('List Projects Error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

exports.updateProject = async (req, res) => {
    try {
        const { projectId } = req.params;
        const updates = req.body;
        const tenantId = req.user.tenantId;

        const project = await Project.findOne({ where: { id: projectId, tenantId } });
        if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

        // Authorization: tenant_admin OR creator
        const isCreator = project.createdBy === req.user.id;
        const isAdmin = req.user.role === 'tenant_admin';

        if (!isCreator && !isAdmin) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        await project.update(updates);

        await AuditLog.create({
            tenantId,
            userId: req.user.id,
            action: 'UPDATE_PROJECT',
            entityType: 'project',
            entityId: project.id,
            ipAddress: req.ip
        });

        res.status(200).json({
            success: true,
            message: 'Project updated successfully',
            data: project
        });

    } catch (error) {
        console.error('Update Project Error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

exports.deleteProject = async (req, res) => {
    try {
        const { projectId } = req.params;
        const tenantId = req.user.tenantId;

        const project = await Project.findOne({ where: { id: projectId, tenantId } });
        if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

        // Authorization: tenant_admin OR creator
        const isCreator = project.createdBy === req.user.id;
        const isAdmin = req.user.role === 'tenant_admin';

        if (!isCreator && !isAdmin) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        await project.destroy();

        await AuditLog.create({
            tenantId,
            userId: req.user.id,
            action: 'DELETE_PROJECT',
            entityType: 'project',
            entityId: projectId,
            ipAddress: req.ip
        });

        res.status(200).json({ success: true, message: 'Project deleted successfully' });

    } catch (error) {
        console.error('Delete Project Error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};
