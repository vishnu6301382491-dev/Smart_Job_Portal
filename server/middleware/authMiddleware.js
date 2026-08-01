import jwt from "jsonwebtoken";
import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log(`[AUTH_CHECK_FAIL] Token missing on ${req.method} ${req.originalUrl}`);
    throw new ApiError(401, "Not authorized, token missing");
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user || !user.isActive) {
      console.log(`[AUTH_CHECK_FAIL] User not found or inactive: ${decoded.id}`);
      throw new ApiError(401, "Your session has expired. Please login again.");
    }

    req.user = user;
    next();
  } catch (error) {
    console.log(`[JWT_VALIDATION_ERROR] Error: ${error.message} on ${req.originalUrl}`);
    throw new ApiError(401, "Your session has expired. Please login again.");
  }
});

const optionalProtect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    next();
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (user && user.isActive) {
      req.user = user;
    }

    next();
  } catch (error) {
    next();
  }
});

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      console.log(`[AUTH_ROLE_DENIED] User: ${req.user?.email} (${req.user?.role}) requested ${req.originalUrl}`);
      return next(new ApiError(403, "You don't have permission to access this resource."));
    }

    next();
  };
};

export { protect, optionalProtect, authorizeRoles };
