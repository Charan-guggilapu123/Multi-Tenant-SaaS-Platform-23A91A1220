const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Add User to Tenant
router.post('/tenants/:tenantId/users', authMiddleware, roleMiddleware(['tenant_admin']), userController.addUser);

// List Tenant Users
router.get('/tenants/:tenantId/users', authMiddleware, userController.listUsers);

// Update User
router.put('/users/:userId', authMiddleware, userController.updateUser);

// Delete User
router.delete('/users/:userId', authMiddleware, roleMiddleware(['tenant_admin']), userController.deleteUser);

module.exports = router;
