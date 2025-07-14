import express from 'express';
import { getAllServices } from '../controllers/serviceController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, getAllServices); // GET /services

export default router;
