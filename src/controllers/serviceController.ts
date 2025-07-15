import { Request, Response } from 'express';
import Service from '../models/Service';
import AppError from '../utils/errors/AppError';
import asyncHandler from '@/utils/handleAsync';

export const getAllServices = asyncHandler(async (req: Request, res: Response) => {
    const services = await Service.find();

    if (!services || services.length === 0) {
        throw new AppError('No services found', 404);
    }

    res.status(200).json(services);
});
