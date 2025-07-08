import React, { useEffect, useState } from "react";
import { Label, Checkbox, Tabs } from "flowbite-react";
import { useSelector } from "react-redux";
import { ScaleLoader } from "react-spinners";
import {
  Calendar,
  MapPin,
  Building2,
  FileText,
  AlertCircle,
  Trophy,
  ChevronRight,
  ArrowRightIcon,
} from "lucide-react";

// Add this custom theme object
const customTabTheme = {
  base: "flex flex-col gap-2",
  tablist: {
    base: "flex text-center",
    styles: {
      default: "flex-wrap -mb-px",
    },
    tabitem: {
      base: "flex items-center justify-center p-4 rounded-t-lg text-sm font-medium first:ml-0 disabled:cursor-not-allowed disabled:text-gray-400 disabled:dark:text-gray-500 focus:outline-none",
      styles: {
        default: {
          base: "rounded-t-lg",
          active: {
            on: "bg-white dark:bg-gray-800 text-[#1f3a6e] border-b-2 border-[#1f3a6e] dark:text-white",
            off: "text-gray-500 hover:bg-gray-50 hover:text-gray-600 dark:hover:bg-gray-700 dark:text-gray-400",
          },
        },
      },
    },
  },
  tabpanel: "py-3",
};

export default function ODRequestForm({ setTab, mentor, classIncharge }) {
  const { currentUser } = useSelector((state) => state.user);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [errors, setErrors] = useState({});
  const [selectedEventType, setSelectedEventType] = useState({
    paperPresentation: false,
    projectPresentation: false,
    otherEvent: false,
  });

  const [activeTab, setActiveTab] = useState("Internal OD");

  // Initialize form data with common fields
  const initialFormData = {
    name: currentUser.name,
    parent_phone: currentUser.parent_phone,
    email: currentUser.email,
    studentId:
      currentUser.userType === "Staff" ? currentUser.userId : currentUser.id,
    userType: currentUser.userType,
    rollNo:
      currentUser.userType === "Staff" ? currentUser.id : currentUser.roll_no,
    regNo: currentUser.register_no,
    batchId: currentUser.batchId,
    sectionId: currentUser.sectionId,
    section_name: currentUser.section_name,
    departmentId: currentUser.departmentId,
    classInchargeId: classIncharge._id,
    mentorId: mentor._id,
    odType: "Internal",
    startDate: "",
    endDate: "",
    noOfDays: 0,
  };

  // Initialize form data with additional fields for External OD
  const externalFormData = {
    ...initialFormData,
    odType: "External",
    collegeName: "",
    city: "",
    eventName: "",
    programName: "",
    paperTitle: "",
    projectTitle: "",
    eventDetails: "",
  };

  const [formData, setFormData] = useState(initialFormData);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEventTypeChange = (type) => {
    setSelectedEventType((prev) => {
      const newState = { ...prev, [type]: !prev[type] };
      return newState;
    });
  };

  // Reset form when switching tabs
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setErrors({}); // Clear all errors
    setErrorMessage(null);

    // Reset form data based on tab
    if (tab === "Internal OD") {
      setFormData({
        ...initialFormData,
        odType: "Internal",
      });
    } else {
      setFormData({
        ...externalFormData,
        odType: "External",
      });
      setSelectedEventType({
        paperPresentation: false,
        projectPresentation: false,
        otherEvent: false,
      });
    }
  };

  const calculateDays = () => {
    const { startDate, endDate } = formData;

    if (!startDate || !endDate) return;

    const start = new Date(startDate);
    const end = new Date(endDate);

    let totalDays = 0;
    let isSecondSaturdayInRange = false;

    // Ensure startDate is not after endDate
    if (start > end) {
      console.error("Start date must not be after end date");
      return;
    }

    for (
      let date = new Date(start);
      date <= end;
      date.setDate(date.getDate() + 1)
    ) {
      const dayOfWeek = date.getDay();

      // Exclude Sundays (0)
      if (dayOfWeek !== 0) {
        totalDays++;
      }

      // Check for the second Saturday
      if (dayOfWeek === 6) {
        // Saturday
        const firstDayOfMonth = new Date(
          date.getFullYear(),
          date.getMonth(),
          1
        );
        const firstSaturday = new Date(firstDayOfMonth);
        firstSaturday.setDate(1 + ((6 - firstDayOfMonth.getDay() + 7) % 7));

        // Find the second Saturday of the month
        const secondSaturday = new Date(firstSaturday);
        secondSaturday.setDate(firstSaturday.getDate() + 7);

        if (
          date.getDate() === secondSaturday.getDate() &&
          date.getMonth() === secondSaturday.getMonth()
        ) {
          isSecondSaturdayInRange = true;
        }
      }
    }

    // If the leave range includes the second Saturday, don't count it
    if (isSecondSaturdayInRange) {
      totalDays--;
    }

    setFormData((prev) => ({
      ...prev,
      noOfDays: totalDays,
    }));
  };

  useEffect(() => {
    calculateDays();
  }, [formData.startDate, formData.endDate]);

  const validateForm = () => {
    const newErrors = {};
    const currentDate = new Date().toISOString().split("T")[0];

    // Common validations for both Internal and External OD
    if (!formData.startDate) {
      newErrors.startDate = "Start date is required";
    } else if (formData.startDate < currentDate) {
      newErrors.startDate = "Start date cannot be in the past";
    }

    if (!formData.endDate) {
      newErrors.endDate = "End date is required";
    } else if (formData.endDate < formData.startDate) {
      newErrors.endDate = "End date must be after start date";
    }

    // Internal OD specific validations
    if (activeTab === "Internal OD") {
      if (!formData.reason) {
        newErrors.reason = "Reason is required";
      } else if (formData.reason.length > 200) {
        newErrors.reason = "Reason must be less than 200 characters";
      }
    }

    // External OD specific validations
    if (activeTab === "External OD") {
      if (!formData.collegeName) {
        newErrors.collegeName = "College/Company name is required";
      }
      if (!formData.city) {
        newErrors.city = "City is required";
      }
      if (!formData.eventName) {
        newErrors.eventName = "Event name is required";
      }

      // Check if at least one event type is selected
      const hasEventType = Object.values(selectedEventType).some(
        (value) => value
      );
      if (!hasEventType) {
        newErrors.eventType = "Please select at least one event type";
      }

      // Validate based on selected event types
      if (selectedEventType.paperPresentation && !formData.paperTitle) {
        newErrors.paperTitle = "Paper title is required";
      }
      if (selectedEventType.projectPresentation && !formData.projectTitle) {
        newErrors.projectTitle = "Project title is required";
      }
      if (selectedEventType.otherEvent && !formData.eventDetails) {
        newErrors.eventDetails = "Event details are required";
      }
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    setErrors(formErrors);

    if (Object.keys(formErrors).length > 0) {
      return;
    }

    try {
      setLoading(true);
      setErrorMessage(null);

      const requestBody = {
        ...formData,
        mentorId:
          formData.classInchargeId === formData.mentorId
            ? formData.mentorId
            : formData.mentorId,
        selectedEventType:
          activeTab === "External OD" ? selectedEventType : null,
      };

      const res = await fetch("/api/od-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await res.json();
      if (!data.success) {
        if (
          data.message.includes("Leave end date must be after the start date")
        ) {
          setErrorMessage("Leave end date must be after the start date");
        } else if (
          data.message.includes(
            "You already have a leave request for this period"
          )
        ) {
          setErrorMessage("You already have a leave request for this period");
        } else {
          setErrorMessage(data.message);
        }
        setLoading(false);
        return;
      }
      if (res.ok) {
        setLoading(false);
        setTab("Your OD Requests");
      }
    } catch (error) {
      setErrorMessage(
        "An error occurred while submitting the OD request. Please try again later."
      );
      setLoading(false);
    }
  };

  const renderInternalODForm = () => (
    <div className="space-y-6">
      {/* Date Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="inline-flex items-center px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
            <Calendar size={16} className="mr-2" />
            Start Date<span className="text-red-400 ml-1">*</span>
          </Label>
          <input
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            className={`w-full rounded-lg border dark:bg-gray-800 ${
              errors.startDate
                ? "border-red-500"
                : "border-gray-300 dark:border-gray-600"
            } p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
          />
          <ErrorMessage error={errors.startDate} />
        </div>

        <div className="space-y-2">
          <Label className="inline-flex items-center px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
            <Calendar size={16} className="mr-2" />
            End Date<span className="text-red-400 ml-1">*</span>
          </Label>
          <input
            type="date"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
            className={`w-full rounded-lg border dark:bg-gray-800 ${
              errors.endDate
                ? "border-red-500"
                : "border-gray-300 dark:border-gray-600"
            } p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
          />
          <ErrorMessage error={errors.endDate} />
        </div>
      </div>

      {/* Reason Section */}
      <div className="space-y-2">
        <Label className="inline-flex items-center px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
          <FileText size={16} className="mr-2" />
          Reason for OD<span className="text-red-400 ml-1">*</span>
        </Label>
        <textarea
          name="reason"
          value={formData.reason}
          onChange={handleChange}
          rows="4"
          className={`w-full rounded-lg border dark:bg-gray-800 ${
            errors.reason
              ? "border-red-500"
              : "border-gray-300 dark:border-gray-600"
          } p-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none`}
          placeholder="Please provide the reason for internal OD..."
        />
        <ErrorMessage error={errors.reason} />
      </div>
    </div>
  );

  const renderExternalODForm = () => (
    <div className="space-y-6">
      {/* College and City */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="inline-flex items-center px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
            <Building2 size={16} className="mr-2" />
            College/Company<span className="text-red-400 ml-1">*</span>
          </Label>
          <input
            type="text"
            name="collegeName"
            value={formData.collegeName}
            onChange={handleChange}
            className={`w-full rounded-lg border dark:bg-gray-800 ${
              errors.collegeName
                ? "border-red-500"
                : "border-gray-300 dark:border-gray-600"
            } p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            placeholder="Enter college or company name"
          />
          <ErrorMessage error={errors.collegeName} />
        </div>

        <div className="space-y-2">
          <Label className="inline-flex items-center px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
            <MapPin size={16} className="mr-2" />
            City<span className="text-red-400 ml-1">*</span>
          </Label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            className={`w-full rounded-lg border dark:bg-gray-800 ${
              errors.city
                ? "border-red-500"
                : "border-gray-300 dark:border-gray-600"
            } p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            placeholder="Enter city name"
          />
          <ErrorMessage error={errors.city} />
        </div>
      </div>

      {/* Event Name */}
      <div className="space-y-2">
        <Label className="inline-flex items-center px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
          <Trophy size={16} className="mr-2" />
          Event Name<span className="text-red-400 ml-1">*</span>
        </Label>
        <input
          type="text"
          name="eventName"
          value={formData.eventName}
          onChange={handleChange}
          className={`w-full rounded-lg border dark:bg-gray-800 ${
            errors.eventName
              ? "border-red-500"
              : "border-gray-300 dark:border-gray-600"
          } p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
          placeholder="Enter event name"
        />
        <ErrorMessage error={errors.eventName} />
      </div>

      {/* Date Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="inline-flex items-center px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
            <Calendar size={16} className="mr-2" />
            Start Date<span className="text-red-400 ml-1">*</span>
          </Label>
          <input
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            className={`w-full rounded-lg border dark:bg-gray-800 ${
              errors.startDate
                ? "border-red-500"
                : "border-gray-300 dark:border-gray-600"
            } p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
          />
          <ErrorMessage error={errors.startDate} />
        </div>

        <div className="space-y-2">
          <Label className="inline-flex items-center px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
            <Calendar size={16} className="mr-2" />
            End Date<span className="text-red-400 ml-1">*</span>
          </Label>
          <input
            type="date"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
            className={`w-full rounded-lg border dark:bg-gray-800 ${
              errors.endDate
                ? "border-red-500"
                : "border-gray-300 dark:border-gray-600"
            } p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
          />
          <ErrorMessage error={errors.endDate} />
        </div>
      </div>

      {/* Event Types */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 space-y-4 border border-gray-200">
        <Label className="inline-flex items-center px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
          Event Type<span className="text-red-400 ml-1">*</span>
        </Label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { id: "paperPresentation", label: "Paper Presentation" },
            { id: "projectPresentation", label: "Project Presentation" },
            { id: "otherEvent", label: "Other Event" },
          ].map((type) => (
            <label
              key={type.id}
              className="flex items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
            >
              <Checkbox
                id={type.id}
                checked={selectedEventType[type.id]}
                onChange={() => handleEventTypeChange(type.id)}
                className="text-[#1f3a6e] rounded"
              />
              <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                {type.label}
              </span>
            </label>
          ))}
        </div>
        <ErrorMessage error={errors.eventType} />
      </div>

      {/* Conditional Fields */}
      <div className="space-y-6">
        {selectedEventType.paperPresentation && (
          <div className="space-y-2">
            <Label className="inline-flex items-center px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
              <FileText size={16} className="mr-2" />
              Paper Title<span className="text-red-400 ml-1">*</span>
            </Label>
            <input
              type="text"
              name="paperTitle"
              value={formData.paperTitle}
              onChange={handleChange}
              className={`w-full rounded-lg border dark:bg-gray-800 ${
                errors.paperTitle
                  ? "border-red-500"
                  : "border-gray-300 dark:border-gray-600"
              } p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              placeholder="Enter paper title"
            />
            <ErrorMessage error={errors.paperTitle} />
          </div>
        )}

        {selectedEventType.projectPresentation && (
          <div className="space-y-2">
            <Label className="inline-flex items-center px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
              <FileText size={16} className="mr-2" />
              Project Title<span className="text-red-400 ml-1">*</span>
            </Label>
            <input
              type="text"
              name="projectTitle"
              value={formData.projectTitle}
              onChange={handleChange}
              className={`w-full rounded-lg border dark:bg-gray-800 ${
                errors.projectTitle
                  ? "border-red-500"
                  : "border-gray-300 dark:border-gray-600"
              } p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              placeholder="Enter project title"
            />
            <ErrorMessage error={errors.projectTitle} />
          </div>
        )}

        {selectedEventType.otherEvent && (
          <div className="space-y-2">
            <Label className="inline-flex items-center px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
              <FileText size={16} className="mr-2" />
              Event Details<span className="text-red-400 ml-1">*</span>
            </Label>
            <textarea
              name="eventDetails"
              value={formData.eventDetails}
              onChange={handleChange}
              rows="4"
              className={`w-full rounded-lg border dark:bg-gray-800 ${
                errors.eventDetails
                  ? "border-red-500"
                  : "border-gray-300 dark:border-gray-600"
              } p-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none`}
              placeholder="Please provide detailed information about the event..."
            />
            <ErrorMessage error={errors.eventDetails} />
          </div>
        )}
      </div>
    </div>
  );

  const ErrorMessage = ({ error }) => {
    if (!error) return null;
    return (
      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
        <AlertCircle size={12} />
        {error}
      </p>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header with Gradient Background */}
      <div className="flex flex-col sm:flex-row items-center justify-center mb-8 space-y-2 sm:space-y-0 sm:space-x-2 text-center">
        <h1 className="text-sm sm:text-md font-semibold">Approval By :</h1>

        {mentor._id === classIncharge._id ? (
          <div className="bg-blue-500 px-4 py-1 rounded-full text-white text-sm font-medium">
            {mentor.staff_name}
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-2">
            <div className="bg-blue-500 px-4 py-1 rounded-full text-white text-sm font-medium">
              {mentor.staff_name}
            </div>
            <ArrowRightIcon className="w-5 h-5 text-blue-600" />
            <div className="bg-blue-500 px-4 py-1 rounded-full text-white text-sm font-medium">
              {classIncharge.staff_name}
            </div>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        {errorMessage && (
          <div className="m-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
            <AlertCircle size={16} />
            {errorMessage}
          </div>
        )}
        {mentor._id === classIncharge._id ? (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 rounded-t-md p-2">
            <p>
              The <strong>mentor</strong> and <strong>class incharge</strong>{" "}
              appear to be the same person. Please double-check if the class
              incharge is correctly assigned to you.
            </p>
          </div>
        ) : (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800  rounded-t-md p-2">
            <p>
              If the approval flow (from mentor to class incharge) is not
              assigned properly for your updated mentor/classincharge, try
              signing out and signing in again. If the issue persists, please
              contact the staff for assistance.
            </p>
          </div>
        )}
        <div className="p-6">
          <Tabs theme={customTabTheme} onActiveTabChange={handleTabChange}>
            <Tabs.Item active={activeTab === "Internal OD"} title="Internal OD">
              <form onSubmit={handleSubmit} className="space-y-6">
                {renderInternalODForm()}
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r dark:bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
                  disabled={loading}
                >
                  {loading ? (
                    <ScaleLoader color="white" height={15} />
                  ) : (
                    <>
                      Submit Internal OD Request
                      <ChevronRight size={20} />
                    </>
                  )}
                </button>
              </form>
            </Tabs.Item>

            <Tabs.Item active={activeTab === "External OD"} title="External OD">
              <form onSubmit={handleSubmit} className="space-y-6">
                {renderExternalODForm()}
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
                  disabled={loading}
                >
                  {loading ? (
                    <ScaleLoader color="white" height={15} />
                  ) : (
                    <>
                      Submit External OD Request
                      <ChevronRight size={20} />
                    </>
                  )}
                </button>
              </form>
            </Tabs.Item>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
