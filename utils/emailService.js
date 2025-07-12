import nodemailer from 'nodemailer';

// Create transporter
const createTransporter = () => {
    return nodemailer.createTransporter({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: process.env.EMAIL_PORT || 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
};

// Send booking confirmation email
export const sendBookingConfirmation = async (userEmail, userName, slot) => {
    try {
        const transporter = createTransporter();
        
        const mailOptions = {
            from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
            to: userEmail,
            subject: 'Booking Confirmation - Appointment Booked Successfully',
            html: `
                <h2>Booking Confirmation</h2>
                <p>Dear ${userName},</p>
                <p>Your appointment has been confirmed for:</p>
                <ul>
                    <li><strong>Date:</strong> ${new Date(slot.date).toDateString()}</li>
                    <li><strong>Time:</strong> ${slot.time}</li>
                    <li><strong>Status:</strong> ${slot.status}</li>
                </ul>
                <p>Please arrive on time for your appointment.</p>
                <p>If you need to cancel or reschedule, please contact us as soon as possible.</p>
                <p>Thank you for choosing our service!</p>
            `
        };
        
        await transporter.sendMail(mailOptions);
        console.log(`Booking confirmation email sent to ${userEmail}`);
    } catch (error) {
        console.error('Error sending booking confirmation email:', error);
    }
};

// Send booking cancellation email
export const sendBookingCancellation = async (userEmail, userName, slot) => {
    try {
        const transporter = createTransporter();
        
        const mailOptions = {
            from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
            to: userEmail,
            subject: 'Booking Cancelled - Appointment Cancellation Confirmation',
            html: `
                <h2>Booking Cancellation</h2>
                <p>Dear ${userName},</p>
                <p>Your appointment has been cancelled:</p>
                <ul>
                    <li><strong>Date:</strong> ${new Date(slot.date).toDateString()}</li>
                    <li><strong>Time:</strong> ${slot.time}</li>
                </ul>
                <p>If you'd like to book another appointment, please visit our booking system.</p>
                <p>Thank you for your understanding.</p>
            `
        };
        
        await transporter.sendMail(mailOptions);
        console.log(`Booking cancellation email sent to ${userEmail}`);
    } catch (error) {
        console.error('Error sending booking cancellation email:', error);
    }
};

// Send booking reminder email
export const sendBookingReminder = async (userEmail, userName, slot) => {
    try {
        const transporter = createTransporter();
        
        const mailOptions = {
            from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
            to: userEmail,
            subject: 'Appointment Reminder - Your Appointment is Tomorrow',
            html: `
                <h2>Appointment Reminder</h2>
                <p>Dear ${userName},</p>
                <p>This is a friendly reminder about your upcoming appointment:</p>
                <ul>
                    <li><strong>Date:</strong> ${new Date(slot.date).toDateString()}</li>
                    <li><strong>Time:</strong> ${slot.time}</li>
                </ul>
                <p>Please arrive on time for your appointment.</p>
                <p>If you need to cancel or reschedule, please contact us as soon as possible.</p>
                <p>See you tomorrow!</p>
            `
        };
        
        await transporter.sendMail(mailOptions);
        console.log(`Booking reminder email sent to ${userEmail}`);
    } catch (error) {
        console.error('Error sending booking reminder email:', error);
    }
};

// Send admin notification email
export const sendAdminNotification = async (subject, message) => {
    try {
        const transporter = createTransporter();
        
        const mailOptions = {
            from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
            to: process.env.ADMIN_EMAIL,
            subject: `Admin Notification: ${subject}`,
            html: `
                <h2>Admin Notification</h2>
                <p>${message}</p>
                <p>This is an automated notification from the Appointment Booking System.</p>
            `
        };
        
        await transporter.sendMail(mailOptions);
        console.log('Admin notification email sent');
    } catch (error) {
        console.error('Error sending admin notification email:', error);
    }
};

export default {
    sendBookingConfirmation,
    sendBookingCancellation,
    sendBookingReminder,
    sendAdminNotification
};