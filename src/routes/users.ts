import { Router } from 'express';
import authenticateUser from '@/middlewares/authMiddleware';
import asyncHandler from '@/utils/handleAsync';
import { getUser, updateUser } from '@/controllers/usersController';

const router = Router();

router.get('/me', authenticateUser, asyncHandler(getUser));

router.put('/me', authenticateUser, asyncHandler(updateUser));

export default router;