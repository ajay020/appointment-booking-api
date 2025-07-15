import { Request, Router, Response } from 'express';
import Slot from '@/models/Slot';
import auth from '@/middlewares/authMiddleware';
import isAdmin from '@/middlewares/roleMiddleware';
import validate from '@/validators/validate';
import { createSlotValidationRules } from '@/validators/slotValidators';
import asyncHandler from '@/utils/handleAsync';
import AppError from '@/utils/errors/AppError';

const router = Router();

// POST /api/slots - Create slot (admin only)
router.post('/', auth, isAdmin, createSlotValidationRules(), validate, asyncHandler(async (req: Request, res: Response) => {
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
router.get('/', auth, asyncHandler(async (req: Request, res: Response) => {
    const { page = 1, limit = 10, date } = req.query;

    const skip = (page - 1) * limit;

    const filter = {};

    // If date is provided, filter by it
    if (date) {
        const selectedDate = new Date(date);
        selectedDate.setHours(0, 0, 0, 0);

        const nextDay = new Date(selectedDate);
        nextDay.setDate(nextDay.getDate() + 1);

        filter.date = {
            $gte: selectedDate,
            $lt: nextDay
        };
    }

    const [slots, total] = await Promise.all([
        Slot.find(filter)
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
router.put('/:id', auth, isAdmin, asyncHandler(async (req: Request, res: Response) => {
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
router.delete('/:id', auth, isAdmin, asyncHandler(async (req: Request, res: Response) => {
    const slot = await Slot.findByIdAndDelete(req.params.id);
    if (!slot) throw new AppError("Slot not found", 404);
    res.json({ msg: 'Slot deleted successfully' });

}));

export default router;
