import { NextFunction, Request, Response } from "express";
import { CustomError } from "@/types/errors";


export function errorHandler(
    err: CustomError,
    req: Request,
    res: Response,
    next: NextFunction
) {
    // Duplicate key (e.g., unique index violation)
    if ('code' in err && err.code === 11000) {
        return res.status(400).json({
            msg: 'Duplicate entry',
            fields: (err as any).keyValue || {},
        });
    }


    if (err.name === 'ValidationError') {
        return res.status(400).json({
            msg: err.message,
            errors: (err as any).details,
        });
    }

    if (err.name === 'AuthError' || err.name === 'ForbiddenError') {
        return res.status((err as any).status || 403).json({ msg: err.message });
    }

    return res.status((err as any).status || 500).json({
        msg: err.message || 'Internal Server Error',
    });

}
