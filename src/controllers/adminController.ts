import { Request, Response } from 'express';
import User from '@/models/User';
import Slot, { ISlot } from '@/models/Slot';
import AppError from '@/utils/errors/AppError';


export const upgradeUserToAdmin = async (req: Request, res: Response) => {
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) throw new AppError("User not found", 404);
    if (user.role === 'admin') {
        throw new AppError("User is already an admin", 400);
    }
    user.role = 'admin'; // Change role to admin
    await user.save();
    res.json({ msg: `User ${userId} promoted to admin` });
}

export const getAllBookings = async (req: Request, res: Response) => {
    const {
        status,
        from,
        to,
        page = '1',
        limit = '10',
    } = req.query as {
        status?: ISlot['status'];
        from?: string;
        to?: string;
        page?: string;
        limit?: string;
    };
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Filter object
    const filter: Record<string, any> = {
        isBooked: true,
    };

    if (status) {
        filter.status = status;
    }

    if (from || to) {
        filter.date = {};
        if (from) filter.date.$gte = new Date(from);
        if (to) filter.date.$lte = new Date(to);
    }


    const [bookings, total] = await Promise.all([
        Slot.find(filter)
            .populate('bookedBy', 'name email')
            .sort({ date: -1 })
            .skip(skip)
            .limit(limitNum),

        Slot.countDocuments(filter),
    ]);

    res.status(200).json({
        page: pageNum,
        limit: limitNum,
        totalBookings: total,
        totalPages: Math.ceil(total / limitNum),
        bookings,
    });
}

export const getStatsSummary = async (req: Request, res: Response) => {
    const totalUsers = await User.countDocuments();
    const totalSlots = await Slot.countDocuments();
    const totalBooked = await Slot.countDocuments({ isBooked: true });
    const totalAvailable = await Slot.countDocuments({ isBooked: false, status: 'available' });
    const totalCancelled = await Slot.countDocuments({ status: 'cancelled' });
    const totalCompleted = await Slot.countDocuments({ status: 'completed' });

    res.json({
        users: totalUsers,
        slots: {
            total: totalSlots,
            booked: totalBooked,
            available: totalAvailable,
            cancelled: totalCancelled,
            completed: totalCompleted
        }
    });
}

export const getActiveUsers = async (req: Request, res: Response) => {
    const topUsers = await Slot.aggregate([
        { $match: { bookedBy: { $ne: null } } },
        { $group: { _id: '$bookedBy', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        {
            $lookup: {
                from: 'users',
                localField: '_id',
                foreignField: '_id',
                as: 'userInfo'
            }
        },
        { $unwind: '$userInfo' },
        {
            $project: {
                _id: 0,
                userId: '$userInfo._id',
                name: '$userInfo.name',
                email: '$userInfo.email',
                bookings: '$count'
            }
        }
    ]);

    res.json(topUsers);
}