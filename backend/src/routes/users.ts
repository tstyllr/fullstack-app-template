import express from 'express';
import { auth } from '../middleware/auth.js';
import { admin } from '../middleware/admin.js';
import { userController } from '../controllers/user.controller.js';

const router = express.Router();

router.get('/me', auth, userController.getCurrentUser);
router.get('/', [auth, admin], userController.getAllUsers);

export default router;
