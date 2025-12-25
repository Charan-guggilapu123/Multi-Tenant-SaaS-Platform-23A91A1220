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

        // 7. Create a second tenant to demonstrate multi-tenancy
        const acmeTenant = await Tenant.create({
            name: 'Acme Corporation',
            subdomain: 'acme',
            status: 'active',
            subscriptionPlan: 'enterprise',
            maxUsers: 50,
            maxProjects: 30
        });

        // 8. Create Acme Tenant Admin
        const acmeAdminHash = await bcrypt.hash('Acme@123', 10);
        const acmeAdmin = await User.create({
            tenantId: acmeTenant.id,
            email: 'admin@acme.com',
            passwordHash: acmeAdminHash,
            fullName: 'Acme Admin',
            role: 'tenant_admin'
        });

        // 9. Create Acme Regular User
        const acmeUserHash = await bcrypt.hash('AcmeUser@123', 10);
        const acmeUser = await User.create({
            tenantId: acmeTenant.id,
            email: 'user@acme.com',
            passwordHash: acmeUserHash,
            fullName: 'Acme User',
            role: 'user'
        });

        // 10. Create Acme Project
        const acmeProject = await Project.create({
            tenantId: acmeTenant.id,
            name: 'Enterprise Portal',
            description: 'Internal enterprise portal development',
            status: 'active',
            createdBy: acmeAdmin.id
        });

        // 11. Create Acme Task
        await Task.create({
            tenantId: acmeTenant.id,
            projectId: acmeProject.id,
            title: 'Security Audit',
            description: 'Conduct comprehensive security audit',
            status: 'todo',
            priority: 'critical',
            assignedTo: acmeUser.id
        });

        console.log('✅ Seeding complete!');
        console.log('📊 Database seeded with:');
        console.log('  - 1 Super Admin');
        console.log('  - 2 Tenants (Demo Company, Acme Corporation)');
        console.log('  - 2 Tenant Admins');
        console.log('  - 3 Regular Users');
        console.log('  - 3 Projects');
        console.log('  - 4 Tasks');
    } catch (error) {
        console.error('❌ Seeding error:', error);
        throw error;
    }
};

module.exports = seedDatabase;
