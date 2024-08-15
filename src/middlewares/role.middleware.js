import { ApiError } from "../utils/ApiError.js";

export const principalOnly = (req, res, next) => {
  console.log(req.user);
  if (req.user.role !== "Principal") {
    return next(new ApiError(400, "Access denied. Principals only."));
  }
  next();
};
export const teacherOnly = (req, res, next) => {
  console.log(req.user, "in teacher only");
  if (req.user.role !== "Teacher") {
    return next(new ApiError(400, "Access denied. Teacher only."));
  }
  next();
};

export const studentOnly = (req, res, next) => {
  if (req.user.role !== "Student") {
    return next(new ApiError(400, "Access denied. Student only."));
  }
  next();
};
