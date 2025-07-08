import express from 'express';
import { connect } from 'mongoose';
import { config } from 'dotenv';

import { cancelOldUnbookedSlots } from './cron/cancelOldSlots.js';

import authRoutes from './routes/auth.js'
import adminRoutes from './routes/admin.js';
import slotRoutes from './routes/slot.js';
import bookingRoutes from './routes/bookings.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();
config();

// Middleware to parse JSON
app.use(express.json());

// cancel old unbooked slots every 24 hours
// cancelOldUnbookedSlots();

// routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/slots', slotRoutes);
app.use('/api/bookings', bookingRoutes);


// Simple route
app.get('/', (req, res) => {
    res.send('Appointment Booking API is running!');
});


// Error handling middleware
app.use(errorHandler);

// Connect to MongoDB
connect(process.env.MONGO_URI)
    .then(() => {
        console.log('✅ Connected to MongoDB');
        app.listen(process.env.PORT, () => {
            console.log(`🚀 Server running at http://localhost:${process.env.PORT}`);
        });
    })
    .catch((err) => {
        console.error('❌ MongoDB connection error:', err);
    });
