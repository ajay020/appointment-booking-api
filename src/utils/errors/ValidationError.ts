import AppError from "@/utils/errors/AppError";

export default class ValidationError extends AppError {
    details: any;

    constructor(errors: any) {
        super('Validation failed', 400);
        this.details = errors;
    }
}