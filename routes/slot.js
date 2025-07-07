import { Router } from 'express';
import Slot from '../models/Slot.js';
import auth from '../middlewares/authMiddleware.js';
import isAdmin from '../middlewares/roleMiddleware.js';
import validate from '../validators/validate.js';
import { createSlotValidationRules } from '../validators/slotValidators.js';

const router = Router();

// POST /api/slots - Create slot (admin only)
router.post('/', auth, isAdmin, createSlotValidationRules(), validate, async (req, res) => {
    const { date, time } = req.body;
    try {
        const existingSlot = await Slot.findOne({ date, time });
        if (existingSlot) {
            return res.status(400).json({ msg: 'A slot for this date and time already exists' });
        }
        
        const slot = new Slot({ date, time });
        await slot.save();
        res.status(201).json(slot);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
});

// GET /api/slots - Get all slots with pagination
router.get('/', auth, async (req, res) => {
    const { page = 1, limit = 10 } = req.query;

    try {
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
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});


// PUT /api/slots/:id - Update slot status (admin only)
router.put('/:id', auth, isAdmin, async (req, res) => {
    const { status } = req.body;

    if (!status || !['available', 'booked', 'cancelled', 'completed'].includes(status)) {
        return res.status(400).json({ msg: 'Invalid status' });
    }

    try {
        const slot = await Slot.findById(req.params.id);
        if (!slot) return res.status(404).json({ msg: 'Slot not found' });

        slot.status = status || slot.status;
        await slot.save();

        res.json(slot);
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

// DELETE /api/slots/:id - Delete a slot (admin only)
router.delete('/:id', auth, isAdmin, async (req, res) => {
    try {
        const slot = await Slot.findByIdAndDelete(req.params.id);
        if (!slot) return res.status(404).json({ msg: 'Slot not found' });
        res.json({ msg: 'Slot deleted successfully' });
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

export default router;
