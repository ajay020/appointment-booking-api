import ForbiddenError from "../utils/ForbiddenError.js";

function isAdmin(req, res, next) {
    // if (req.user?.role !== 'admin') {
    //     return res.status(403).json({ msg: 'Access denied: Admins only' });
    // }

    if (user.role !== 'admin') {
        throw new ForbiddenError('Admins only');
    }

    next();
}

export default isAdmin;