import { Router } from 'express';
import { getChatHistory } from '../controllers/chat.controllers.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { saveMessage } from '../controllers/chat.controllers.js';

const router = Router();

// Chaining .get and .post to the same path
router.route("/:projectId")
    .get(verifyJWT, getChatHistory)
    .post(verifyJWT, saveMessage); 

export default router;