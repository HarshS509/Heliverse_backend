import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { teacherOnly } from "../middlewares/role.middleware.js";
import {
  createTimetableHandler,
  getMyClassroomHandler,
  getMyStudentsHandler,
  updateTimetableHandler,
} from "../controllers/teacher.controller.js";
const router = Router();

router
  .route("/my-classroom")
  .get(authMiddleware, teacherOnly, getMyClassroomHandler);

router
  .route("/my-students")
  .get(authMiddleware, teacherOnly, getMyStudentsHandler);
router
  .route("/timetable")
  .post(authMiddleware, teacherOnly, createTimetableHandler);
router
  .route("/timetable/:id")
  .put(authMiddleware, teacherOnly, updateTimetableHandler);

export default router;
