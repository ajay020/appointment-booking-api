import { Router } from 'express';
import auth from '@/middlewares/authMiddleware';
import isAdmin from '@/middlewares/roleMiddleware';
import validate from '@/validators/validate';
import { createSlotValidationRules } from '@/validators/slotValidators';
import asyncHandler from '@/utils/handleAsync';
import { createSlot, deleteSlot, getAllSlots, updateSlotStatus } from '@/controllers/slotControleer';

const router = Router();

// POST /api/slots - Create slot (admin only)
router.post('/', auth, isAdmin, createSlotValidationRules(), validate, asyncHandler(createSlot));

// GET /api/slots - Get all slots with pagination
router.get('/', auth, asyncHandler(getAllSlots));

// PUT /api/slots/:id - Update slot status (admin only)
router.put('/:id', auth, isAdmin, asyncHandler(updateSlotStatus));

// DELETE /api/slots/:id - Delete a slot (admin only)
router.delete('/:id', auth, isAdmin, asyncHandler(deleteSlot));

export default router;
