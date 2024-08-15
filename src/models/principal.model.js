// import { Schema, model, models } from "mongoose";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import crypto from "crypto";
import JWT from "jsonwebtoken";
import {
  ACCESS_TOKEN_EXPIRES_IN,
  JWT_SECRET,
  REFRESH_TOKEN_EXPIRES_IN,
} from "../constants.js";
const { Schema, model, models } = mongoose;
const principalSchema = new Schema(
  {
    email: {
      type: String,
      unique: true,
      required: [true, "Email is required"],
      trim: true,
      match: [
        /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/,
        "Please Enter a valid email address",
      ],
    },
    role: {
      type: String,
      enum: ["Student", "Teacher", "Principal"],
      default: "Principal",
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minLength: [5, "Password must be at least 8 character "],

      select: false,
    },
    refreshToken: String,
    forgotPasswordToken: String,
    forgotPasswordExpiry: Date,
    // Any other fields relevant to the Principal
  },
  {
    timestamps: true,
  }
);

principalSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  try {
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (error) {
    next(error);
  }
});
principalSchema.pre("save", async function (next) {
  if (this.isNew) {
    const count = await models.Principal.countDocuments();
    if (count > 0) {
      const error = new Error("Only one principal can be created.");
      return next(error);
    }
  }
  next();
});
principalSchema.methods = {
  isPasswordCorrect: async function (password) {
    return await bcrypt.compare(password, this.password);
  },
  generateAccessToken: async function () {
    return JWT.sign(
      {
        _id: this._id,

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

const Principal = model("Principal", principalSchema);
export default Principal;
