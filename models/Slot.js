import mongoose from 'mongoose';

const slotSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true
    },
    time: {
        type: String,
        required: true // e.g., '10:00 AM'
    },
    isBooked: {
        type: Boolean,
        default: false
    },
    bookedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    status: {
        type: String,
        enum: ['available', 'booked', 'cancelled', 'completed'],
        default: 'available'
    }
}, { timestamps: true });

export default mongoose.model('Slot', slotSchema);
