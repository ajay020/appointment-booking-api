import AppError from "@/utils/errors/AppError";

export default class AuthError extends AppError {
    constructor(message = 'Authentication failed') {
        super(message, 401); // 401 Unauthorized
        this.name = 'AuthError';
    }
}