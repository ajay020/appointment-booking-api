import { Request, Response } from 'express';
import Slot from '@/models/Slot';
import AppError from '@/utils/errors/AppError';
import NotFoundError from '@/utils/errors/NotFoundError';


export const createSlot = async (req: Request, res: Response) => {
    const { date, time } = req.body;
    const existingSlot = await Slot.findOne({ date, time });
    if (existingSlot) {
        throw new AppError('A slot for this date and time already exists', 400);
    }

    const slot = new Slot({ date, time });
    await slot.save();
    res.status(201).json(slot);
}

export const getAllSlots = async (req: Request, res: Response) => {
    const { page = '1', limit = '10', date } = req.query as {

        page?: string,
        limit?: string,
        date?: string
    };

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const skip = (pageNum - 1) * limitNum;

    const filter: Record<string, any> = {};

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

        Slot.countDocuments(filter),
    ]);

    res.json({
        page: Number(page),
        limit: Number(limit),
        totalSlots: total,
        totalPages: Math.ceil(total / limitNum),
        slots
    });
}

export const updateSlotStatus = async (req: Request, res: Response) => {
    const { status } = req.body;

    if (!status || !['available', 'booked', 'cancelled', 'completed'].includes(status)) {
        throw new AppError("Invalid status")
    }

    const slot = await Slot.findById(req.params.id);
    if (!slot) throw new NotFoundError("Slot not found");

    slot.status = status || slot.status;
    await slot.save();

    res.json(slot);
}

export const deleteSlot = async (req: Request, res: Response) => {
    const slot = await Slot.findByIdAndDelete(req.params.id);

    if (!slot) throw new NotFoundError("Slot not found");

    res.json({ msg: 'Slot deleted successfully' });

}