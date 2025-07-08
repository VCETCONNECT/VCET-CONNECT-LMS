import mongoose from "mongoose";
const studentSchema = new mongoose.Schema(
  {
    roll_no: {
      type: String,
      required: true,
      unique: true,
    },
    register_no: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      required: true,
    },
    parent_phone: {
      type: String,
    },
    mentorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
    },
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    sectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Section",
      required: true,
    },
    section_name: {
      type: String,
      required: true,
    },
    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      required: true,
    },
    userType: {
      type: String,
      default: "Student",
    },
    status: {
      type: String,
      enum: ["pending", "active"],
      default: "pending",
    },
    portfolio_url: {
      type: String,
    },
    resume_url: {
      type: String,
    },
    linkedin_url: {
      type: String,
    },
    github_url: {
      type: String,
    },
    hackerrank_url: {
      type: String,
    },
    leetcode_url: {
      type: String,
    },
    semester_results: {
      type: Object,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

const Student = mongoose.model("Student", studentSchema);

export default Student;
