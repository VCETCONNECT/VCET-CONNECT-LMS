import mongoose from "mongoose";

const defaulterSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    roll_no: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    parent_phone: {
      type: String,
    },
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
    },
    departmentName: {
      type: String,
    },
    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
    },
    batchName: {
      type: String,
    },
    sectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Section",
    },
    sectionName: {
      type: String,
    },
    entryDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    timeIn: {
      type: String,
      required: false,
    },
    observation: {
      type: String,
      required: false,
    },
    mentorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
      required: true,
    },
    classInchargeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
      required: true,
    },
    defaulterType: {
      type: String,
      required: true,
    },
    remarks: {
      type: String,
    },
    isDone: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Defaulter = mongoose.model("Defaulter", defaulterSchema);

export default Defaulter;
