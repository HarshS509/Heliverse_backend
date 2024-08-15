import { Schema, model } from "mongoose";

const timetableSchema = new Schema(
  {
    schedule: [
      {
        day: {
          type: String,
          enum: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
          ],
          required: true,
        },
        periods: [
          {
            subject: { type: String, required: true },
            startTime: { type: String, required: true }, // Store as HH:MM format
            endTime: { type: String, required: true }, // Store as HH:MM format
          },
        ],
      },
    ],
  },
  {
    timestamps: true,
  }
);
const Timetable = model("Timetable", timetableSchema);
export default Timetable;
