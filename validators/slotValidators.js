import { body } from 'express-validator';
import moment from 'moment';

export const createSlotValidationRules = () => [
    body('date')
        .notEmpty().withMessage('Date is required')
        .isISO8601().withMessage('Date must be in YYYY-MM-DD format'),

    body('time')
        .notEmpty().withMessage('Time is required')
        .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .withMessage('Time must be between 00:00 and 23:59 (24:00 is invalid)'),

    body().custom((_, { req }) => {
        const { date, time } = req.body;

        const now = moment();
        const slotDateTime = moment(`${date} ${time}`, 'YYYY-MM-DD HH:mm');

        if (!slotDateTime.isValid()) {
            throw new Error('Invalid date and time combination');
        }

        if (slotDateTime.isBefore(now)) {
            throw new Error('Slot cannot be in the past');
        }

        return true;
    })
];

