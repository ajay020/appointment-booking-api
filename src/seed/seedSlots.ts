import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Doctor from '../models/Doctor';
import Slot from '../models/Slot'

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/clinic-app';

const generateSlotsForDoctor = async (doctorId: string) => {
    const slots = [];

    const today = new Date();
    for (let i = 1; i <= 5; i++) {
        const day = new Date(today);
        day.setDate(today.getDate() + i); // next 5 days

        const times = ['10:00 AM', '11:00 AM', '2:00 PM', '4:00 PM'];

        for (const time of times) {
            slots.push({
                date: new Date(day.toDateString()), // Only YYYY-MM-DD
                time,
                doctor: doctorId,
                status: 'available',
            });
        }
    }

    await Slot.insertMany(slots);
};

const seed = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        await Slot.deleteMany();

        const doctors = await Doctor.find();
        for (const doc of doctors) {
            console.log(`Generating slots for Dr. ${doc.name}`);
            await generateSlotsForDoctor(doc._id.toString());
        }

        console.log('✅ Slot seeding complete');
        process.exit(0);
    } catch (err) {
        console.error('❌ Slot seeding failed', err);
        process.exit(1);
    }
};

seed();
