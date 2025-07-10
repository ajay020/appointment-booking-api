//  Global error listeners
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
});

process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
    process.exit(1);
});

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++
import express from 'express';
import { config } from 'dotenv';

import { cancelOldUnbookedSlots } from './cron/cancelOldSlots.js';

import authRoutes from './routes/auth.js'
import adminRoutes from './routes/admin.js';
import slotRoutes from './routes/slot.js';
import bookingRoutes from './routes/bookings.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { connectDB } from './config/db.js';

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

// Start server
const start = async () => {
    await connectDB(process.env.MONGO_URI);

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
    });
};

start();
