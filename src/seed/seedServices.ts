import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Service from '../models/Service.js';

dotenv.config(); // Load .env if using it

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/your-db';

const services = [
    { name: 'Dental Checkup', description: 'Routine dental exam', price: 500, duration: 30 },
    { name: 'Eye Exam', description: 'Vision and eye health test', price: 400, duration: 20 },
    { name: 'Physiotherapy', description: 'Therapy for pain relief and mobility', price: 700, duration: 45 },
];

const seedServices = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('MongoDB connected');

        await Service.deleteMany(); // optional: wipe existing
        await Service.insertMany(services);
        console.log('Services seeded successfully');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding services:', error);
        process.exit(1);
    }
};

seedServices();
