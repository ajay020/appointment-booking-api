import mongoose, { Types } from 'mongoose';

export interface IService extends Document {
    _id: Types.ObjectId;
    name: string;
    description?: string;
    image?: string;
    createdAt: Date;
    updatedAt: Date;
}

const serviceSchema = new mongoose.Schema<IService>(
    {
        name: {
            type: String,
            required: true,
            unique: true,
        },
        description: {
            type: String,
        },
        image: {
            type: String, // optional: for icons or categories
        },
    },
    { timestamps: true }
);

export default mongoose.model<IService>('Service', serviceSchema);
