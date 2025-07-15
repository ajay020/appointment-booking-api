import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema(
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

export default mongoose.model('Service', serviceSchema);
