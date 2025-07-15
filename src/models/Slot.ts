
import mongoose, { Document, Schema, model, Types } from 'mongoose';

export interface ISlot extends Document {
    date: Date;
    time: string;
    isBooked: boolean;
    status: 'available' | 'booked' | 'cancelled' | 'completed';
    bookedBy: Types.ObjectId | null;
    doctor: Types.ObjectId; // Reference to Doctor
    createdAt: Date;
    updatedAt: Date;
}

const slotSchema = new mongoose.Schema<ISlot>(
    {
        date: {
            type: Date,
            required: true,
        },
        time: {
            type: String,
            required: true,
        },
        doctor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Doctor',
            required: true,
        },
        isBooked: {
            type: Boolean,
            default: false,
        },
        bookedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        status: {
            type: String,
            enum: ['available', 'booked', 'cancelled', 'completed'],
            default: 'available',
        },
    },
    { timestamps: true }
);

export default mongoose.model<ISlot>('Slot', slotSchema);
