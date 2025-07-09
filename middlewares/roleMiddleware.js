import ForbiddenError from "../utils/ForbiddenError.js";

function isAdmin(req, res, next) {

    if (req.user?.role !== 'admin') {
        throw new ForbiddenError('Access denied: Admins only');
    }

    next();
}

export default isAdmin;