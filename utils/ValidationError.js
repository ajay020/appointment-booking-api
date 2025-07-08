import AppError from "./AppError.js";

export default class ValidationError extends AppError {
    constructor(errors) {
        super('Validation failed', 400);
        this.details = errors;
    }
}