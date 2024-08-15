import { Router } from "express";

import {
  loginHandler,
  logoutHandler,
  registerPrincipalHandler,
} from "../controllers/auth.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register/principal").post(registerPrincipalHandler);
// router.route("/register/student").post(registerStudentHandler);
// router.route("register/teacher").post(registerTeacherHandler);
router.route("/login").post(loginHandler);

router.route("/logout").post(authMiddleware, logoutHandler);
export default router;
