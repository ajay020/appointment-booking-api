import { query } from 'express-validator';
import moment from 'moment';

export const adminBookingFiltersValidation = () => [
    query('from')
        .optional()
        .isISO8601()
        .withMessage('From date must be in YYYY-MM-DD format')
        .custom((value) => moment(value).isValid())
        .withMessage('Invalid from date'),

    query('to')
        .optional()
        .isISO8601()
        .withMessage('To date must be in YYYY-MM-DD format')
        .custom((value) => moment(value).isValid())
        .withMessage('Invalid to date')
];
