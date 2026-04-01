import { httpError } from "../utils/httpError.js";

function requireRole(...allowedRoles) {
  return function roleGuard(req, res, next) {
    if (!req.user) {
      return next(httpError(401, "Authentication required"));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(httpError(403, "You do not have permission for this action"));
    }

    return next();
  };
}

export { requireRole };
