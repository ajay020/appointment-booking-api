import { Router } from 'express';
import auth from '../middlewares/authMiddleware.js';
import isAdmin from '../middlewares/roleMiddleware.js';
import User from '../models/User.js';
import Slot from '../models/Slot.js';
import { adminBookingFiltersValidation } from '../validators/adminValidators.js';
import validate from '../validators/validate.js';
import asyncHandler from '../utils/handleAsync.js';
import AppError from '../utils/AppError.js';

const router = Router();

router.get('/dashboard', auth, isAdmin, (req, res) => {
    res.json({ msg: `Hello Admin ${req.user.userId}` });
});

router.post("/promote/:id", auth, asyncHandler(async (req, res) => {
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
    asyncHandler(async (req, res) => {
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
router.get('/summary', auth, isAdmin, asyncHandler(async (req, res) => {
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
router.get('/active-users', auth, isAdmin, asyncHandler(async (req, res) => {
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

// GET /api/admin/users - Get all users with pagination
router.get('/users', auth, isAdmin, asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, search, role } = req.query;
    const skip = (page - 1) * limit;
    
    const filter = {};
    if (search) {
        filter.$or = [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
        ];
    }
    if (role) filter.role = role;
    
    const [users, total] = await Promise.all([
        User.find(filter)
            .select('-password -refreshToken')
            .sort({ createdAt: -1 })
            .skip(Number(skip))
            .limit(Number(limit)),
        User.countDocuments(filter)
    ]);
    
    res.json({
        page: Number(page),
        limit: Number(limit),
        totalUsers: total,
        totalPages: Math.ceil(total / limit),
        users
    });
}));

// DELETE /api/admin/users/:id - Delete a user
router.delete('/users/:id', auth, isAdmin, asyncHandler(async (req, res) => {
    const userId = req.params.id;
    
    if (userId === req.user.userId) {
        throw new AppError('Cannot delete your own account', 400);
    }
    
    const user = await User.findById(userId);
    if (!user) throw new AppError('User not found', 404);
    
    // Cancel all bookings by this user
    await Slot.updateMany(
        { bookedBy: userId },
        { $set: { isBooked: false, bookedBy: null, status: 'available' } }
    );
    
    await User.findByIdAndDelete(userId);
    
    res.json({ msg: 'User deleted successfully' });
}));

// POST /api/admin/bulk-slots - Create multiple slots at once
router.post('/bulk-slots', auth, isAdmin, asyncHandler(async (req, res) => {
    const { date, times } = req.body;
    
    if (!date || !times || !Array.isArray(times) || times.length === 0) {
        throw new AppError('Date and times array are required', 400);
    }
    
    const slots = [];
    const errors = [];
    
    for (const time of times) {
        try {
            const existingSlot = await Slot.findOne({ date, time });
            if (existingSlot) {
                errors.push(`Slot already exists for ${time}`);
                continue;
            }
            
            const slot = new Slot({ date, time });
            await slot.save();
            slots.push(slot);
        } catch (error) {
            errors.push(`Failed to create slot for ${time}: ${error.message}`);
        }
    }
    
    res.json({
        msg: `Created ${slots.length} slots successfully`,
        slotsCreated: slots.length,
        errors: errors.length > 0 ? errors : undefined,
        slots
    });
}));

// GET /api/admin/analytics - Advanced analytics
router.get('/analytics', auth, isAdmin, asyncHandler(async (req, res) => {
    const { period = '7d' } = req.query;
    
    let dateFilter = {};
    const now = new Date();
    
    switch (period) {
        case '7d':
            dateFilter = { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) };
            break;
        case '30d':
            dateFilter = { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) };
            break;
        case '90d':
            dateFilter = { $gte: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) };
            break;
        default:
            dateFilter = { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) };
    }
    
    const [
        bookingTrends,
        userRegistrations,
        popularTimes,
        cancellationRate
    ] = await Promise.all([
        // Booking trends over time
        Slot.aggregate([
            { $match: { createdAt: dateFilter, isBooked: true } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]),
        
        // User registrations over time
        User.aggregate([
            { $match: { createdAt: dateFilter } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]),
        
        // Most popular booking times
        Slot.aggregate([
            { $match: { isBooked: true } },
            { $group: { _id: '$time', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]),
        
        // Cancellation rate
        Slot.aggregate([
            {
                $group: {
                    _id: null,
                    totalSlots: { $sum: 1 },
                    cancelled: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } }
                }
            },
            {
                $project: {
                    cancellationRate: { $divide: ['$cancelled', '$totalSlots'] }
                }
            }
        ])
    ]);
    
    res.json({
        bookingTrends,
        userRegistrations,
        popularTimes,
        cancellationRate: cancellationRate[0]?.cancellationRate || 0
    });
}));

export default router;
