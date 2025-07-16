import express from 'express';
import { getAllDoctors, getDoctorById } from '../controllers/doctorController';
import authMiddleware from '@/middlewares/authMiddleware';

const router = express.Router();

router.get('/', authMiddleware, getAllDoctors);     // GET /api/doctors?serviceId=abc123
router.get('/:id', authMiddleware, getDoctorById);  // GET /api/doctors/doctorId

export default router;
