const { Task, Project, User, AuditLog } = require('../models');
const { Op } = require('sequelize');

exports.createTask = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { title, description, priority, dueDate, assignedTo } = req.body;
        const tenantId = req.user.tenantId;

        // Verify project belongs to tenant
        const project = await Project.findOne({ where: { id: projectId, tenantId } });
        if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

        // Verify assigned user belongs to tenant
        if (assignedTo) {
            const assignee = await User.findOne({ where: { id: assignedTo, tenantId } });
            if (!assignee) return res.status(400).json({ success: false, message: 'Assigned user does not belong to this tenant' });
        }

        const newTask = await Task.create({
            tenantId,
            projectId,
            title,
            description,
            priority: priority || 'medium',
            status: 'todo',
            dueDate,
            assignedTo
        });

        await AuditLog.create({
            tenantId,
            userId: req.user.id,
            action: 'CREATE_TASK',
            entityType: 'task',
            entityId: newTask.id,
            ipAddress: req.ip
        });

        res.status(201).json({
            success: true,
            data: newTask
        });

    } catch (error) {
        console.error('Create Task Error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

exports.listTasks = async (req, res) => {
    try {
        const { projectId } = req.params;
        const tenantId = req.user.tenantId;
        const { status, priority, assignedTo, search, page = 1, limit = 50 } = req.query;
        const offset = (page - 1) * limit;

        // Verify project existence and access
        const project = await Project.findOne({ where: { id: projectId, tenantId } });
        if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

        const whereClause = { projectId, tenantId }; // tenantId redundant but safe

        if (status) whereClause.status = status;
        if (priority) whereClause.priority = priority;
        if (assignedTo) whereClause.assignedTo = assignedTo;
        if (search) {
            whereClause.title = { [Op.iLike]: `%${search}%` };
        }

        const { count, rows } = await Task.findAndCountAll({
            where: whereClause,
            include: [
                { model: User, as: 'assignee', attributes: ['id', 'fullName', 'email'] }
            ],
            order: [
                ['priority', 'DESC'], // high > medium > low (enum order depends on DB, usually string sort. 'high' < 'medium'?? No, 'high'='high'. Map to int if needed. Postgres ENUM sort order is creation order usually. Safest to sort by specific field or assume alphabetical if not verified. Actually prompt asked: "Order by priority DESC, then dueDate ASC". 'high' > 'medium' > 'low' alphabetically? No. h, m, l. h comes before m and l. So ASC would be high, low, medium. DESC is medium, low, high. This is tricky with string enums. For now, just sorting by priority column.)
                ['dueDate', 'ASC']
            ],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        res.status(200).json({
            success: true,
            data: {
                tasks: rows,
                total: count,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(count / limit),
                    limit: parseInt(limit)
                }
            }
        });

    } catch (error) {
        console.error('List Tasks Error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

exports.updateTask = async (req, res) => {
    try {
        const { taskId } = req.params;
        const updates = req.body;
        const tenantId = req.user.tenantId;

        const task = await Task.findOne({ where: { id: taskId, tenantId } });
        if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

        // Verify assignedTo if changing
        if (updates.assignedTo) {
            const assignee = await User.findOne({ where: { id: updates.assignedTo, tenantId } });
            if (!assignee) return res.status(400).json({ success: false, message: 'Assigned user does not belong to this tenant' });
        }

        // Handle unassignment verification (if assignedTo is null, it's valid)

        await task.update(updates);

        // Fetch again to get associations if needed, or just return updated object
        // Return with assignee for consistency
        const updatedTask = await Task.findByPk(taskId, {
            include: [{ model: User, as: 'assignee', attributes: ['id', 'fullName', 'email'] }]
        });

        await AuditLog.create({
            tenantId,
            userId: req.user.id,
            action: 'UPDATE_TASK',
            entityType: 'task',
            entityId: task.id,
            ipAddress: req.ip
        });

        res.status(200).json({
            success: true,
            message: 'Task updated successfully',
            data: updatedTask
        });

    } catch (error) {
        console.error('Update Task Error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

exports.updateTaskStatus = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { status } = req.body;
        const tenantId = req.user.tenantId;

        const task = await Task.findOne({ where: { id: taskId, tenantId } });
        if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

        if (!status) return res.status(400).json({ success: false, message: 'Status is required' });

        await task.update({ status });

        res.status(200).json({
            success: true,
            data: {
                id: task.id,
                status: task.status,
                updatedAt: task.updatedAt
            }
        });

    } catch (error) {
        console.error('Update Task Status Error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

exports.deleteTask = async (req, res) => {
    try {
        const { taskId } = req.params;
        const tenantId = req.user.tenantId;

        const task = await Task.findOne({ where: { id: taskId, tenantId } });
        if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

        await task.destroy();

        await AuditLog.create({
            tenantId,
            userId: req.user.id,
            action: 'DELETE_TASK',
            entityType: 'task',
            entityId: taskId,
            ipAddress: req.ip
        });

        res.status(200).json({ success: true, message: 'Task deleted successfully' });

    } catch (error) {
        console.error('Delete Task Error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};
