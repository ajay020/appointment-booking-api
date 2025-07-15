import { Router, Request, Response } from 'express';
import Slot from '@/models/Slot';
import auth from '@/middlewares/authMiddleware';
import { bookingIdValidationRules } from '@/validators/bookingValidators';
import validate from '@/validators/validate';
import asyncHandler from '@/utils/handleAsync';
import AppError from '@/utils/errors/AppError';
import ForbiddenError from '@/utils/errors/ForbiddenError';
import { availableSlot, bookSlotById, cancelBooking, getMyBookings } from '@/controllers/bookingController';

const router = Router();

// GET /api/bookings/available - view only available slots
router.get('/available', auth, asyncHandler(availableSlot));

// POST /api/bookings/:id - Book a slot by ID
router.post(
    '/:id',
    auth,
    bookingIdValidationRules(),
    validate,
    asyncHandler(bookSlotById));

// PATCH /api/bookings/:id - Cancel a booking
router.patch(
    '/:id',
    auth,
    bookingIdValidationRules(),
    validate,
    asyncHandler(cancelBooking));

// GET /api/bookings/my - View logged-in user's bookings
router.get('/my', auth, asyncHandler(getMyBookings));

export default router;
