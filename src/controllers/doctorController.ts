import asyncHandler from '@/utils/handleAsync';
import Doctor from '@/models/Doctor';
import Slot from '@/models/Slot';
import AppError from '@/utils/errors/AppError';
import { Request, Response } from 'express'

export const getAllDoctors = asyncHandler(async (req: Request, res: Response) => {
    const { serviceId } = req.query;

    const filter = serviceId ? { service: serviceId } : {};

    const doctors = await Doctor.find(filter).populate('service', 'name');

    if (!doctors || doctors.length === 0) {
        throw new AppError('No doctors found', 404);
    }

    res.status(200).json(doctors);
});

export const getDoctorById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const doctor = await Doctor.findById(id).populate('service');

    if (!doctor) {
        throw new AppError('Doctor not found', 404);
    }

    // Get future available slots
    const today = new Date();
    const slots = await Slot.find({
        doctor: id,
        status: 'available',
        date: { $gte: today },
    }).sort({ date: 1, time: 1 });

    res.status(200).json({doctor, slots});
});
