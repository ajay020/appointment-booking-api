import { Router } from 'express';
import {
  loginUserValidationRules,
  registerUserValidationRules
} from '@/validators/authValidators';
import validate from '@/validators/validate';
import asyncHandler from '@/utils/handleAsync';
import auth from '@/middlewares/authMiddleware';
import { login, logout, refreshToken, register } from '@/controllers/authController';

const router = Router();

// POST /api/auth/register
router.post(
  '/register',
  registerUserValidationRules(),
  validate,
  asyncHandler(register)
);

// POST /api/auth/login
router.post(
  '/login',
  loginUserValidationRules(),
  validate,
  asyncHandler(login));

// POST /api/auth/refresh-token
// This endpoint allows users to refresh their access token using a refresh token
router.post('/refresh-token', asyncHandler(refreshToken));

router.post('/logout', auth, asyncHandler(logout));


export default router;
