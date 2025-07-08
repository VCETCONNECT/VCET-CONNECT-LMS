import mongoose from "mongoose";

const DepartmentSchema = new mongoose.Schema({
  dept_name: {
    type: String,
    required: true,
    unique: true,
  },
  dept_acronym: {
    type: String,
    required: true,
    unique: true,
  },
  dept_head: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "DeptHead",
    // required: true,
  },
  batches: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
    },
  ],
});

const Department =  mongoose.model("Department", DepartmentSchema);
export default Department;
