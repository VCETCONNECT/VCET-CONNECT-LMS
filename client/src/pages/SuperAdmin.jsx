import React, { useState, useEffect } from "react";
import { useFetchDepartments } from "../../hooks/useFetchData";
import UploadExcel from "../components/systems/excelUpload";
import {
  Building2,
  Upload,
  School,
  Users,
  Trash2,
  PlusCircle,
  ChevronRight,
  Settings,
  BookOpen,
  UserPlus,
  GraduationCap,
  Mail,
  AlertCircle,
  Send,
  UserCheck,
  MessageSquare,
} from "lucide-react";
import DashboardSidebar from "../components/layout/DashboardSidebar";
import DepartmentCourses from "../components/systems/studentacademics/DepartmentCourses";
import { toast } from "react-hot-toast";

const SuperAdmin = () => {
  const departments = useFetchDepartments();
  const [batches, setBatches] = useState([]);
  const [sections, setSections] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [isFetching, setIsFetching] = useState(false);
  const [classDetails, setClassDetails] = useState({
    mentors: [],
    classIncharges: [],
  });
  const [newMentorName, setNewMentorName] = useState("");
  const [newSection, setNewSection] = useState("");
  const [newDepartment, setNewDepartment] = useState("");
  const [sectionAlertMessage, setSectionAlertMessage] = useState("");
  const [departmentAlertMessage, setDepartmentAlertMessage] = useState("");
  const [MentorAlertMessage, setMentorAlertMessage] = useState("");
  const [classInchargeMessage, setClassInchargeMessage] = useState("");
  const [newBatchName, setNewBatchName] = useState("");
  const [batchAlertMessage, setBatchAlertMessage] = useState("");
  const [uploadType, setUploadType] = useState("student");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (selectedDepartment) {
      fetchBatches(selectedDepartment._id);
    }
  }, [selectedDepartment]);

  useEffect(() => {
    if (selectedBatch) {
      fetchSections(selectedBatch._id);
    }
  }, [selectedBatch]);

  useEffect(() => {
    if (selectedSection) {
      fetchClassDetails(selectedSection._id);
    }
  }, [selectedSection]);

  useEffect(() => {
    if (sectionAlertMessage) {
      const timer = setTimeout(() => {
        setSectionAlertMessage("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [sectionAlertMessage]);

  useEffect(() => {
    if (departmentAlertMessage) {
      const timer = setTimeout(() => {
        setDepartmentAlertMessage("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [departmentAlertMessage]);

  useEffect(() => {
    if (MentorAlertMessage) {
      const timer = setTimeout(() => {
        setMentorAlertMessage("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [MentorAlertMessage]);

  const handleDepartmentSelect = (department) => {
    setSelectedDepartment(department);
    setSelectedBatch(null);
    setSelectedSection(null); // Reset section selection
  };

  const handleBatchSelect = (batch) => {
    setSelectedBatch(batch === selectedBatch ? null : batch);
    setSelectedSection(null); // Reset section selection
  };

  const handleSectionSelect = (section) => {
    setSelectedSection(section === selectedSection ? null : section);
  };

  const handleAddSection = async () => {
    try {
      const response = await fetch(`/api/addSection`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          batchId: selectedBatch._id,
          section_name: newSection,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to add Section");
      }
      setSectionAlertMessage("added successfully");
      setNewSection("");
    } catch (error) {
      console.error("Error adding section:", error.message);
      setSectionAlertMessage("failed to Add!");
    }
  };

  const handleAddDepartment = async () => {
    try {
      const response = await fetch(`/api/departments/addDepartment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ dept_name: newDepartment }),
      });
      setDepartmentAlertMessage(`Added Successfullly`);
      setNewDepartment("");
    } catch (error) {
      console.error("Error adding department:", error.message);
      setDepartmentAlertMessage("failed to Add!");
    }
  };

  const handleAddBatch = async () => {
    try {
      const response = await fetch(`/api/batches/addBatch`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dept_id: selectedDepartment._id,
          batch_name: newBatchName,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add Batch");
      }
      setBatchAlertMessage("Batch added successfully");
      setNewBatchName("");
    } catch (error) {
      console.error("Error adding batch:", error.message);
      setBatchAlertMessage("Failed to add Batch!");
    }
  };

  const handleDeleteClass = async (sectionId) => {
    try {
      const response = await fetch(`/api/sections/deleteSection/${sectionId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete class");
      }
    } catch (error) {
      console.error("Error deleting class:", error.message);
    }
  };

  const handleDeleteBatch = async (batchId) => {
    try {
      const response = await fetch(`/api/batches/deleteBatch/${batchId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete class");
      }
    } catch (error) {
      console.error("Error deleting class:", error.message);
    }
  };

  const handleDeleteDepartment = async (departmentId) => {
    alert("Sure to delete");
    try {
      const response = await fetch(
        `/api/departments/deleteDepartment/${departmentId}`,
        { method: "DELETE" }
      );
      if (!response.ok) {
        throw new Error("Failed to delete class");
      }
    } catch (error) {
      console.error("Error deleting class:", error.message);
    }
  };

  const fetchBatches = async (departmentId) => {
    try {
      setIsFetching(true);
      const response = await fetch(`/api/departments/${departmentId}/batches`);
      if (!response.ok) {
        throw new Error("Failed to fetch batches");
      }
      const data = await response.json();
      setBatches(data.sort((b, a) => a.batch_name.localeCompare(b.batch_name)));
    } catch (error) {
      console.error("Error fetching batches:", error.message);
    } finally {
      setIsFetching(false);
    }
  };

  const fetchSections = async (batchId) => {
    try {
      setIsFetching(true);
      const response = await fetch(`/api/batches/${batchId}/sections`);
      if (!response.ok) {
        throw new Error("Failed to fetch sections");
      }
      const data = await response.json();
      setSections(
        data.sort((a, b) => a.section_name.localeCompare(b.section_name))
      );
    } catch (error) {
      console.error("Error fetching sections:", error.message);
    } finally {
      setIsFetching(false);
    }
  };

  const fetchClassDetails = async (sectionId) => {
    try {
      setIsFetching(true);

      const mentorResponse = await fetch(`/api/sections/${sectionId}/mentors`);
      if (!mentorResponse.ok) {
        throw new Error("Failed to fetch mentors");
      }
      const mentors = await mentorResponse.json();

      const classInchargeResponse = await fetch(
        `/api/sections/${sectionId}/classIncharges`
      );
      if (!classInchargeResponse.ok) {
        throw new Error("Failed to fetch class in-charges");
      }
      const classIncharges = await classInchargeResponse.json();

      setClassDetails({ mentors, classIncharges });
      setIsFetching(false);
    } catch (error) {
      console.error("Error fetching class details:", error.message);
      setIsFetching(false);
    }
  };

  const handleDeleteMentor = async (mentorId) => {
    try {
      const response = await fetch(`/api/deletementors/${mentorId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete mentor");
      }
      setMentorAlertMessage("Mentor deleted successfully");
      fetchClassDetails(selectedSection._id);
    } catch (error) {
      console.error("Error deleting mentor:", error.message);
      setMentorAlertMessage("Failed to delete mentor");
    }
  };

  const handleDeleteClassIncharge = async (inchargeId) => {
    try {
      const response = await fetch(`/api/deleteClassIncharge/${inchargeId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete Class Incharge");
      }
      setClassInchargeMessage("ClassIncharge deleted successfully");
      fetchClassDetails(selectedSection._id);
    } catch (error) {
      console.error("Error deleting ClassIncharge:", error.message);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <>
            <div
              className={`grid grid-cols-1 ${
                isSidebarOpen ? "lg:grid-cols-3" : "lg:grid-cols-4"
              } gap-6`}
            >
              <div
                className={`${
                  isSidebarOpen ? "lg:col-span-1" : "lg:col-span-1"
                }`}
              >
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 sticky top-6">
                  <div className="flex flex-col gap-4">
                    {/* Add Department Form */}
                    <div className="flex flex-col gap-2">
                      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                        Departments
                      </h2>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newDepartment}
                          onChange={(e) => setNewDepartment(e.target.value)}
                          placeholder="New Department"
                          className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm dark:bg-gray-800 dark:text-gray-200 dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        />
                        <button
                          onClick={handleAddDepartment}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                        >
                          <PlusCircle size={18} />
                          Add
                        </button>
                      </div>
                      {departmentAlertMessage && (
                        <p
                          className={`text-sm ${
                            departmentAlertMessage.includes("failed")
                              ? "text-red-500"
                              : "text-green-500"
                          }`}
                        >
                          {departmentAlertMessage}
                        </p>
                      )}
                    </div>

                    {/* Departments List */}
                    <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto custom-scrollbar">
                      {departments.map((dept) => (
                        <div
                          key={dept._id}
                          onClick={() => handleDepartmentSelect(dept)}
                          className={`flex items-center justify-between p-4 rounded-lg cursor-pointer transition-all duration-200 ${
                            selectedDepartment === dept
                              ? "bg-blue-50 border-l-4 border-blue-500 shadow-md dark:bg-gray-800 dark:border-blue-500"
                              : "bg-gray-50 hover:bg-gray-100 hover:shadow-md dark:bg-gray-800 dark:hover:bg-gray-700"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="font-medium">
                              {dept.dept_acronym}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <ChevronRight
                              size={18}
                              className={`text-gray-400 transition-transform ${
                                selectedDepartment === dept ? "rotate-90" : ""
                              }`}
                            />
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (
                                  window.confirm(
                                    `Are you sure you want to delete ${dept.dept_name}?`
                                  )
                                ) {
                                  handleDeleteDepartment(dept._id);
                                }
                              }}
                              className="p-1 hover:bg-red-100 rounded-full text-red-500 transition-colors dark:hover:bg-red-900 dark:text-red-400"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-1 gap-6 mb-8">
                      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">
                              Total Departments
                            </p>
                            <h3 className="text-2xl font-bold dark:text-gray-200">
                              {departments.length}
                            </h3>
                          </div>
                          <Building2 className="text-blue-500" size={32} />
                        </div>
                      </div>

                      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">
                              Total Batches
                            </p>
                            <h3 className="text-2xl font-bold dark:text-gray-200">
                              {batches.length}
                            </h3>
                          </div>
                          <School className="text-green-500" size={32} />
                        </div>
                      </div>

                      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">
                              Total Sections
                            </p>
                            <h3 className="text-2xl font-bold dark:text-gray-200">
                              {sections.length}
                            </h3>
                          </div>
                          <Users className="text-purple-500" size={32} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div
                className={`${
                  isSidebarOpen ? "lg:col-span-2" : "lg:col-span-3"
                }`}
              >
                {selectedDepartment && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                        {selectedDepartment.dept_name} Management
                      </h2>
                    </div>

                    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6`}>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200">
                            Batches
                          </h3>
                          <div className="flex gap-3">
                            <input
                              type="text"
                              value={newBatchName}
                              onChange={(e) => setNewBatchName(e.target.value)}
                              placeholder="New Batch"
                              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-200 dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            />
                            <button
                              onClick={handleAddBatch}
                              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors dark:bg-green-600 dark:hover:bg-green-700"
                            >
                              Add
                            </button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {batches.map((batch) => (
                            <div
                              key={batch._id}
                              onClick={() => handleBatchSelect(batch)}
                              className={`flex items-center justify-between p-4 rounded-lg cursor-pointer transition-colors ${
                                selectedBatch === batch
                                  ? "bg-green-50 border-l-4 border-green-500 dark:bg-gray-800 dark:border-green-500"
                                  : "bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700"
                              }`}
                            >
                              <span className="font-medium">
                                {batch.batch_name}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteBatch(batch._id);
                                }}
                                className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-500"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {selectedBatch && (
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200">
                              Sections
                            </h3>
                            <div className="flex gap-3">
                              <input
                                type="text"
                                value={newSection}
                                onChange={(e) => setNewSection(e.target.value)}
                                placeholder="New Section"
                                className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-200 dark:focus:ring-blue-500 dark:focus:border-blue-500"
                              />
                              <button
                                onClick={handleAddSection}
                                className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors dark:bg-purple-600 dark:hover:bg-purple-700"
                              >
                                Add
                              </button>
                            </div>
                          </div>
                          <div className="grid gap-4 max-h-[300px] overflow-y-auto">
                            {sections.map((section) => (
                              <div
                                key={section._id}
                                className={`bg-gray-50 rounded-lg p-4 dark:bg-gray-800 ${
                                  selectedSection === section
                                    ? "border-l-4 border-purple-500 dark:border-purple-500"
                                    : ""
                                }`}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <h3 className="font-semibold dark:text-gray-200">
                                    Section {section.section_name}
                                  </h3>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() =>
                                        handleSectionSelect(section)
                                      }
                                      className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 transition-colors dark:bg-blue-600 dark:hover:bg-blue-700"
                                    >
                                      View Details
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleDeleteClass(section._id)
                                      }
                                      className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-500"
                                    >
                                      <Trash2 size={18} />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {selectedSection && (
                  <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                    <div
                      className={`grid grid-cols-1 ${
                        isSidebarOpen ? "lg:grid-cols-1" : "lg:grid-cols-2"
                      } gap-6`}
                    >
                      <div>
                        <h3 className="text-lg font-semibold mb-4 dark:text-gray-200">
                          Mentors
                        </h3>
                        <div className="space-y-2">
                          {classDetails.mentors.map((mentor) => (
                            <div
                              key={mentor._id}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg dark:bg-gray-800"
                            >
                              <span>{mentor.staff_name}</span>
                              <button
                                onClick={() =>
                                  handleDeleteMentor(mentor._id)
                                }
                                className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-500"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-4 dark:text-gray-200">
                          Class Incharges
                        </h3>
                        <div className="space-y-2">
                          {classDetails.classIncharges.map((incharge) => (
                            <div
                              key={incharge._id}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg dark:bg-gray-800"
                            >
                              <span>{incharge.staff_name}</span>
                              <button
                                onClick={() =>
                                  handleDeleteClassIncharge(incharge._id)
                                }
                                className="text-red-500 hover:text-red-600"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        );
      case "department_courses":
        return <DepartmentCourses />;
      case "upload":
        return (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold mb-6">Data Upload</h2>
            <div className="flex gap-4 mb-6">
              <button
                onClick={() => setUploadType("student")}
                className={`flex-1 px-4 py-3 rounded-lg transition-colors ${
                  uploadType === "student"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                Student Upload
              </button>
              <button
                onClick={() => setUploadType("staff")}
                className={`flex-1 px-4 py-3 rounded-lg transition-colors ${
                  uploadType === "staff"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                Staff Upload
              </button>
            </div>
            <UploadExcel type={uploadType} />
          </div>
        );
      case "notifications":
        return (
          <div className="space-y-6">
            {/* Profile Update Reminders */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">
                    Profile Update Reminders
                  </h2>
                  <p className="text-gray-600 mt-1">
                    Send reminders to students with incomplete profiles
                  </p>
                </div>
                <button
                  onClick={async () => {
                    try {
                      const response = await fetch(
                        "/api/notification/send-profile-reminder",
                        {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                          },
                        }
                      );
                      const data = await response.json();
                      if (response.ok) {
                        toast.success(
                          `Sent reminders to ${data.results.successful} students`
                        );
                      } else {
                        toast.error(data.message);
                      }
                    } catch (error) {
                      toast.error("Failed to send reminders");
                    }
                  }}
                  className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Send size={18} />
                  Send Reminders
                </button>
              </div>
            </div>

            {/* Batch Notifications */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">
                    Batch Notifications
                  </h2>
                  <p className="text-gray-600 mt-1">
                    Send notifications to specific batches or departments
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Onboarding Welcome */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <UserCheck className="w-6 h-6 text-blue-500" />
                    </div>
                    <h3 className="font-semibold text-gray-800">
                      Onboarding Welcome
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Send welcome messages to new students
                  </p>
                  <button
                    onClick={async () => {
                      if (!selectedBatch) {
                        toast.error("Please select a batch first");
                        return;
                      }
                      try {
                        const response = await fetch(
                          "/api/notification/send-to-all",
                          {
                            method: "POST",
                            headers: {
                              "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                              type: "ONBOARDING_WELCOME",
                              filter: {
                                batch: selectedBatch._id,
                              },
                            }),
                          }
                        );
                        const data = await response.json();
                        if (response.ok) {
                          toast.success(
                            `Sent welcome messages to ${data.results.successful} students`
                          );
                        } else {
                          toast.error(data.message);
                        }
                      } catch (error) {
                        toast.error("Failed to send welcome messages");
                      }
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <Send size={16} />
                    Send to Selected Batch
                  </button>
                </div>

                {/* Dashboard Feedback */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-purple-500/10 rounded-lg">
                      <MessageSquare className="w-6 h-6 text-purple-500" />
                    </div>
                    <h3 className="font-semibold text-gray-800">
                      Dashboard Feedback
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Request feedback on dashboard features
                  </p>
                  <button
                    onClick={async () => {
                      if (!selectedDepartment) {
                        toast.error("Please select a department first");
                        return;
                      }
                      try {
                        const response = await fetch(
                          "/api/notification/send-to-all",
                          {
                            method: "POST",
                            headers: {
                              "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                              type: "DASHBOARD_FEEDBACK",
                              filter: {
                                department: selectedDepartment._id,
                              },
                            }),
                          }
                        );
                        const data = await response.json();
                        if (response.ok) {
                          toast.success(
                            `Sent feedback requests to ${data.results.successful} students`
                          );
                        } else {
                          toast.error(data.message);
                        }
                      } catch (error) {
                        toast.error("Failed to send feedback requests");
                      }
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors"
                  >
                    <Send size={16} />
                    Send to Department
                  </button>
                </div>

                {/* Custom Announcement */}
                <div className="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-green-500/10 rounded-lg">
                      <AlertCircle className="w-6 h-6 text-green-500" />
                    </div>
                    <h3 className="font-semibold text-gray-800">
                      Custom Announcement
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Send a custom announcement to selected students
                  </p>
                  <button
                    onClick={() => {
                      if (!selectedSection) {
                        toast.error("Please select a section first");
                        return;
                      }
                      // You can implement a modal here to get custom message
                      const message = prompt(
                        "Enter your announcement message:"
                      );
                      if (!message) return;

                      fetch("/api/notification/send-to-all", {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                          type: "GENERAL_ANNOUNCEMENT",
                          customTitle: "Important Announcement",
                          customMessage: message,
                          filter: {
                            section: selectedSection.section_name,
                          },
                        }),
                      })
                        .then((response) => response.json())
                        .then((data) => {
                          if (data.results.successful > 0) {
                            toast.success(
                              `Sent announcement to ${data.results.successful} students`
                            );
                          } else {
                            toast.error(data.message);
                          }
                        })
                        .catch(() => {
                          toast.error("Failed to send announcement");
                        });
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <Send size={16} />
                    Send to Section
                  </button>
                </div>
              </div>
            </div>

            {/* Notification Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <Mail className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Students</p>
                    <p className="text-xl font-semibold">
                      {departments.reduce(
                        (acc, dept) => acc + (dept.studentCount || 0),
                        0
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const menuItems = [
    {
      id: "overview",
      icon: <Settings size={18} />,
      label: "Overview",
    },
    {
      id: "upload",
      icon: <Upload size={18} />,
      label: "Data Upload",
    },
    {
      id: "department_courses",
      icon: <BookOpen size={18} />,
      label: "Department Courses",
    },
    // {
    //   id: "notifications",
    //   icon: <Mail size={18} />,
    //   label: "Notifications",
    // },
  ];

  return (
    <div className="min-h-screen bg-[#f3f4f6] dark:bg-gray-900">
      <DashboardSidebar
        menuItems={menuItems}
        currentTab={activeTab}
        onTabChange={setActiveTab}
        title="Super Admin Dashboard"
        onSidebarToggle={setIsSidebarOpen}
      />

      <div
        className={`transition-all duration-300 ${
          isSidebarOpen ? "lg:ml-64" : "lg:ml-20"
        } p-6`}
      >
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">
            Welcome, Super Admin
          </h1>
          <p className="text-gray-600">
            Manage your institution's departments and data
          </p>
        </div>

        {renderContent()}
      </div>
    </div>
  );
};

export default SuperAdmin;
