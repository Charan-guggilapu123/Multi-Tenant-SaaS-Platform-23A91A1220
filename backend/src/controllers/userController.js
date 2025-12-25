const { User, Tenant, AuditLog } = require('../models');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');

exports.addUser = async (req, res) => {
    try {
        const { tenantId } = req.params;
        const { email, password, fullName, role } = req.body;

        // Authorization: tenant_admin only
        if (req.user.role !== 'tenant_admin' || req.user.tenantId !== tenantId) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        // Check subscription limits
        const tenant = await Tenant.findByPk(tenantId);
        if (!tenant) return res.status(404).json({ success: false, message: 'Tenant not found' });

        const currentUserCount = await User.count({ where: { tenantId } });
        if (currentUserCount >= tenant.maxUsers) {
            return res.status(403).json({ success: false, message: 'Subscription user limit reached' });
        }

        // Check if email exists in tenant
        const existingUser = await User.findOne({ where: { tenantId, email } });
        if (existingUser) {
            return res.status(409).json({ success: false, message: 'Email already exists in this tenant' });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            tenantId,
            email,
            passwordHash,
            fullName,
            role: role || 'user',
            isActive: true
        });

        await AuditLog.create({
            tenantId,
            userId: req.user.id,
            action: 'CREATE_USER',
            entityType: 'user',
            entityId: newUser.id,
            ipAddress: req.ip
        });

        // Don't return password hash
        const userResponse = newUser.toJSON();
        delete userResponse.passwordHash;

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: userResponse
        });

    } catch (error) {
        console.error('Add User Error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

exports.listUsers = async (req, res) => {
    try {
        const { tenantId } = req.params;

        // Authorization: Member of tenant
        if (req.user.tenantId !== tenantId && req.user.role !== 'super_admin') {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        const { search, role, page = 1, limit = 50 } = req.query;
        const offset = (page - 1) * limit;

        const whereClause = { tenantId };

        if (search) {
            whereClause[Op.or] = [
                { fullName: { [Op.iLike]: `%${search}%` } }, // Postgres case-insensitive like
                { email: { [Op.iLike]: `%${search}%` } }
            ];
        }
        if (role) whereClause.role = role;

        const { count, rows } = await User.findAndCountAll({
            where: whereClause,
            attributes: { exclude: ['passwordHash'] },
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        res.status(200).json({
            success: true,
            data: {
                users: rows,
                total: count,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(count / limit),
                    limit: parseInt(limit)
                }
            }
        });

    } catch (error) {
        console.error('List Users Error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const updates = req.body;

        const userToUpdate = await User.findByPk(userId);
        if (!userToUpdate) return res.status(404).json({ success: false, message: 'User not found' });

        // Authorization: tenant_admin OR self
        const isSelf = req.user.id === userId;
        const isAdmin = req.user.role === 'tenant_admin' && req.user.tenantId === userToUpdate.tenantId;

        if (!isSelf && !isAdmin) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        // Validation logic
        if (!isAdmin) {
            // Regular users can only update fullName
            if (updates.role || updates.isActive !== undefined) {
                return res.status(403).json({ success: false, message: 'Not authorized to update role or status' });
            }
        }

        await userToUpdate.update(updates);

        await AuditLog.create({
            tenantId: userToUpdate.tenantId,
            userId: req.user.id,
            action: 'UPDATE_USER',
            entityType: 'user',
            entityId: userToUpdate.id,
            ipAddress: req.ip
        });

        res.status(200).json({
            success: true,
            message: 'User updated successfully',
            data: {
                id: userToUpdate.id,
                fullName: userToUpdate.fullName,
                role: userToUpdate.role,
                updatedAt: userToUpdate.updatedAt
            }
        });

    } catch (error) {
        console.error('Update User Error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;

        const userToDelete = await User.findByPk(userId);
        if (!userToDelete) return res.status(404).json({ success: false, message: 'User not found' });

        // Authorization: tenant_admin only
        if (req.user.role !== 'tenant_admin' || req.user.tenantId !== userToDelete.tenantId) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        // Cannot delete self
        if (req.user.id === userId) {
            return res.status(403).json({ success: false, message: 'Cannot delete yourself' });
        }

        await userToDelete.destroy();

        await AuditLog.create({
            tenantId: userToDelete.tenantId,
            userId: req.user.id,
            action: 'DELETE_USER',
            entityType: 'user',
            entityId: userId,
            ipAddress: req.ip
        });

        res.status(200).json({ success: true, message: 'User deleted successfully' });

    } catch (error) {
        console.error('Delete User Error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};
