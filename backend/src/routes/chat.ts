import express from 'express';
import { auth } from '../middleware/auth.js';
import { chatController } from '@/controllers/chat.controller.js';

const router = express.Router();

router.post('/send-message', auth, chatController.sendMessage);

export default router;
