import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { principalOnly } from "../middlewares/role.middleware.js";
import {
  assignStudentToTeacherHandler,
  assignTeacherToClassroomHandler,
  createClassroomHandler,
  deleteClassroomHandler,
  deleteStudentHandler,
  deleteTeacherHandler,
  getClassroomByIdHandler,
  getClassroomsHandler,
  getStudentById,
  getStudentsHandler,
  getTeacherById,
  getTeachersHandler,
  registerStudentHandler,
  registerTeacherHandler,
  updateClassroomHandler,
  updateStudentHandler,
  updateTeacherHandler,
} from "../controllers/principal.controller.js";

const router = Router();

router
  .route("/classrooms")
  .get(authMiddleware, principalOnly, getClassroomsHandler)
  .post(authMiddleware, principalOnly, createClassroomHandler);

router
  .route("/classrooms/:id")
  .get(authMiddleware, principalOnly, getClassroomByIdHandler)
  .put(authMiddleware, principalOnly, updateClassroomHandler)
  .delete(authMiddleware, principalOnly, deleteClassroomHandler);

router
  .route("/teachers")
  .get(authMiddleware, principalOnly, getTeachersHandler)
  .post(authMiddleware, principalOnly, registerTeacherHandler);

router
  .route("/teachers/:id")
  .get(authMiddleware, principalOnly, getTeacherById)
  .put(authMiddleware, principalOnly, updateTeacherHandler)
  .delete(authMiddleware, principalOnly, deleteTeacherHandler);

router
  .route("/students")
  .get(authMiddleware, principalOnly, getStudentsHandler)
  .post(authMiddleware, principalOnly, registerStudentHandler);

router
  .route("/students/:id")
  .put(authMiddleware, principalOnly, updateStudentHandler)
  .delete(authMiddleware, principalOnly, deleteStudentHandler);

router
  .route("/assign-teacher")
  .post(authMiddleware, principalOnly, assignTeacherToClassroomHandler);

router
  .route("/assign-student")
  .post(authMiddleware, principalOnly, assignStudentToTeacherHandler);

export default router;
