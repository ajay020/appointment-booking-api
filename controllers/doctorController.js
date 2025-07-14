import Doctor from '../models/Doctor.js';
import Slot from '../models/Slot.js';
import AppError from '../utils/AppError.js';

export const getAllDoctors = async (req, res) => {
    const { serviceId } = req.query;

    const filter = serviceId ? { service: serviceId } : {};

    const doctors = await Doctor.find(filter).populate('service', 'name');

    if (!doctors || doctors.length === 0) {
        throw new AppError('No doctors found', 404);
    }

    res.status(200).json(doctors);
};

export const getDoctorById = async (req, res) => {
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

    res.status(200).json({
        doctor,
        availableSlots: slots,
    });
};
