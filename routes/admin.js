import { Router } from 'express';
import auth  from '../middlewares/authMiddleware.js';
import { isAdmin } from '../middlewares/roleMiddleware.js';
import User from '../models/User.js';

const router = Router();

router.get('/dashboard', auth, isAdmin, (req, res) => {
    res.json({ msg: `Hello Admin ${req.user.userId}` });
});

router.post("/promote/:id", auth, async (req, res) =>{
    const userId = req.params.id;

    const user =  await User.findById(userId);
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

export default router;