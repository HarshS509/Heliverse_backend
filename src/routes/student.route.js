import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { studentOnly } from "../middlewares/role.middleware.js";
import {
  getMyClassInfoHandler,
  getMyTimetableHandler,
} from "../controllers/student.controller.js";

const router = Router();

router
  .route("/my-class-info")
  .get(authMiddleware, studentOnly, getMyClassInfoHandler);
router
  .route("/my-timetable")
  .get(authMiddleware, studentOnly, getMyTimetableHandler);

export default router;
