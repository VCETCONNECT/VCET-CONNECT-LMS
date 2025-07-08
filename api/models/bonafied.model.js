import { Schema, model } from "mongoose";

const bonafiedRequestSchema = new Schema(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Student",
    },
    studentName: {
      type: String,
      required: true,
    },
    batchId: {
      type: Schema.Types.ObjectId,
      ref: "Batch",
    },
    rollNo: {
      type: String,
      required: true,
    },
    class: {
      type: String,
      required: true,
    },
    admittedQuota: {
      type: String,
      required: true,
      enum: ["Government", "Management"],
    },
    stayType: {
      type: String,
      required: true,
      enum: ["Day", "Hostel"],
    },
    feesPaid: {
      type: Boolean,
      required: true,
    },
    attachments: {
      type: String,
    },
    sectionId: {
      type: Schema.Types.ObjectId,
      ref: "Section",
    },
    mentorId: {
      type: Schema.Types.ObjectId,
      ref: "Staff",
    },
    classInchargeId: {
      type: Schema.Types.ObjectId,
      ref: "Staff",
    },
    reason: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved"],
      default: "pending",
    },
    approvals: {
      mentor: {
        status: {
          type: String,
          enum: ["pending", "approved"],
          default: "pending",
        },
        date: Date,
      },
      classIncharge: {
        status: {
          type: String,
          enum: ["pending", "approved"],
          default: "pending",
        },
        date: Date,
      },
    },
  },
  {
    timestamps: true,
  }
);

bonafiedRequestSchema.pre("save", function (next) {
  if (this.isModified("approvals")) {
    if (
      this.approvals.mentor.status === "rejected" ||
      this.approvals.classIncharge.status === "rejected"
      // || this.approvals.hod.status === "rejected"
    ) {
      this.status = "rejected";
    } else if (
      this.approvals.mentor.status === "approved" &&
      this.approvals.classIncharge.status === "approved"
      // && this.approvals.hod.status === "approved"
    ) {
      this.status = "approved";
    } else {
      this.status = "pending";
    }
  }
  next();
});

// Method to compute overall leave request status based on approvals
bonafiedRequestSchema.methods.computeStatus = function () {
  if (
    this.approvals.mentor.status === "rejected" ||
    this.approvals.classIncharge.status === "rejected"
    // || this.approvals.hod.status === "rejected"
  ) {
    return "rejected";
  } else if (
    this.approvals.mentor.status === "approved" &&
    this.approvals.classIncharge.status === "approved"
    // && this.approvals.hod.status === "approved"
  ) {
    return "approved";
  } else {
    return "pending";
  }
};

// Pre-save hook to update status based on approvals
bonafiedRequestSchema.pre("save", function (next) {
  this.status = this.computeStatus();
  next();
});

const BonafiedRequest = model("BonafiedRequest", bonafiedRequestSchema);

export default BonafiedRequest;
