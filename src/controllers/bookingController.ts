import { Request, Response } from 'express';
import Slot from '@/models/Slot';
import AppError from '@/utils/errors/AppError';
import ForbiddenError from '@/utils/errors/ForbiddenError';
import AuthError from '@/utils/errors/AuthError';
import mongoose from 'mongoose';
import NotFoundError from '@/utils/errors/NotFoundError';


export const availableSlot = async (req: Request, res: Response) => {
    const slots = await Slot.find({ isBooked: false, status: 'available' });
    res.json(slots);
}

export const bookSlotById = async (req: Request, res: Response): Promise<void> => {
    const slotId = req.params.id;
    const userId = req.user?.userId;

    if (!userId) {
        throw new AppError('Unauthorized', 401);
    }

    const slot = await Slot.findById(slotId);

    if (!slot) {
        throw new AppError('Slot not found', 404);
    }

    if (slot.isBooked || slot.status !== 'available') {
        throw new AppError('Slot already booked or unavailable', 400);
    }

    slot.isBooked = true;
    slot.bookedBy = new mongoose.Types.ObjectId(userId);
    slot.status = 'booked';

    await slot.save();

    res.status(200).json({
        msg: 'Slot booked successfully',
        slot,
    });
};

export const cancelBooking = async (req: Request, res: Response): Promise<void> => {
    const userObjectId = new mongoose.Types.ObjectId(req.user?.userId);
    const slotId = req.params.id;

    if (!userObjectId) {
        throw new AuthError("User is not athorised")
    }

    const slot = await Slot.findById(slotId);
    if (!slot) throw new NotFoundError('Slot not found');

    if (!slot.isBooked || slot.bookedBy !== userObjectId) {
        throw new ForbiddenError('You are not authorized to cancel this booking');
    }

    slot.isBooked = false;
    slot.bookedBy = null;
    slot.status = 'available';

    await slot.save();
    res.json({ msg: 'Booking cancelled', slot });
}

export const getMyBookings = async (req: Request, res: Response): Promise<void> => {
    const { page = '1', limit = '10' } = req.query as {
        page?: string;
        limit?: string;
    };

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const userId = req.user?.userId;
    if (!userId) {
        throw new AuthError("User is not athorised")
    }

    const [bookings, total] = await Promise.all([
        Slot.find({ bookedBy: userId })
            .sort({ date: -1 })
            .skip(skip)
            .limit(limitNum),

        Slot.countDocuments({ bookedBy: userId }),
    ]);

    res.status(200).json({
        page: pageNum,
        limit: limitNum,
        totalBookings: total,
        totalPages: Math.ceil(total / limitNum),
        bookings,
    });
};