import { Schema, model } from "mongoose";

const odRequestSchema = new Schema(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "Student",
    },
    email: {
      type: String,
    },  
    name: {
      type: String,
      required: true,
    },
    parent_phone: {
      type: String,
    },
    rollNo: {
      type: String,
    },
    regNo: {
      type: String,
    },
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    batchId: {
      type: Schema.Types.ObjectId,
      ref: "Batch",
    },
    sectionId: {
      type: Schema.Types.ObjectId,
      ref: "Section",
    },
    section_name: {
      type: String,
    },
    odType: {
      type: String,
      enum: ["Internal", "External"],
      required: true,
    },
    mentorId: {
      type: Schema.Types.ObjectId,
      ref: "Staff",
    },
    classInchargeId: {
      type: Schema.Types.ObjectId,
      ref: "Staff",
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
    reason: {
      type: String,
    },
    city: {
      type: String,
    },
    eventTypes: [
      {
        type: String,
        enum: ["paperPresentation", "projectPresentation", "otherEvent"],
      },
    ],
    eventName: {
      type: String,
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
    collegeName: {
      type: String,
    },
    paperTitle: {
      type: String,
    },
    projectTitle: {
      type: String,
    },
    eventDetails: {
      type: String,
    },
    completionProof: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

odRequestSchema.pre("save", function (next) {
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
odRequestSchema.methods.computeStatus = function () {
  if (
    this.approvals.mentor.status === "rejected" ||
    this.approvals.classIncharge.status === "rejected"
  ) {
    return "rejected";
  }
  if (
    this.approvals.mentor.status === "approved" &&
    this.approvals.classIncharge.status === "approved"
  ) {
    return "approved";
  }
  return "pending";
};

// Pre-save hook to update status based on approvals
odRequestSchema.pre("save", function (next) {
  this.status = this.computeStatus();
  next();
});

const ODRequest = model("ODRequest", odRequestSchema);

export default ODRequest;
