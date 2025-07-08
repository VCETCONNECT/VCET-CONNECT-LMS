import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
  course_code: {
    type: String,
    required: true,
  },
  course_name: {
    type: String,
    required: true,
  },
  course_credits: {
    type: Number,
    required: true,
  },
  semester: {
    type: Number,
    required: false,
  },
  vertical_type: {
    type: String,
    enum: ["PE", "OE", "M", "O"],
    required: false,
  },
});

const semesterCoursesSchema = new mongoose.Schema({
  semester_no: {
    type: Number,
    required: true,
  },
  courses: [courseSchema],
});

const OpenCoursesSchema = new mongoose.Schema({
  semester_no: {
    type: Number,
    required: true,
  },
  courses: [courseSchema],
});

const verticalGroupSchema = new mongoose.Schema({
  vertical_name: {
    type: String,
    required: true,
  },
  vertical_type: {
    type: String,
    enum: ["PE", "OE", "M", "O"],
    required: true,
  },
  courses: [courseSchema],
});

const cgpaSchema = new mongoose.Schema(
  {
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    batch_year: {
      type: String,
      required: true,
    },
    regular_courses: [semesterCoursesSchema],
    verticals: [verticalGroupSchema],
    open_courses: [OpenCoursesSchema],
  },
  {
    timestamps: true,
  }
);

cgpaSchema.index({ departmentId: 1, batch_year: 1 });

const CGPA = mongoose.model("CGPA", cgpaSchema);

export default CGPA;

/*
Example JSON structure for CSE department with 2 semesters and electives:

{
  "department": "ObjectId('department_id_here')",
  "batch_year": "2023-27",
  "regular_courses": [
    {
      "semester_no": 1,
      "courses": [
        {
          "course_code": "CS101",
          "course_name": "Programming Fundamentals",
          "course_credits": 4,
          "semester": 1
        },
        {
          "course_code": "MA101",
          "course_name": "Engineering Mathematics",
          "course_credits": 4,
          "semester": 1
        },
        {
          "course_code": "PH101",
          "course_name": "Engineering Physics",
          "course_credits": 3,
          "semester": 1
        }
      ]
    },
    {
      "semester_no": 2,
      "courses": [
        {
          "course_code": "CS201",
          "course_name": "Data Structures",
          "course_credits": 4,
          "semester": 2
        },
        {
          "course_code": "MA201",
          "course_name": "Discrete Mathematics",
          "course_credits": 4,
          "semester": 2
        },
        {
          "course_code": "EC201",
          "course_name": "Digital Electronics",
          "course_credits": 3,
          "semester": 2
        }
      ]
    }
  ],
  "verticals": [
    {
      "vertical_name": "Professional Elective 1",
      "vertical_type": "professional_elective",
      "semester_no": 2,
      "courses": [
        {
          "course_code": "PE201",
          "course_name": "Advanced Web Development",
          "course_credits": 3,
          "semester": 2
        },
        {
          "course_code": "PE202",
          "course_name": "Mobile App Development",
          "course_credits": 3,
          "semester": 2
        },
        {
          "course_code": "PE203",
          "course_name": "Cloud Computing",
          "course_credits": 3,
          "semester": 2
        }
      ]
    },
    {
      "vertical_name": "Open Elective 1",
      "vertical_type": "open_elective",
      "semester_no": 2,
      "courses": [
        {
          "course_code": "OE201",
          "course_name": "Business Analytics",
          "course_credits": 3,
          "semester": 2
        },
        {
          "course_code": "OE202",
          "course_name": "Digital Marketing",
          "course_credits": 3,
          "semester": 2
        }
      ]
    }
  ]
}
*/
