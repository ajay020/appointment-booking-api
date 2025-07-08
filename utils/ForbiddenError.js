import AppError from './AppError.js';

export default class ForbiddenError extends AppError {
    constructor(message = 'You are not allowed to perform this action') {
        super(message, 403); // 403 Forbidden
        this.name = 'ForbiddenError';
    }
}