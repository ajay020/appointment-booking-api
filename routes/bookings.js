import { Router } from 'express';
import Slot from '../models/Slot.js';
import auth from '../middlewares/authMiddleware.js';
import { bookingIdValidationRules } from '../validators/bookingValidators.js';
import validate from '../validators/validate.js';
import asyncHandler from '../utils/handleAsync.js';
import AppError from '../utils/AppError.js';
import ForbiddenError from '../utils/ForbiddenError.js';

const router = Router();

// GET /api/bookings/available - view only available slots
router.get('/available', auth, asyncHandler(async (req, res) => {
    const slots = await Slot.find({ isBooked: false, status: 'available' });
    res.json(slots);
}));

// POST /api/bookings/:id - Book a slot by ID
router.post('/:id', auth, bookingIdValidationRules(), validate, asyncHandler(async (req, res) => {
    const slot = await Slot.findById(req.params.id);
    if (!slot) throw new AppError('Slot not found', 404);

    if (slot.isBooked || slot.status !== 'available') {
        throw new AppError('Slot already booked or unavailable', 400);
    }

    slot.isBooked = true;
    slot.bookedBy = req.user.userId;
    slot.status = 'booked';
    await slot.save();

    res.json({ msg: 'Slot booked successfully', slot });
}));

// PATCH /api/bookings/:id - Cancel a booking
router.patch('/:id', auth, bookingIdValidationRules(), validate, asyncHandler(async (req, res) => {
    const slot = await Slot.findById(req.params.id);
    if (!slot) throw new AppError('Slot not found', 404);

    if (!slot.isBooked || slot.bookedBy.toString() !== req.user.userId) {
        throw new ForbiddenError('You are not authorized to cancel this booking');
    }

    slot.isBooked = false;
    slot.bookedBy = null;
    slot.status = 'available';

    await slot.save();
    res.json({ msg: 'Booking cancelled', slot });

}));


// GET /api/bookings/my - View logged-in user's bookings
router.get('/my', auth, asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;
    const [bookings, total] = await Promise.all([
        Slot.find({ bookedBy: req.user.userId })
            .sort({ date: -1 })
            .skip(Number(skip))
            .limit(Number(limit)),

        Slot.countDocuments({ bookedBy: req.user.userId })
    ]);

    res.json({
        page: Number(page),
        limit: Number(limit),
        totalBookings: total,
        totalPages: Math.ceil(total / limit),
        bookings
    });
}));

export default router;
