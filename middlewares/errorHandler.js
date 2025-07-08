import ValidationError from "../utils/ValidationError.js";

export function errorHandler(err, req, res, next) {
    console.error('[ERROR]', err.stack || err.message);

    // Duplicate key (e.g., unique index violation)
    if (err.code === 11000) {
        return res.status(400).json({
            msg: 'Duplicate entry',
            fields: err.keyValue || {}
        });
    }

    if (err instanceof ValidationError) {
        return res.status(400).json({
            msg: err.message,
            errors: err.details
        });
    }

    if (err.name === 'AuthError' || err.name === 'ForbiddenError') {
        return res.status(err.status).json({ msg: err.message });
    }

    res.status(err.status || 500).json({
        msg: err.message || 'Internal Server Error',
    });
}
