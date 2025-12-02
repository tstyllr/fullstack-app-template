import express from 'express';
import { auth } from '../middleware/auth.js';
import { chatRateLimit } from '../middleware/chatRateLimit.js';
import { chatController } from '../controllers/chat.controller.js';

const router = express.Router();

// Conversation management routes
router.post('/conversations', auth, chatController.createConversation);
router.get('/conversations', auth, chatController.getConversations);
router.get('/conversations/:id', auth, chatController.getConversation);
router.put('/conversations/:id', auth, chatController.updateConversation);
router.delete('/conversations/:id', auth, chatController.deleteConversation);

// Chat message route (with rate limiting)
router.post(
   '/conversations/:id/messages',
   [auth, chatRateLimit],
   chatController.sendMessage
);

// Message search route
router.get('/messages/search', auth, chatController.searchMessages);

// Usage statistics route
router.get('/usage', auth, chatController.getUsageStats);

export default router;
