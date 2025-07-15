import ForbiddenError from "@/utils/errors/ForbiddenError";
import { NextFunction, Request, Response } from "express";

function isAdmin(req: Request, res: Response, next: NextFunction) {

    if (req.user?.role !== 'admin') {
        throw new ForbiddenError('Access denied: Admins only');
    }

    next();
}

export default isAdmin;