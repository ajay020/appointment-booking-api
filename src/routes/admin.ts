import { Request, Response, Router } from 'express';
import auth from '@/middlewares/authMiddleware';
import isAdmin from '@/middlewares/roleMiddleware';
import { adminBookingFiltersValidation } from '@/validators/adminValidators';
import validate from '@/validators/validate';
import asyncHandler from '@/utils/handleAsync';
import { getActiveUsers, getAllBookings, getStatsSummary, upgradeUserToAdmin } from '@/controllers/adminController';

const router = Router();

router.get('/dashboard', auth, isAdmin, (req: Request, res: Response) => {
    res.json({ msg: `Hello Admin ${req.user?.userId}` });
});

router.post("/promote/:id", auth, asyncHandler(upgradeUserToAdmin))

// GET /api/admin/bookings - all bookings (optional status filter)
router.get(
    '/bookings',
    auth,
    isAdmin,
    adminBookingFiltersValidation(),
    validate,
    asyncHandler(getAllBookings)
);

// GET /api/admin/summary - stats overview
router.get('/summary', auth, isAdmin, asyncHandler(getStatsSummary));

// GET /api/admin/active-users - top 5 users with most bookings
router.get('/active-users', auth, isAdmin, asyncHandler(getActiveUsers));

export default router;
