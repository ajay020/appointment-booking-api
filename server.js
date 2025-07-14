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

import authRoutes from './routes/auth.js'
import adminRoutes from './routes/admin.js';
import slotRoutes from './routes/slot.js';
import bookingRoutes from './routes/bookings.js';
import usersRoutes from './routes/users.js';
import serviceRoutes from './routes/serviceRoute.js'

import { errorHandler } from './middlewares/errorHandler.js';
import { connectDB } from './config/db.js';

const app = express();
config();

// Middleware to parse JSON
app.use(express.json());

// Enable logging for every incoming request
morgan.token('body', (req) => JSON.stringify(req.body));
app.use(morgan(':method :url :status :response-time ms - :body'));

// cancel old unbooked slots every 24 hours
// cancelOldUnbookedSlots();

// routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/slots', slotRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/services', serviceRoutes);

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
