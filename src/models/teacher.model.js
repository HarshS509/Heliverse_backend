import { Schema, model } from "mongoose";
import bcrypt from "bcrypt";
import crypto from "crypto";
import JWT from "jsonwebtoken";

import {
  ACCESS_TOKEN_EXPIRES_IN,
  JWT_SECRET,
  REFRESH_TOKEN_EXPIRES_IN,
} from "../constants.js";
const TeacherSchema = new Schema(
  {
    email: {
      type: String,
      unique: true,
      required: [true, "Email is required"],
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please Enter a valid email address",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minLength: [8, "Password must be at least 8 character "],
      match: [
        /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/,
        "Password must be contains at least one uppercase and one lowercase and one digit and one special character",
      ],
      select: false,
    },
    role: {
      type: String,
      enum: ["Student", "Teacher", "Principal"],
      default: "Teacher",
    },
    firstName: {
      type: String,
      required: [true, "First Name is required"],
      trim: true,
      maxLength: [50, "First Name should not exceed 50 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Last Name is required"],
      trim: true,
      maxLength: [50, "Last Name should not exceed 50 characters"],
    },
    classroom: {
      type: Schema.Types.ObjectId,
      ref: "Classroom",
    },
    students: [
      {
        type: Schema.Types.ObjectId,
        ref: "Student",
      },
    ],
    refreshToken: String,
    forgotPasswordToken: String,
    forgotPasswordExpiry: Date,
  },
  {
    timestamps: true,
  }
);

TeacherSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});

TeacherSchema.methods = {
  isPasswordCorrect: async function (password) {
    return await bcrypt.compare(password, this.password);
  },
  generateAccessToken: async function () {
    return JWT.sign(
      {
        _id: this._id,
        username: this.userName,
        email: this.email,
        role: this.role,
      },
      JWT_SECRET,
      {
        expiresIn: ACCESS_TOKEN_EXPIRES_IN,
      }
    );
  },
  generateRefreshToken: async function () {
    return JWT.sign(
      {
        _id: this._id,
        username: this.userName,
        email: this.email,
        role: this.role,
      },
      JWT_SECRET,
      {
        expiresIn: REFRESH_TOKEN_EXPIRES_IN,
      }
    );
  },
  generateResetToken: async function () {
    const resetToken = crypto.randomBytes(20).toString("hex");
    this.forgotPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    this.forgotPasswordExpiry = Date.now() + 15 * 60 * 1000;
    return resetToken;
  },
};

const Teacher = model("Teacher", TeacherSchema);
export default Teacher;
