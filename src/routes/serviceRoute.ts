import express from 'express';
import { getAllServices } from '@/controllers/serviceController';
import authMiddleware from '@/middlewares/authMiddleware';

const router = express.Router();

router.get('/', authMiddleware, getAllServices); // GET /services

export default router;
