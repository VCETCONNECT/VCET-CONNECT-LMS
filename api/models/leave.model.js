import { Schema, model } from "mongoose";

const leaveRequestSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    parent_phone: {
      type: String,
    },
    email: {
      type: String,
    },
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: "userType",
    },
    userType: {
      type: String,
      required: true,
      enum: ["Student", "Staff"],
    },
    sectionId: {
      type: Schema.Types.ObjectId,
      ref: "Section",
    },
    rollNo: {
      type: String,
    },
    regNo: {
      type: String,
    },
    mentorId: {
      type: Schema.Types.ObjectId,
      ref: "Staff",
    },
    classInchargeId: {
      type: Schema.Types.ObjectId,
      ref: "Staff",
    },
    isHalfDay: {
      type: String,
      enum: ["FN", "AN"],
      default: null,
    },
    fromDate: {
      type: Date,
      required: true,
    },
    toDate: {
      type: Date,
    },
    noOfDays: {
      type: Number,
      required: true,
    },
    forMedical: {
      type: Boolean,
      default: false,
    },
    reason: {
      type: String,
      required: true,
    },
    typeOfLeave: {
      type: String,
      enum: [
        "Casual Leave",
        "Sick Leave",
        "Earned Leave",
        "Maternity Leave",
        "Paternity Leave",
        "Study Leave",
        "Duty Leave",
        "Special Leave",
        "Sabbatical Leave",
      ],
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    approvals: {
      mentor: {
        status: {
          type: String,
          enum: ["pending", "approved", "rejected"],
          default: "pending",
        },
        date: Date,
      },
      classIncharge: {
        status: {
          type: String,
          enum: ["pending", "approved", "rejected"],
          default: "pending",
        },
        date: Date,
      },
      // hod: {
      //   status: {
      //     type: String,
      //     enum: ["pending", "approved", "rejected"],
      //     default: "pending",
      //   },
      //   date: Date,
      // },
    },
    isStaff: {
      type: Boolean,
      required: true,
    },
    mentorcomment: {
      type: String,
      default: "No Comments",
    },
    classInchargeComment: {
      type: String,
      default: "No Comments",
    },
    hodComment: {
      type: String,
      default: "No Comments",
    },
  },
  {
    timestamps: true,
  }
);

leaveRequestSchema.pre("save", function (next) {
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
leaveRequestSchema.methods.computeStatus = function () {
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
leaveRequestSchema.pre("save", function (next) {
  this.status = this.computeStatus();
  next();
});

const LeaveRequest = model("LeaveRequest", leaveRequestSchema);

export default LeaveRequest;

