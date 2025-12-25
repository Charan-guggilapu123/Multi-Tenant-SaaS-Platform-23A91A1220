const express = require('express');
const router = express.Router();
const tenantController = require('../controllers/tenantController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// List All Tenants (Super Admin Only)
router.get('/', authMiddleware, roleMiddleware(['super_admin']), tenantController.getAllTenants);

// Get Tenant Details (Admin or Member)
router.get('/:tenantId', authMiddleware, tenantController.getTenant);

// Update Tenant (Admin or Super Admin)
router.put('/:tenantId', authMiddleware, roleMiddleware(['tenant_admin', 'super_admin']), tenantController.updateTenant);

// Update Subscription Plan (Tenant Admin or Super Admin)
router.put('/:tenantId/subscription', authMiddleware, roleMiddleware(['tenant_admin', 'super_admin']), tenantController.updateSubscription);

module.exports = router;
