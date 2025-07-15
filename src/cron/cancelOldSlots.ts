import cron from 'node-cron';
import Slot from '../models/Slot.js';

// Run every hour → you can change this to daily, etc.
export const cancelOldUnbookedSlots = () => {
    cron.schedule('0 0 * * *', async () => {
        try {
            const now = new Date();

            const result = await Slot.updateMany(
                {
                    date: { $lt: now },
                    isBooked: false,
                    status: 'available'
                },
                {
                    $set: { status: 'cancelled' }
                }
            );

            if (result.modifiedCount > 0) {
                console.log(`⏳ Cron: ${result.modifiedCount} old slots auto-cancelled`);
            }
        } catch (err) {
            console.error('❌ Cron error:', err);
        }
    });
};
