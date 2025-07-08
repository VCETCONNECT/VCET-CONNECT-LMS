import mongoose from "mongoose";

const BatchSchema = new mongoose.Schema({
  batch_name: {
    type: String,
    required: true,
  },
  sections: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Section",
    },
  ],
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
    required: true,
  },
});

const Batch = mongoose.model("Batch", BatchSchema);
export default Batch;
