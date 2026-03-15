import express from 'express';
import { processChatMessage, getChatHistory } from '../controllers/chatController.js';

const router = express.Router();

router.post('/', processChatMessage);
router.get('/:chatId', getChatHistory);

export default router;
