import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Service from '../models/Service';
import Doctor from '../models/Doctor';

dotenv.config(); // Load MONGO_URI

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/clinic-app';

const seed = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('MongoDB connected.');

        // Clear old data
        await Doctor.deleteMany();
        await Service.deleteMany();

        // Seed services
        const services = await Service.insertMany([
            {
                name: 'Dental Care',
                description: 'Teeth cleaning, cavity filling, etc.',
                image: 'https://img.icons8.com/dental',
            },
            {
                name: 'Eye Exam',
                description: 'Vision test, eye infection treatment, etc.',
                image: 'https://img.icons8.com/eye',
            },
            {
                name: "Women's Health",
                description: 'Gynecology and related consultations',
                image: 'https://img.icons8.com/women-health',
            },
        ]);

        // Seed doctors
        const doctors = await Doctor.insertMany([
            {
                name: 'Dr. Meera Sharma',
                specialty: 'Gynecologist',
                experience: 10,
                bio: 'Expert in prenatal and postnatal care.',
                service: services[2]._id,
                profileImage: 'https://randomuser.me/api/portraits/women/44.jpg',
            },
            {
                name: 'Dr. Rohan Deshmukh',
                specialty: 'Dentist',
                experience: 6,
                bio: 'Specialist in cosmetic dentistry.',
                service: services[0]._id,
                profileImage: 'https://randomuser.me/api/portraits/men/46.jpg',
            },
            {
                name: 'Dr. Kavita Patel',
                specialty: 'Ophthalmologist',
                experience: 8,
                bio: 'Experienced in cataract and glaucoma treatment.',
                service: services[1]._id,
                profileImage: 'https://randomuser.me/api/portraits/women/65.jpg',
            },
            {
                name: 'Dr. Arjun Mehta',
                specialty: 'Dentist',
                experience: 5,
                bio: 'Great with kids and nervous patients.',
                service: services[0]._id,
                profileImage: 'https://randomuser.me/api/portraits/men/52.jpg',
            },
            {
                name: 'Dr. Neha Verma',
                specialty: 'Eye Surgeon',
                experience: 9,
                bio: 'Performs advanced LASIK procedures.',
                service: services[1]._id,
                profileImage: 'https://randomuser.me/api/portraits/women/52.jpg',
            },
        ]);

        console.log('🔥 Fake services and doctors seeded!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Seeding failed:', err);
        process.exit(1);
    }
};

seed();
