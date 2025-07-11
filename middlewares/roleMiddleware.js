import ForbiddenError from "../utils/ForbiddenError.js";

function isAdmin(req, res, next) {

    console.log('Checking if user is admin...', req.user);

    if (req.user?.role !== 'admin') {
        throw new ForbiddenError('Access denied: Admins only');
    }

    next();
}

export default isAdmin;