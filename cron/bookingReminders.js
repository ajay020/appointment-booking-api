import cron from 'node-cron';
import Slot from '../models/Slot.js';
import User from '../models/User.js';
import { sendBookingReminder } from '../utils/emailService.js';

// Send booking reminders daily at 9:00 AM
export const sendBookingReminders = () => {
    cron.schedule('0 9 * * *', async () => {
        try {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(0, 0, 0, 0);
            
            const dayAfterTomorrow = new Date(tomorrow);
            dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);
            
            // Find all bookings for tomorrow
            const upcomingBookings = await Slot.find({
                date: {
                    $gte: tomorrow,
                    $lt: dayAfterTomorrow
                },
                isBooked: true,
                status: 'booked'
            }).populate('bookedBy', 'name email');
            
            if (upcomingBookings.length === 0) {
                console.log('📅 No booking reminders to send for tomorrow');
                return;
            }
            
            let sentCount = 0;
            
            for (const booking of upcomingBookings) {
                try {
                    await sendBookingReminder(
                        booking.bookedBy.email,
                        booking.bookedBy.name,
                        booking
                    );
                    sentCount++;
                } catch (error) {
                    console.error(`Failed to send reminder for booking ${booking._id}:`, error);
                }
            }
            
            console.log(`📧 Sent ${sentCount} booking reminders for tomorrow`);
        } catch (error) {
            console.error('❌ Error in booking reminders cron job:', error);
        }
    });
};