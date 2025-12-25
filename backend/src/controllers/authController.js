const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { sequelize, Tenant, User, AuditLog } = require('../models');

const generateToken = (user) => {
    return jwt.sign(
        {
            userId: user.id,
            tenantId: user.tenantId,
            role: user.role
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );
};

// API 1: Register Tenant
exports.registerTenant = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { tenantName, subdomain, adminEmail, adminPassword, adminFullName } = req.body;

        // Check if subdomain exists
        const existingTenant = await Tenant.findOne({ where: { subdomain } });
        if (existingTenant) {
            await t.rollback();
            return res.status(409).json({ success: false, message: 'Subdomain already exists' });
        }

        // Check if email already used (global check optional, but good for admin)
        // Constraint says email unique per tenant, so we only need to check if we care about global uniqueness.
        // However, this is a fresh tenant, so the email is new for this tenant.

        // Create Tenant
        const tenant = await Tenant.create({
            name: tenantName,
            subdomain,
            subscriptionPlan: 'free',
            maxUsers: 5,
            maxProjects: 3
        }, { transaction: t });

        // Hash Password
        const passwordHash = await bcrypt.hash(adminPassword, 10);

        // Create Admin User
        const adminUser = await User.create({
            tenantId: tenant.id,
            email: adminEmail,
            passwordHash,
            fullName: adminFullName,
            role: 'tenant_admin'
        }, { transaction: t });

        // Log action (Audit Log usually needs a user, here it's self-registration)
        await AuditLog.create({
            tenantId: tenant.id,
            userId: adminUser.id,
            action: 'REGISTER_TENANT',
            entityType: 'tenant',
            entityId: tenant.id,
            ipAddress: req.ip
        }, { transaction: t });

        await t.commit();

        res.status(201).json({
            success: true,
            message: 'Tenant registered successfully',
            data: {
                tenantId: tenant.id,
                subdomain: tenant.subdomain,
                adminUser: {
                    id: adminUser.id,
                    email: adminUser.email,
                    fullName: adminUser.fullName,
                    role: adminUser.role
                }
            }
        });
    } catch (error) {
        await t.rollback();
        console.error('Registration Error:', error);
        res.status(400).json({ success: false, message: error.message });
    }
};

// API 2: User Login
exports.login = async (req, res) => {
    try {
        const { email, password, tenantSubdomain, tenantId } = req.body;

        let targetTenantId = tenantId;

        // Resolver Tenant
        if (tenantSubdomain) {
            const tenant = await Tenant.findOne({ where: { subdomain: tenantSubdomain } });
            if (!tenant) {
                return res.status(404).json({ success: false, message: 'Tenant not found' });
            }
            if (tenant.status !== 'active') {
                return res.status(403).json({ success: false, message: 'Tenant is suspended or inactive' });
            }
            targetTenantId = tenant.id;
        }

        if (!targetTenantId) {
            return res.status(400).json({ success: false, message: 'Tenant identifier required' });
        }

        // Find User
        const user = await User.findOne({
            where: {
                email,
                tenantId: targetTenantId
            }
        });

        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Verify Password
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        if (!user.isActive) {
            return res.status(403).json({ success: false, message: 'Account is inactive' });
        }

        // Generate Token
        const token = generateToken(user);

        // Audit Log
        await AuditLog.create({
            tenantId: targetTenantId,
            userId: user.id,
            action: 'LOGIN',
            entityType: 'user',
            entityId: user.id,
            ipAddress: req.ip
        });

        res.status(200).json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    fullName: user.fullName,
                    role: user.role,
                    tenantId: user.tenantId
                },
                token,
                expiresIn: 86400 // 24 hours in seconds
            }
        });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ success: false, message: 'Server error during login' });
    }
};

// API 3: Get Current User (Me)
exports.getMe = async (req, res) => {
    try {
        const user = req.user;
        const tenant = await Tenant.findByPk(user.tenantId);

        res.status(200).json({
            success: true,
            data: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                role: user.role,
                isActive: user.isActive,
                tenant: {
                    id: tenant.id,
                    name: tenant.name,
                    subdomain: tenant.subdomain,
                    subscriptionPlan: tenant.subscriptionPlan,
                    maxUsers: tenant.maxUsers,
                    maxProjects: tenant.maxProjects
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// API 4: Logout
exports.logout = async (req, res) => {
    try {
        await AuditLog.create({
            tenantId: req.user.tenantId,
            userId: req.user.id,
            action: 'LOGOUT',
            entityType: 'user',
            entityId: req.user.id,
            ipAddress: req.ip
        });

        res.status(200).json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
