import AppError from "@/utils/errors/AppError";

export interface MongoDuplicateKeyError extends Error {
    code?: number;
    keyValue?: Record<string, any>;
}

export interface ValidationError extends Error {
    details?: any;
}

export type CustomError = AppError | MongoDuplicateKeyError | ValidationError;
