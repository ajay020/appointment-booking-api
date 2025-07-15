export default class AppError extends Error {
    status: number;

    constructor(message: string, status = 500) {
        super(message);
        this.status = status;
        this.name = new.target.name; // Optional but nice
        Error.captureStackTrace(this, this.constructor);
    }
}
