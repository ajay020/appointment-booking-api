import express from 'express';
import { getAllDoctors, getDoctorById } from '../controllers/doctorController.js';

const router = express.Router();

router.get('/', getAllDoctors);     // GET /api/doctors?serviceId=abc123
router.get('/:id', getDoctorById);  // GET /api/doctors/doctorId

export default router;
