import mongoose from "mongoose";

const SectionSchema = new mongoose.Schema({
    section_name: { 
        type: String, 
        required: true 
    },
    classIncharge: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff', 
    },
    mentors: [
        { 
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Staff' 
        }
    ],
    Batch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Batch",
        required: true,
      },
});

const Section =  mongoose.model('Section', SectionSchema);

export default Section;
