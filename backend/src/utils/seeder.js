const bcrypt = require('bcryptjs');
const { Tenant, User, Project, Task } = require('../models');

const seedDatabase = async () => {
    try {
        // Check if data exists
        const adminCount = await User.count({ where: { role: 'super_admin' } });
        if (adminCount > 0) {
            console.log('Database already seeded.');
            return;
        }

        console.log('Seeding database...');

        // 1. Create Super Admin
        const adminHash = await bcrypt.hash('Admin@123', 10);
        await User.create({
            email: 'superadmin@system.com',
            passwordHash: adminHash,
            fullName: 'System Super Admin',
            role: 'super_admin',
            isActive: true,
            tenantId: null // Explicitly null for super admin
        });

        // 2. Create Demo Tenant
        const demoTenant = await Tenant.create({
            name: 'Demo Company',
            subdomain: 'demo',
            status: 'active',
            subscriptionPlan: 'pro',
            maxUsers: 25,
            maxProjects: 15
        });

        // 3. Create Tenant Admin
        const tenantAdminHash = await bcrypt.hash('Demo@123', 10);
        const tenantAdmin = await User.create({
            tenantId: demoTenant.id,
            email: 'admin@demo.com',
            passwordHash: tenantAdminHash,
            fullName: 'Demo Admin',
            role: 'tenant_admin'
        });

        // 4. Create Regular Users
        const userHash = await bcrypt.hash('User@123', 10);
        const user1 = await User.create({
            tenantId: demoTenant.id,
            email: 'user1@demo.com',
            passwordHash: userHash,
            fullName: 'Demo User 1',
            role: 'user'
        });

        const user2 = await User.create({
            tenantId: demoTenant.id,
            email: 'user2@demo.com',
            passwordHash: userHash,
            fullName: 'Demo User 2',
            role: 'user'
        });

        // 5. Create Projects
        const projectAlpha = await Project.create({
            tenantId: demoTenant.id,
            name: 'Project Alpha',
            description: 'First demo project',
            status: 'active',
            createdBy: tenantAdmin.id
        });

        const projectBeta = await Project.create({
            tenantId: demoTenant.id,
            name: 'Project Beta',
            description: 'Second demo project',
            status: 'active',
            createdBy: tenantAdmin.id
        });

        // 6. Create Tasks
        await Task.create({
            tenantId: demoTenant.id,
            projectId: projectAlpha.id,
            title: 'Initial Setup',
            description: 'Setup the project environment',
            status: 'completed',
            priority: 'high',
            assignedTo: user1.id
        });

        await Task.create({
            tenantId: demoTenant.id,
            projectId: projectAlpha.id,
            title: 'Design UI',
            description: 'Create initial mockups',
            status: 'in_progress',
            priority: 'medium',
            assignedTo: user2.id
        });

        await Task.create({
            tenantId: demoTenant.id,
            projectId: projectBeta.id,
            title: 'Database Schema',
            description: 'Design the DB schema',
            status: 'todo',
            priority: 'high',
            assignedTo: tenantAdmin.id
        });

        console.log('Seeding complete!');
    } catch (error) {
        console.error('Seeding error:', error);
    }
};

module.exports = seedDatabase;
