import React, { useState, useEffect } from "react";
import { Upload, BookOpen, GraduationCap } from "lucide-react";
import { Modal, Button, Accordion } from "flowbite-react";
import CourseDataUpload from "./CourseDataUpload";

const ListModel = ({ isOpen, onClose, department }) => {
  const [activeTab, setActiveTab] = useState("upload");
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/cgpa/getCourseDataForDepartment?departmentId=${department?._id}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch course data");
      }

      const data = await response.json();
      if (data.success) {
        setCourseData(data.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (
      department?._id &&
      (activeTab === "normal" ||
        activeTab === "elective" ||
        activeTab === "openelective")
    ) {
      fetchCourseData();
    }
  }, [department?._id, activeTab]);

  const CourseTable = ({ courses }) => (
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
          </tr>
        </thead>
        <tbody className="divide-y">
          {courses.map((course, idx) => (
            <tr key={idx} className="bg-white hover:bg-gray-50">
              <td className="px-6 py-4 font-medium text-gray-900">
                {course.course_code}
              </td>
              <td className="px-6 py-4">{course.course_name}</td>
              <td className="px-6 py-4">{course.course_credits}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const RegularCoursesContent = () => (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b bg-white sticky top-0 z-10">
        <h3 className="text-lg font-semibold">Regular Courses</h3>
      </div>
      <div className="flex-1 p-6 overflow-y-auto">
        {loading ? (
          <div className="text-center min-h-[600px] py-4">Loading...</div>
        ) : error ? (
          <div className="text-red-500 text-center py-4">{error}</div>
        ) : courseData?.regular_courses?.length > 0 ? (
          <Accordion className="divide-y divide-gray-200">
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
                    <CourseTable courses={semester.courses} />
                  </Accordion.Content>
                </Accordion.Panel>
              ))}
          </Accordion>
        ) : (
          <div className="text-center py-4">No regular courses found</div>
        )}
      </div>
    </div>
  );

  const ElectiveCoursesContent = () => (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b bg-white sticky top-0 z-10">
        <h3 className="text-lg font-semibold">Elective Courses</h3>
      </div>
      <div className="flex-1 p-6 overflow-y-auto">
        {loading ? (
          <div className="text-center min-h-[600px] py-4">Loading...</div>
        ) : error ? (
          <div className="text-red-500 text-center py-4">{error}</div>
        ) : courseData?.verticals?.length > 0 ? (
          <Accordion className="divide-y divide-gray-200">
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
                  <CourseTable courses={vertical.courses} />
                </Accordion.Content>
              </Accordion.Panel>
            ))}
          </Accordion>
        ) : (
          <div className="text-center py-4">No elective courses found</div>
        )}
      </div>
    </div>
  );

  const OpenElectiveCoursesContent = () => (
    <div className="h-full flex flex-col min-h-[600px]">
      <div className="p-6 border-b bg-white sticky top-0 z-10">
        <h3 className="text-lg font-semibold">Open Elective Courses</h3>
      </div>
      <div className="flex-1 p-6 overflow-y-auto">
        {loading ? (
          <div className="text-center min-h-[600px] py-4">Loading...</div>
        ) : error ? (
          <div className="text-red-500 text-center py-4">{error}</div>
        ) : courseData?.open_courses?.length > 0 ? (
          <Accordion className="divide-y divide-gray-200">
            {courseData.open_courses
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
                            <th scope="col" className="px-6 py-3">
                              Type
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {semester.courses.map((course, courseIdx) => (
                            <tr
                              key={courseIdx}
                              className="bg-white hover:bg-gray-50"
                            >
                              <td className="px-6 py-4 font-medium text-gray-900">
                                {course.course_code}
                              </td>
                              <td className="px-6 py-4">
                                {course.course_name}
                              </td>
                              <td className="px-6 py-4">
                                {course.course_credits}
                              </td>
                              <td className="px-6 py-4">
                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                  Open Elective
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Accordion.Content>
                </Accordion.Panel>
              ))}
          </Accordion>
        ) : (
          <div className="text-center py-4">No open elective courses found</div>
        )}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "upload":
        return <CourseDataUpload departmentId={department?._id} />;
      case "normal":
        return <RegularCoursesContent />;
      case "elective":
        return <ElectiveCoursesContent />;
      case "openelective":
        return <OpenElectiveCoursesContent />;
      default:
        return null;
    }
  };

  return (
    <Modal show={isOpen} onClose={onClose} size="7xl" position="center">
      <Modal.Header className="border-b sticky top-0 z-20 bg-white">
        <h2 className="text-xl font-semibold">
          {department?.dept_name || "Department"} Courses
        </h2>
      </Modal.Header>
      <Modal.Body className="p-0 flex h-[80vh]">
        {/* Sidebar */}
        <div className="w-64 border-r bg-gray-50 flex-shrink-0">
          <nav className="p-4 space-y-2 sticky top-0">
            <Button
              onClick={() => setActiveTab("upload")}
              color={activeTab === "upload" ? "blue" : "gray"}
              className="w-full justify-start"
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload Data
            </Button>
            <Button
              onClick={() => setActiveTab("normal")}
              color={activeTab === "normal" ? "blue" : "gray"}
              className="w-full justify-start"
            >
              <BookOpen className="mr-2 h-4 w-4" />
              Regular Courses
            </Button>
            <Button
              onClick={() => setActiveTab("elective")}
              color={activeTab === "elective" ? "blue" : "gray"}
              className="w-full justify-start"
            >
              <GraduationCap className="mr-2 h-4 w-4" />
              Elective Courses
            </Button>
            <Button
              onClick={() => setActiveTab("openelective")}
              color={activeTab === "openelective" ? "blue" : "gray"}
              className="w-full justify-start"
            >
              <GraduationCap className="mr-2 h-4 w-4" />
              Open Elective Courses
            </Button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">{renderContent()}</div>
      </Modal.Body>
    </Modal>
  );
};

export default ListModel;
