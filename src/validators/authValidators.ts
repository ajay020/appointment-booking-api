import { body } from 'express-validator';

export const registerUserValidationRules = () => [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password')
        .isLength({ min: 5 })
        .withMessage('Password must be at least 5 characters long')
];

export const loginUserValidationRules = () => [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password')
        .isLength({ min: 5 })
        .withMessage('Password must be at least 5 characters long')
];
