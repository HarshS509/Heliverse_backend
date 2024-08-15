import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { teacherOnly } from "../middlewares/role.middleware.js";
import {
  createTimetableHandler,
  deleteStudentHandler,
  getMyClassroomHandler,
  getMyStudentsHandler,
  getTeacherTimetableHandler,
  updateTimetableHandler,
  deleteTimetableHandler,
} from "../controllers/teacher.controller.js";
import {
  getStudentById,
  updateStudentHandler,
} from "../controllers/principal.controller.js";
const router = Router();

router
  .route("/my-classroom")
  .get(authMiddleware, teacherOnly, getMyClassroomHandler);

router
  .route("/my-students")
  .get(authMiddleware, teacherOnly, getMyStudentsHandler);

router
  .route("/students/:id")
  .get(authMiddleware, teacherOnly, getStudentById)
  .put(authMiddleware, teacherOnly, updateStudentHandler);
router
  .route("/timetable")
  .post(authMiddleware, teacherOnly, createTimetableHandler)
  .put(authMiddleware, teacherOnly, updateTimetableHandler);
router
  .route("/timetable/:id")
  .get(authMiddleware, teacherOnly, getTeacherTimetableHandler)
  .delete(authMiddleware, teacherOnly, deleteTimetableHandler);

router
  .route("/delete-student/:id")
  .delete(authMiddleware, teacherOnly, deleteStudentHandler);
export default router;
