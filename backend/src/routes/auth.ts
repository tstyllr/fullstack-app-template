import express from 'express';
import { authController } from '../controllers/auth.controller.js';

const router = express.Router();

// SMS verification
router.post('/send-code', authController.sendCode);

// Authentication
router.post('/login-with-code', authController.loginWithCode);
router.post('/login-with-password', authController.loginWithPassword);

// Password management
router.post('/set-password', authController.setPassword);

// Token management
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);

export default router;
