import express from 'express';
import { auth } from '../middleware/auth.js';
import { admin } from '../middleware/admin.js';
import { moderator } from '../middleware/moderator.js';
import { userController } from '../controllers/user.controller.js';

const router = express.Router();

// Public user routes (authenticated users only)
router.get('/me', auth, userController.getCurrentUser);

// Admin routes - User management
router.get('/', [auth, admin], userController.getAllUsers);
router.put('/:id/role', [auth, admin], userController.changeUserRole);
router.delete('/:id', [auth, admin], userController.deleteUser);

// Moderator routes - User suspension
router.post('/:id/suspend', [auth, moderator], userController.suspendUser);
router.post('/:id/unsuspend', [auth, moderator], userController.unsuspendUser);

// Admin routes - Audit logs
router.get('/audit-logs', [auth, admin], userController.getAuditLogs);

export default router;
