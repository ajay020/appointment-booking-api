import AppError from "./AppError.js";

export default class AuthError extends AppError {
    constructor(message = 'Authentication failed') {
        super(message, 401); // 401 Unauthorized
        this.name = 'AuthError';
    }
}