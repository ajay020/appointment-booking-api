import { validationResult } from 'express-validator';
import ValidationError from '@/utils/errors/ValidationError';
import { NextFunction, Request, Response } from 'express';

const validate = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const formattedErrors = errors.array().map(err => ({
            path: err.type,
            message: err.msg
        }));

        console.error('Validation errors:', formattedErrors);

        // Throwing error — central error handler will catch this
        throw new ValidationError(formattedErrors);
    }

    next();
};

export default validate;
