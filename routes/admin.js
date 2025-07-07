import { Router } from 'express';
import auth from '../middlewares/authMiddleware.js';
import isAdmin from '../middlewares/roleMiddleware.js';
import User from '../models/User.js';
import Slot from '../models/Slot.js';

const router = Router();

router.get('/dashboard', auth, isAdmin, (req, res) => {
    res.json({ msg: `Hello Admin ${req.user.userId}` });
});

router.post("/promote/:id", auth, async (req, res) => {
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
        return res.status(404).json({ msg: 'User not found' });
    }
    if (user.role === 'admin') {
        return res.status(400).json({ msg: 'User is already an admin' });
    }
    user.role = 'admin'; // Change role to admin
    await user.save();
    res.json({ msg: `User ${userId} promoted to admin` });
})

// GET /api/admin/bookings - all bookings (optional status filter)
router.get('/bookings', auth, isAdmin, async (req, res) => {
    const { status, page = 1, limit = 10 } = req.query;

    const filter = { isBooked: true };
    if (status) filter.status = status;

    try {
        const skip = (page - 1) * limit;

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
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});


// GET /api/admin/summary - stats overview
router.get('/summary', auth, isAdmin, async (req, res) => {
    try {
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
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

// GET /api/admin/active-users - top 5 users with most bookings
router.get('/active-users', auth, isAdmin, async (req, res) => {
    try {
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
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

export default router;
