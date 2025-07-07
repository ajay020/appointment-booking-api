import { param } from 'express-validator';
import mongoose from 'mongoose';


const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

export const bookingIdValidationRules = () => [
    param('id')
        .custom((value) => isValidObjectId(value))
        .withMessage('Invalid booking/slot ID')
];

