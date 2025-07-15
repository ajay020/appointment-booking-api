import { Request, Response, Router } from 'express';
import auth from '@/middlewares/authMiddleware';
import isAdmin from '@/middlewares/roleMiddleware';
import User from '@/models/User';
import Slot from '@/models/Slot';
import { adminBookingFiltersValidation } from '@/validators/adminValidators';
import validate from '@/validators/validate';
import asyncHandler from '@/utils/handleAsync';
import AppError from '@/utils/errors/AppError';

const router = Router();

router.get('/dashboard', auth, isAdmin, (req: Request, res: Response) => {
    res.json({ msg: `Hello Admin ${req.user?.userId}` });
});

router.post("/promote/:id", auth, asyncHandler(async (req: Request, res: Response) => {
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) throw new AppError("User not found", 404);
    if (user.role === 'admin') {
        throw new AppError("User is already an admin", 400);
    }
    user.role = 'admin'; // Change role to admin
    await user.save();
    res.json({ msg: `User ${userId} promoted to admin` });
}))

// GET /api/admin/bookings - all bookings (optional status filter)
router.get(
    '/bookings',
    auth,
    isAdmin,
    adminBookingFiltersValidation(),
    validate,
    asyncHandler(async (req: Request, res: Response) => {
        const { status, page = 1, limit = 10, from, to } = req.query;
        const skip = (page - 1) * limit;

        const filter = { isBooked: true };

        if (status) filter.status = status;
        if (from || to) {
            filter.date = {};
            if (from) filter.date.$gte = new Date(from);
            if (to) filter.date.$lte = new Date(to);
        }

        const [bookings, total] = await Promise.all([
            Slot.find(filter)
                .populate('bookedBy', 'name email')
                .sort({ date: -1 })
                .skip(Number(skip))
                .limit(Number(limit)),

            Slot.countDocuments(filter)
        ]);

        res.json({
            page: Number(page),
            limit: Number(limit),
            totalBookings: total,
            totalPages: Math.ceil(total / limit),
            bookings
        });
    })
);



// GET /api/admin/summary - stats overview
router.get('/summary', auth, isAdmin, asyncHandler(async (req: Request, res: Response) => {
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
}));

// GET /api/admin/active-users - top 5 users with most bookings
router.get('/active-users', auth, isAdmin, asyncHandler(async (req: Request, res: Response) => {
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
}));

export default router;
