import { validationResult } from 'express-validator';
import ValidationError from '../utils/ValidationError.js';

const validate = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const formattedErrors = errors.array().map(err => ({
            path: err.path,
            message: err.msg
        }));

        console.error('Validation errors:', formattedErrors);

        // Throwing error — central error handler will catch this
        throw new ValidationError(formattedErrors);
    }

    next();
};

export default validate;
