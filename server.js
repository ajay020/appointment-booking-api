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
import morgan from 'morgan';

import { cancelOldUnbookedSlots } from './cron/cancelOldSlots.js';
import { sendBookingReminders } from './cron/bookingReminders.js';
import { generalLimiter, authLimiter, bookingLimiter, adminLimiter } from './middlewares/rateLimiter.js';

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

// Apply general rate limiting to all routes
app.use(generalLimiter);

// Enable logging for every incoming request
morgan.token('body', (req) => JSON.stringify(req.body));
app.use(morgan(':method :url :status :response-time ms - :body'));

// cancel old unbooked slots every 24 hours
// cancelOldUnbookedSlots();

// Send booking reminders daily at 9:00 AM
// sendBookingReminders();

// routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/admin', adminLimiter, adminRoutes);
app.use('/api/slots', slotRoutes);
app.use('/api/bookings', bookingLimiter, bookingRoutes);

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
