import { Router } from 'express';
import Slot from '../models/Slot.js';
import auth from '../middlewares/authMiddleware.js';
import { bookingIdValidationRules } from '../validators/bookingValidators.js';
import validate from '../validators/validate.js';

const router = Router();

// GET /api/bookings/available - view only available slots
router.get('/available', auth, async (req, res) => {
    try {
        const slots = await Slot.find({ isBooked: false, status: 'available' });
        res.json(slots);
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

// POST /api/bookings/:id - Book a slot by ID
router.post('/:id', auth, bookingIdValidationRules(), validate, async (req, res) => {
    try {
        const slot = await Slot.findById(req.params.id);
        if (!slot) return res.status(404).json({ msg: 'Slot not found' });

        if (slot.isBooked || slot.status !== 'available') {
            return res.status(400).json({ msg: 'Slot already booked or unavailable' });
        }

        slot.isBooked = true;
        slot.bookedBy = req.user.userId;
        slot.status = 'booked';
        await slot.save();

        res.json({ msg: 'Slot booked successfully', slot });
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

// PATCH /api/bookings/:id - Cancel a booking
router.patch('/:id', auth, bookingIdValidationRules(), validate, async (req, res) => {
    try {
        const slot = await Slot.findById(req.params.id);
        if (!slot) return res.status(404).json({ msg: 'Slot not found' });

        if (!slot.isBooked || slot.bookedBy.toString() !== req.user.userId) {
            return res.status(403).json({ msg: 'Not authorized to cancel this slot' });
        }

        slot.isBooked = false;
        slot.bookedBy = null;
        slot.status = 'available';

        await slot.save();
        res.json({ msg: 'Booking cancelled', slot });
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});


// GET /api/bookings/my - View logged-in user's bookings
router.get('/my', auth, async (req, res) => {
    const { page = 1, limit = 10 } = req.query;

    try {
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
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

export default router;
