
import { Document, Schema, model, Types } from 'mongoose';

export interface IDoctor extends Document {
    name: string;
    specialty: string;
    experience: number;
    bio?: string;
    profileImage?: string;
    service: Types.ObjectId; // Reference to a Service
    createdAt: Date;
    updatedAt: Date;
}

const doctorSchema = new Schema<IDoctor>(
    {
        name: {
            type: String,
            required: true,
        },
        specialty: {
            type: String,
            required: true,
        },
        service: {
            type: Schema.Types.ObjectId,
            ref: 'Service',
            required: true,
        },
        experience: {
            type: Number,
            required: true,
        },
        bio: {
            type: String,
        },
        profileImage: {
            type: String,
        },
    },
    { timestamps: true }
);

export default model<IDoctor>('Doctor', doctorSchema);
