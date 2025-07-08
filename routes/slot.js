import { Router } from 'express';
import Slot from '../models/Slot.js';
import auth from '../middlewares/authMiddleware.js';
import isAdmin from '../middlewares/roleMiddleware.js';
import validate from '../validators/validate.js';
import { createSlotValidationRules } from '../validators/slotValidators.js';
import asyncHandler from '../utils/handleAsync.js';
import AppError from '../utils/AppError.js';

const router = Router();

// POST /api/slots - Create slot (admin only)
router.post('/', auth, isAdmin, createSlotValidationRules(), validate, asyncHandler(async (req, res) => {
    const { date, time } = req.body;
    const existingSlot = await Slot.findOne({ date, time });
    if (existingSlot) {
        throw new AppError('A slot for this date and time already exists', 400);
    }

    const slot = new Slot({ date, time });
    await slot.save();
    res.status(201).json(slot);
}));

// GET /api/slots - Get all slots with pagination
router.get('/', auth, asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;

    const [slots, total] = await Promise.all([
        Slot.find()
            .sort({ date: 1 })
            .skip(Number(skip))
            .limit(Number(limit)),

        Slot.countDocuments()
    ]);

    res.json({
        page: Number(page),
        limit: Number(limit),
        totalSlots: total,
        totalPages: Math.ceil(total / limit),
        slots
    });
}));


// PUT /api/slots/:id - Update slot status (admin only)
router.put('/:id', auth, isAdmin, asyncHandler(async (req, res) => {
    const { status } = req.body;

    if (!status || !['available', 'booked', 'cancelled', 'completed'].includes(status)) {
        return res.status(400).json({ msg: 'Invalid status' });
    }

    const slot = await Slot.findById(req.params.id);
    if (!slot) throw new AppError("Slot not found", 404);

    slot.status = status || slot.status;
    await slot.save();

    res.json(slot);

}));

// DELETE /api/slots/:id - Delete a slot (admin only)
router.delete('/:id', auth, isAdmin, asyncHandler(async (req, res) => {
    const slot = await Slot.findByIdAndDelete(req.params.id);
    if (!slot) throw new AppError("Slot not found", 404);
    res.json({ msg: 'Slot deleted successfully' });

}));

export default router;
