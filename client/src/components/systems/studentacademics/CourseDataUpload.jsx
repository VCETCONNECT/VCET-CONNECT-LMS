import React, { useState, useEffect } from "react";
import { Upload, List } from "lucide-react";
import { Accordion, Button, Tabs, TextInput, Modal } from "flowbite-react";
import { HiAdjustments, HiClipboardList, HiUserCircle } from "react-icons/hi";
import { MdDashboard } from "react-icons/md";
import { ScaleLoader } from "react-spinners";
import * as XLSX from "xlsx";
import axios from "axios";
import { Pencil, Save, X } from "lucide-react";

const customTabTheme = {
  base: "flex flex-col gap-2",
  tablist: {
    base: "flex text-center",
    styles: {
      default: "flex-wrap border-b border-gray-200 dark:border-gray-700",
    },
    tabitem: {
      base: "flex items-center justify-center p-4 rounded-t-lg text-sm font-medium first:ml-0 disabled:cursor-not-allowed disabled:text-gray-400 disabled:dark:text-gray-500 focus:outline-none",
      styles: {
        default: {
          base: "rounded-t-lg",
          active: {
            on: "bg-blue-100 text-[#1f3a6e] dark:bg-gray-700 dark:text-blue-500",
            off: "text-gray-500 hover:bg-gray-50 hover:text-gray-600 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-300",
          },
        },
      },
    },
  },
  tabpanel: "py-3",
};

const CourseDataUpload = ({ departmentId }) => {
  const [activeTab, setActiveTab] = useState("view");
  const [searchQuery, setSearchQuery] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState({
    loading: false,
    error: null,
  });
  const [viewTab, setViewTab] = useState("regular");
  const [editingCourse, setEditingCourse] = useState(null);
  const [courseData, setCourseData] = useState(null);
  const [editModal, setEditModal] = useState({
    isOpen: false,
    course: null,
    type: "regular",
  });
  const [newCourseModal, setNewCourseModal] = useState({
    isOpen: false,
    type: "open",
  });
  const [newCourse, setNewCourse] = useState({
    course_code: "",
    course_name: "",
    course_credits: "",
    semester: "",
    vertical_type: "OE",
  });

  // Dummy data for demonstration
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const fetchCourseData = async () => {
    try {
      const response = await fetch(
        `/api/cgpa/getCourseDataForDepartment?departmentId=${departmentId}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch course data");
      }

      const data = await response.json();
      if (data.success) {
        setCourseData(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (departmentId && activeTab === "view") {
      fetchCourseData();
    }
  }, [departmentId, activeTab]);

  const handleEditSave = async (course) => {
    try {
      const response = await fetch("/api/cgpa/editCourseDataUsingCourseId", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          course_code: editingCourse.course_code,
          course_name: editingCourse.course_name,
          course_credits: editingCourse.course_credits,
          semester: editingCourse.semester,
          vertical_type: editingCourse.vertical_type,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update course");
      }

      const result = await response.json();
      if (result.success) {
        await fetchCourseData(); // Refresh data
        setEditModal({ isOpen: false, course: null, type: "regular" });
        setEditingCourse(null);
      } else {
        throw new Error(result.message || "Failed to update course");
      }
    } catch (error) {
      console.error("Error updating course:", error);
      // Handle error (show error message to user)
    }
  };

  const EditCourseModal = () => (
    <Modal
      show={editModal.isOpen}
      onClose={() => setEditModal({ isOpen: false, course: null })}
      size="md"
    >
      <Modal.Header>Edit Course Details</Modal.Header>
      <Modal.Body>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Course Code
            </label>
            <TextInput
              value={editingCourse?.course_code || ""}
              onChange={(e) =>
                setEditingCourse({
                  ...editingCourse,
                  course_code: e.target.value,
                })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Course Name
            </label>
            <TextInput
              value={editingCourse?.course_name || ""}
              onChange={(e) =>
                setEditingCourse({
                  ...editingCourse,
                  course_name: e.target.value,
                })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Credits
            </label>
            <TextInput
              type="number"
              value={editingCourse?.course_credits || ""}
              onChange={(e) =>
                setEditingCourse({
                  ...editingCourse,
                  course_credits: parseInt(e.target.value),
                })
              }
            />
          </div>
          {editModal.type === "vertical" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Course Type
                </label>
                <select
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                  value={editingCourse?.vertical_type || ""}
                  onChange={(e) =>
                    setEditingCourse({
                      ...editingCourse,
                      vertical_type: e.target.value,
                    })
                  }
                >
                  <option value="">Select Type</option>
                  <option value="PE">Professional Elective</option>
                  <option value="OE">Open Elective</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Semester
                </label>
                <select
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                  value={editingCourse?.semester || ""}
                  onChange={(e) =>
                    setEditingCourse({
                      ...editingCourse,
                      semester: parseInt(e.target.value),
                    })
                  }
                >
                  <option value="">Select Semester</option>
                  {[...Array(8)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      Semester {i + 1}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <div className="flex justify-end gap-2">
          <Button
            color="gray"
            onClick={() => setEditModal({ isOpen: false, course: null })}
          >
            Cancel
          </Button>
          <Button
            color="success"
            onClick={() => {
              handleEditSave(editingCourse);
              setEditModal({ isOpen: false, course: null });
            }}
          >
            Save Changes
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );

  const CourseTable = ({ courses, type }) => (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left text-gray-500">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0">
          <tr>
            <th scope="col" className="px-6 py-3">
              Course Code
            </th>
            <th scope="col" className="px-6 py-3">
              Course Name
            </th>
            <th scope="col" className="px-6 py-3">
              Credits
            </th>
            {type === "vertical" && (
              <th scope="col" className="px-6 py-3">
                Type
              </th>
            )}
            <th scope="col" className="px-6 py-3">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {courses?.map((course, idx) => (
            <tr key={idx} className="bg-white hover:bg-gray-50">
              <td className="px-6 py-4 font-medium text-gray-900">
                {course.course_code}
              </td>
              <td className="px-6 py-4">{course.course_name}</td>
              <td className="px-6 py-4">{course.course_credits}</td>
              {type === "vertical" && (
                <td className="px-6 py-4">
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                    {course.vertical_type}
                  </span>
                </td>
              )}
              <td className="px-6 py-4">
                <Button
                  size="sm"
                  color="gray"
                  onClick={() => {
                    setEditingCourse(course);
                    setEditModal({
                      isOpen: true,
                      course: course,
                      type: type,
                    });
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const ViewCoursesTab = () => (
    <div className="space-y-4 min-h-[600px]">
      <div className="flex justify-between  items-center mb-4">
        <h3 className="text-lg font-semibold">Course List</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search courses..."
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <Button color="gray">Search</Button>
        </div>
      </div>
      <div className="overflow-y-auto">
        <Tabs theme={customTabTheme}>
          <Tabs.Item
            active={viewTab === "regular"}
            title="Regular Courses"
            className="mb-10"
          >
            {courseData?.regular_courses ? (
              <div className="max-h-[600px] overflow-y-auto">
                <Accordion alwaysOpen={false}>
                  {courseData.regular_courses
                    .sort((a, b) => a.semester_no - b.semester_no)
                    .map((semester, idx) => (
                      <Accordion.Panel key={idx}>
                        <Accordion.Title className="hover:bg-gray-50 focus:ring-0">
                          <div className="flex items-center">
                            <span className="text-lg font-medium">
                              Semester {semester.semester_no}
                            </span>
                            <span className="ml-4 text-sm text-gray-500">
                              ({semester.courses.length} courses)
                            </span>
                          </div>
                        </Accordion.Title>
                        <Accordion.Content>
                          <CourseTable
                            courses={semester.courses}
                            type="regular"
                          />
                        </Accordion.Content>
                      </Accordion.Panel>
                    ))}
                </Accordion>
              </div>
            ) : (
              <div className="text-center py-4">No regular courses found</div>
            )}
          </Tabs.Item>

          <Tabs.Item active={viewTab === "vertical"} title="Vertical Courses">
            {courseData?.verticals ? (
              <div className="max-h-[600px] overflow-y-auto">
                <Accordion alwaysOpen={false}>
                  {courseData.verticals.map((vertical, idx) => (
                    <Accordion.Panel key={idx}>
                      <Accordion.Title className="hover:bg-gray-50 focus:ring-0">
                        <div className="flex items-center">
                          <span className="text-lg font-medium">
                            {vertical.vertical_name}
                          </span>
                          <span className="ml-2 px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                            {vertical.vertical_type}
                          </span>
                          <span className="ml-4 text-sm text-gray-500">
                            ({vertical.courses.length} courses)
                          </span>
                        </div>
                      </Accordion.Title>
                      <Accordion.Content>
                        <CourseTable
                          courses={vertical.courses}
                          type="vertical"
                        />
                      </Accordion.Content>
                    </Accordion.Panel>
                  ))}
                </Accordion>
              </div>
            ) : (
              <div className="text-center py-4">No vertical courses found</div>
            )}
          </Tabs.Item>
          <Tabs.Item
            active={viewTab === "openelectives"}
            title="Open elective Courses"
          >
            <div>
              <div className="flex justify-end mb-4">
                <Button
                  gradientDuoTone="purpleToBlue"
                  onClick={() =>
                    setNewCourseModal({ isOpen: true, type: "open" })
                  }
                >
                  Add New Course
                </Button>
              </div>
              <Tabs.Item
                active={viewTab === "openelectives"}
                title="Open elective Courses"
              >
                {courseData?.open_courses ? (
                  <div className="max-h-[600px] overflow-y-auto">
                    <Accordion alwaysOpen={false}>
                      {courseData.open_courses.map((vertical, idx) => (
                        <Accordion.Panel key={idx}>
                          <Accordion.Content>
                            <CourseTable
                              courses={vertical.courses}
                              type="open"
                            />
                          </Accordion.Content>
                        </Accordion.Panel>
                      ))}
                    </Accordion>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    No open elective courses found
                  </div>
                )}
              </Tabs.Item>
            </div>
          </Tabs.Item>
        </Tabs>
      </div>
    </div>
  );

  const downloadTemplate = () => {
    // Template data structure
    const regularCoursesSheet = [
      ["Course Code", "Course Name", "Credits", "Semester", "Type"],
      // Example rows
      ["CS101", "Programming Fundamentals", 4, 1, "Core"],
      ["MA101", "Engineering Mathematics", 4, 1, "Core"],
      ["", "", "", "", ""], // Empty rows for filling
    ];

    const electiveCoursesSheet = [
      ["Course Code", "Course Name", "Credits", "Type", "Vertical Name"],
      // Example rows
      [
        "PE501",
        "Machine Learning",
        3,
        "Professional Elective",
        "Professional Elective 1",
      ],
      [
        "PE502",
        "Cloud Computing",
        3,
        "Professional Elective",
        "Professional Elective 1",
      ],
      ["OE501", "Business Analytics", 3, "Open Elective", "Open Elective 1"],
      ["", "", "", "", ""], // Empty rows for filling
    ];

    const instructions = [
      ["Course Upload Template Instructions"],
      [""],
      ["1. Regular Courses Sheet:"],
      ["   - Course Code: Unique identifier for the course (e.g., CS101)"],
      ["   - Course Name: Full name of the course"],
      ["   - Credits: Number of credits (1-4)"],
      ["   - Semester: Semester number (1-8)"],
      ["   - Type: Course type (Core/Elective)"],
      [""],
      ["2. Elective Courses Sheet:"],
      ['   - Additional field "Vertical Name" for grouping electives'],
      ['   - Type can be "Professional" or "Open"'],
      [""],
      ["3. Guidelines:"],
      ["   - Do not modify the header row"],
      ["   - Fill all mandatory fields"],
      ["   - Use proper case for course names"],
      ["   - Verify credit values before upload"],
    ];

    // Create workbook and sheets
    const wb = XLSX.utils.book_new();

    // Add instructions sheet
    const wsInstructions = XLSX.utils.aoa_to_sheet(instructions);
    XLSX.utils.book_append_sheet(wb, wsInstructions, "Instructions");

    // Add regular courses sheet
    const wsRegular = XLSX.utils.aoa_to_sheet(regularCoursesSheet);
    XLSX.utils.book_append_sheet(wb, wsRegular, "Regular Courses");

    // Add elective courses sheet
    const wsElective = XLSX.utils.aoa_to_sheet(electiveCoursesSheet);
    XLSX.utils.book_append_sheet(wb, wsElective, "Elective Courses");

    // Save the file
    XLSX.writeFile(wb, "course_upload_template.xlsx");
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    setUploadStatus({ loading: true, error: null });

    const file = e.dataTransfer.files[0];
    if (
      file &&
      (file.type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        file.type === "application/vnd.ms-excel")
    ) {
      await processFile(file);
    } else {
      setUploadStatus({
        loading: false,
        error: "Please upload only Excel files (.xlsx or .xls)",
      });
    }
  };

  const processFile = async (file) => {
    try {
      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: "array" });

          // Process Regular Courses
          const regularSheet = workbook.Sheets["Regular Courses"];
          const regularCourses = XLSX.utils.sheet_to_json(regularSheet, {
            header: 1,
          });

          // Process Elective Courses
          const electiveSheet = workbook.Sheets["Elective Courses"];
          const electiveCourses = XLSX.utils.sheet_to_json(electiveSheet, {
            header: 1,
          });

          // Format data according to the model
          const formattedData = {
            departmentId: departmentId,
            batch_year: "2022-26",
            regular_courses: processRegularCourses(regularCourses),
            verticals: processElectiveCourses(electiveCourses),
          };

          try {
            const response = await fetch(
              "/api/cgpa/uploadCourseDataForDepartment",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json"  ,
                },
                body: JSON.stringify(formattedData),
              }
            );

            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.success) {
              setUploadStatus({ loading: false, error: null });
              alert("Courses uploaded successfully!");
            } else {
              throw new Error(result.message || "Upload failed");
            }
          } catch (error) {
            console.error("Fetch error:", error);
            setUploadStatus({
              loading: false,
              error: error.message || "Error uploading data",
            });
          }
        } catch (error) {
          console.error("Error in file processing:", error);
          setUploadStatus({
            loading: false,
            error: error.message || "Error processing file",
          });
        }
      };

      reader.onerror = () => {
        setUploadStatus({
          loading: false,
          error: "Error reading file",
        });
      };

      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error("Error in processFile:", error);
      setUploadStatus({
        loading: false,
        error: "Error uploading courses. Please try again.",
      });
    }
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadStatus({ loading: true, error: null });
      await processFile(file);
    }
  };

  const processRegularCourses = (courses) => {
    // Remove header row
    const data = courses.slice(1).filter((row) => row.length > 0 && row[0]);

    // Group by semester
    const semesterGroups = data.reduce((acc, row) => {
      const semester = row[3]; // Semester column
      if (!acc[semester]) {
        acc[semester] = [];
      }
      acc[semester].push({
        course_code: row[0],
        course_name: row[1],
        course_credits: row[2],
        semester: row[3],
      });
      return acc;
    }, {});

    // Format for model
    return Object.entries(semesterGroups).map(([semester_no, courses]) => ({
      semester_no: parseInt(semester_no),
      courses,
    }));
  };

  const processElectiveCourses = (courses) => {
    // Remove header row
    const data = courses.slice(1).filter((row) => row.length > 0 && row[0]);

    // Group by vertical name
    const verticalGroups = data.reduce((acc, row) => {
      const verticalName = row[4]; // Vertical Name column
      if (!acc[verticalName]) {
        acc[verticalName] = {
          courses: [],
          type: row[3], // Type column
        };
      }
      acc[verticalName].courses.push({
        course_code: row[0],
        course_name: row[1],
        course_credits: row[2],
        semester: null, // Set to null for electives
      });
      return acc;
    }, {});

    // Format for model
    return Object.entries(verticalGroups).map(([name, data]) => ({
      vertical_name: name,
      vertical_type: data.type === "Professional Elective" ? "PE" : "OE",
      courses: data.courses,
    }));
  };

  const UploadCoursesTab = () => (
    <div className="space-y-4 min-h-[600px]">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Upload Course Data</h3>
      </div>
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${
            isDragging
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-gray-400"
          }
          ${uploadStatus.error ? "border-red-500" : ""}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {uploadStatus.loading ? (
          <div className="flex flex-col items-center">
            <ScaleLoader color="#1a56db" />
            <p className="mt-2 text-sm text-gray-600">Processing file...</p>
          </div>
        ) : (
          <>
            <Upload
              className={`mx-auto h-12 w-12 ${
                isDragging ? "text-blue-500" : "text-gray-400"
              }`}
            />
            <p className="mt-2 text-sm text-gray-600">
              Drag and drop your course data file here
            </p>
            <div className="mt-4 flex items-center justify-center gap-2 space-x-3">
              <Button className=" relative" gradientDuoTone="purpleToBlue">
                Select File
                <input
                  type="file"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  accept=".xlsx,.xls"
                  onChange={handleFileSelect}
                />
              </Button>
            </div>
            {uploadStatus.error && (
              <p className="mt-2 text-sm text-red-500">{uploadStatus.error}</p>
            )}
            <p className="mt-2 text-xs text-gray-500">
              Please use our template format for uploading course data
            </p>
            <div className="flex items-center mt-4 justify-center gap-2 space-x-3">
              <Button gradientDuoTone="purpleToBlue" onClick={downloadTemplate}>
                Download Template
              </Button>
            </div>
            <div className="mt-4 text-left text-sm text-gray-600">
              <h4 className="font-semibold mb-2">Template Structure:</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>Sheet 1: Instructions for filling the template</li>
                <li>Sheet 2: Regular Courses (Core subjects)</li>
                <li>
                  Sheet 3: Elective Courses (Professional & Open electives)
                </li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );

  const AddNewCourseModal = () => (
    <Modal
      show={newCourseModal.isOpen}
      onClose={() => setNewCourseModal({ isOpen: false, type: "open" })}
      size="md"
    >
      <Modal.Header>Add New Open Elective Course</Modal.Header>
      <Modal.Body>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Course Code*
            </label>
            <TextInput
              value={newCourse.course_code}
              onChange={(e) =>
                setNewCourse({
                  ...newCourse,
                  course_code: e.target.value,
                })
              }
              placeholder="e.g., OE301"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Course Name*
            </label>
            <TextInput
              value={newCourse.course_name}
              onChange={(e) =>
                setNewCourse({
                  ...newCourse,
                  course_name: e.target.value,
                })
              }
              placeholder="e.g., Business Analytics"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Credits*
            </label>
            <TextInput
              type="number"
              value={newCourse.course_credits}
              onChange={(e) =>
                setNewCourse({
                  ...newCourse,
                  course_credits: parseInt(e.target.value),
                })
              }
              placeholder="e.g., 3"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Semester*
            </label>
            <select
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              value={newCourse.semester}
              onChange={(e) =>
                setNewCourse({
                  ...newCourse,
                  semester: parseInt(e.target.value),
                })
              }
            >
              <option value="">Select Semester</option>
              {[...Array(8)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  Semester {i + 1}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <div className="flex justify-end gap-2">
          <Button
            color="gray"
            onClick={() => setNewCourseModal({ isOpen: false, type: "open" })}
          >
            Cancel
          </Button>
          <Button
            color="success"
            onClick={handleAddNewCourse}
            disabled={!isNewCourseValid()}
          >
            Add Course
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );

  const isNewCourseValid = () => {
    return (
      newCourse.course_code &&
      newCourse.course_name &&
      newCourse.course_credits &&
      newCourse.semester
    );
  };

  const handleAddNewCourse = async () => {
    try {
      const response = await fetch("/api/cgpa/addOpenElectiveCourse", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          departmentId,
          course: {
            ...newCourse,
            vertical_type: "OE",
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add course");
      }

      const result = await response.json();
      if (result.success) {
        await fetchCourseData(); // Refresh data
        setNewCourseModal({ isOpen: false, type: "open" });
        setNewCourse({
          course_code: "",
          course_name: "",
          course_credits: "",
          semester: "",
          vertical_type: "OE",
        });
      } else {
        throw new Error(result.message || "Failed to add course");
      }
    } catch (error) {
      console.error("Error adding course:", error);
      // Handle error (show error message to user)
    }
  };

  return (
    <div className="p-4 overflow-y-auto">
      <EditCourseModal />
      <AddNewCourseModal />
      <Tabs theme={customTabTheme}>
        <Tabs.Item
          active={activeTab === "view"}
          title="View Courses"
          icon={List}
          onClick={() => handleTabChange("view")}
        >
          <ViewCoursesTab />
        </Tabs.Item>

        <Tabs.Item
          active={activeTab === "upload"}
          title="Upload Courses"
          icon={Upload}
          onClick={() => handleTabChange("upload")}
        >
          <UploadCoursesTab />
        </Tabs.Item>
      </Tabs>
    </div>
  );
};

export default CourseDataUpload;
