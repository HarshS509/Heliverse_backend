import { Schema, model } from "mongoose";

const classroomSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    students: [{ type: Schema.Types.ObjectId, ref: "Student" }],
    teacher: { type: Schema.Types.ObjectId, ref: "Teacher" },
    weekdayTimings: {
      startTime: { type: String, required: true },
      endTime: { type: String, required: true },
    },
    saturdayTimings: {
      startTime: { type: String, required: true },
      endTime: { type: String, required: true },
    },
    timetable: { type: Schema.Types.ObjectId, ref: "Timetable" },
  },
  {
    timestamps: true,
  }
);

const Classroom = model("Classroom", classroomSchema);
export default Classroom;
