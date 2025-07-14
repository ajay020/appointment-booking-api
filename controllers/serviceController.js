import Service from '../models/Service.js';

export const getAllServices = async (req, res, next) => {
    const services = await Service.find();

    if (!services || services.length === 0) {
        throw new AppError('No services found', 404);
    }

    res.status(200).json(services);
};
