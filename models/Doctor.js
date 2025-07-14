import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        specialization: {
            type: String,
            required: true,
        },
        service: {
            type: mongoose.Schema.Types.ObjectId,
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
            type: String, // e.g., Cloudinary URL or filename
        },
    },
    { timestamps: true }
);

export default mongoose.model('Doctor', doctorSchema);
