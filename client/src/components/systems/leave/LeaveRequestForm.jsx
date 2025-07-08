import React, { useEffect, useState } from "react";
import { Label, Checkbox } from "flowbite-react";
import { useSelector } from "react-redux";
import { ScaleLoader } from "react-spinners";
import {
  Calendar,
  Clock,
  FileText,
  AlertCircle,
  User,
  Phone,
  Mail,
  BookOpen,
  Building,
  ArrowRightIcon,
} from "lucide-react";

export default function LeaveRequestForm({ setTab, mentor, classIncharge }) {
  const { currentUser } = useSelector((state) => state.user);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [errors, setErrors] = useState({});
  const [forMedical, setForMedical] = useState(false);
  const [forOneDay, setForOneDay] = useState(false);
  const [isHalfDay, setIsHalfDay] = useState(null);

  const [formData, setFormData] = useState({
    name: currentUser.name,
    parent_phone: currentUser.parent_phone,
    email: currentUser.email,
    userId:
      currentUser.userType === "Staff" ? currentUser.userId : currentUser.id,
    userType: currentUser.userType,
    rollNo:
      currentUser.userType === "Staff" ? currentUser.id : currentUser.roll_no,
    regNo: currentUser.register_no,
    forMedical,
    batchId: currentUser.batchId,
    sectionId: currentUser.sectionId,
    section_name: currentUser.section_name,
    departmentId: currentUser.departmentId,
    reason: "",
    classInchargeId: classIncharge._id,
    mentorId: mentor._id,
    leaveStartDate: "",
    leaveEndDate: "",
    isHalfDay: null,
    noOfDays: 0,
    typeOfLeave: "",
  });

  const handleForMedicalChange = (e) => {
    setForMedical(e.target.checked);
    setFormData({ ...formData, forMedical: e.target.checked });
  };

  const calculateDays = () => {
    const { leaveStartDate, leaveEndDate } = formData;

    if (!leaveStartDate || !leaveEndDate) return;

    const startDate = new Date(leaveStartDate);
    const endDate = new Date(leaveEndDate);

    let totalDays = 0;
    let isSecondSaturdayInRange = false;

    // Ensure startDate is not after endDate
    if (startDate > endDate) {
      console.error("Start date must not be after end date");
      return;
    }

    for (
      let date = new Date(startDate);
      date <= endDate;
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

    // Calculate the total number of days inclusive
    const differenceInTime = endDate.getTime() - startDate.getTime();
    const differenceInDays =
      Math.ceil(differenceInTime / (1000 * 3600 * 24)) + 1;

    setFormData((prevFormData) => ({
      ...prevFormData,
      noOfDays: totalDays,
      differenceInDays: differenceInDays,
    }));
  };

  useEffect(() => {
    if (forOneDay && formData.leaveStartDate) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        leaveEndDate: prevFormData.leaveStartDate,
      }));
    }
    calculateDays();
  }, [formData.leaveStartDate, formData.leaveEndDate, forOneDay]);

  const getISTTime = () => {
    const now = new Date();
    // Convert to IST (UTC+5:30)
    const istTime = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
    return {
      hours: istTime.getUTCHours(),
      minutes: istTime.getUTCMinutes(),
      date: istTime.toISOString().split("T")[0],
      timestamp: istTime.getTime(),
    };
  };

  const isAfterCutoffTime = () => {
    const { hours, minutes } = getISTTime();
    // Convert current time to minutes for easier comparison
    const currentTimeInMinutes = hours * 60 + minutes;
    // 8:00 AM in minutes = 8 * 60 = 480 minutes
    return currentTimeInMinutes >= 480;
  };

  const validateForm = () => {
    const newErrors = {};
    const { date: currentDateStr } = getISTTime();
    const isAfter8AM = isAfterCutoffTime();

    // Check if trying to apply leave for today
    if (formData.leaveStartDate === currentDateStr) {
      if (isAfter8AM && !isHalfDay) {
        newErrors.leaveStartDate =
          "Cannot apply full-day leave after 8:00 AM IST for today";
      }
    }

    if (!formData.departmentId) {
      newErrors.departmentId = "Department must be selected";
    }

    if (!formData.leaveStartDate) {
      newErrors.leaveStartDate = "Date from must be selected";
    } else if (formData.leaveStartDate < currentDateStr) {
      newErrors.leaveStartDate = "Date from must not be in the past";
    }

    if (!forOneDay && !isHalfDay && !formData.leaveEndDate) {
      newErrors.leaveEndDate = "Date to must be selected";
    } else if (
      formData.leaveEndDate &&
      formData.leaveEndDate < currentDateStr
    ) {
      newErrors.leaveEndDate = "Date to must not be in the past";
    } else if (
      !forOneDay &&
      formData.leaveEndDate &&
      formData.leaveEndDate < formData.leaveStartDate
    ) {
      newErrors.leaveEndDate = "Date to must be greater than Date from";
    }

    if (!formData.reason) {
      newErrors.reason = "Reason must be given";
    } else if (formData.reason.length > 50) {
      newErrors.reason = "Reason must be less than 50 characters";
    }

    return newErrors;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Validate dates immediately when they are selected
    if (
      e.target.name === "leaveStartDate" ||
      e.target.name === "leaveEndDate"
    ) {
      const { date: currentDateStr } = getISTTime();
      const isAfter8AM = isAfterCutoffTime();
      const newErrors = { ...errors };

      // Clear previous date-related errors
      delete newErrors.leaveStartDate;
      delete newErrors.leaveEndDate;

      if (e.target.name === "leaveStartDate") {
        if (e.target.value === currentDateStr && isAfter8AM && !isHalfDay) {
          newErrors.leaveStartDate =
            "Cannot apply full-day leave after 8:00 AM IST for today";
        } else if (e.target.value < currentDateStr) {
          newErrors.leaveStartDate = "Date from must not be in the past";
        }
      }

      if (e.target.name === "leaveEndDate") {
        if (e.target.value < currentDateStr) {
          newErrors.leaveEndDate = "Date to must not be in the past";
        } else if (e.target.value < formData.leaveStartDate) {
          newErrors.leaveEndDate = "Date to must be greater than Date from";
        }
      }

      setErrors(newErrors);
    }
  };

  const handleForOneDayChange = (e) => {
    setForOneDay(e.target.checked);
    if (e.target.checked) {
      setFormData({ ...formData, leaveEndDate: formData.leaveStartDate });
    }
  };

  const handleIsHalfDayChange = (selectedOption) => {
    const newIsHalfDay = isHalfDay === selectedOption ? null : selectedOption;
    setIsHalfDay(newIsHalfDay);

    // Clear any time-related errors when half-day is selected
    if (newIsHalfDay) {
      const newErrors = { ...errors };
      if (
        newErrors.leaveStartDate &&
        newErrors.leaveStartDate.includes("8:00 AM")
      ) {
        delete newErrors.leaveStartDate;
      }
      setErrors(newErrors);
    }

    setFormData({
      ...formData,
      isHalfDay: newIsHalfDay,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    try {
      setLoading(true);
      setErrorMessage(null);
      const res = await fetch("/api/leave-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          toDate: forOneDay ? formData.leaveStartDate : formData.leaveEndDate,
          forMedical: forMedical ? true : false,
        }),
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
        setTab("Your Leave Requests");
      }
    } catch (error) {
      setErrorMessage(
        "An error occurred while submitting the leave request. Please try again later."
      );
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto ">
      {/* Header with Leave Summary */}

      {/* Control flow secion */}
      <div className="flex flex-col sm:flex-row items-center justify-center m-6 space-y-2 sm:space-y-0 sm:space-x-2 text-center">
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

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg">
        <form onSubmit={handleSubmit} className="">
          {/* Persisting Issue Resolving */}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="inline-flex items-center px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                  <Calendar size={16} className="mr-2" />
                  Start Date<span className="text-red-400 ml-1">*</span>
                </Label>
                <input
                  type="date"
                  name="leaveStartDate"
                  value={formData.leaveStartDate}
                  onChange={handleChange}
                  className={`w-full rounded-lg border ${
                    errors.leaveStartDate
                      ? "border-red-500"
                      : "border-gray-300 dark:border-gray-600"
                  } shadow-sm text-sm p-3 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
                {errors.leaveStartDate && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle size={12} />
                    {errors.leaveStartDate}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="inline-flex items-center px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                  <Calendar size={16} className="mr-2" />
                  End Date<span className="text-red-400 ml-1">*</span>
                </Label>
                <input
                  type="date"
                  name="leaveEndDate"
                  value={formData.leaveEndDate}
                  onChange={handleChange}
                  disabled={forOneDay}
                  className={`w-full rounded-lg border dark:bg-gray-800 ${
                    errors.leaveEndDate
                      ? "border-red-500"
                      : "border-gray-300 dark:border-gray-600"
                  } shadow-sm text-sm p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    forOneDay ? "bg-gray-100 cursor-not-allowed" : ""
                  }`}
                />
                {errors.leaveEndDate && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle size={12} />
                    {errors.leaveEndDate}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Leave Type Options */}
          <div className="p-6 bg-gray-50 dark:bg-gray-700/30">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                  Leave Duration
                </h3>
                <div className="space-y-3">
                  <label className="flex items-center p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                    <Checkbox
                      id="forOneDay"
                      checked={forOneDay}
                      onChange={handleForOneDayChange}
                      className="text-[#1f3a6e] rounded"
                    />
                    <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                      Single Day Leave
                    </span>
                  </label>
                  <label className="flex items-center p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                    <Checkbox
                      id="forMedical"
                      checked={forMedical}
                      onChange={handleForMedicalChange}
                      className="text-[#1f3a6e] rounded"
                    />
                    <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                      Medical Leave
                    </span>
                  </label>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                  <Clock size={16} className="inline mr-2 text-gray-500" />
                  Half Day Options
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex items-center p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                    <Checkbox
                      id="FN"
                      checked={isHalfDay === "FN"}
                      onChange={() => handleIsHalfDayChange("FN")}
                      className="text-[#1f3a6e] rounded"
                    />
                    <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                      Forenoon
                    </span>
                  </label>
                  <label className="flex items-center p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                    <Checkbox
                      id="AN"
                      checked={isHalfDay === "AN"}
                      onChange={() => handleIsHalfDayChange("AN")}
                      className="text-[#1f3a6e] rounded"
                    />
                    <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                      Afternoon
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Reason Section */}
          <div className="px-6">
            <div className="space-y-3">
              <Label className="inline-flex items-center px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                <FileText size={16} className="mr-2" />
                Reason for Leave<span className="text-red-400 ml-1">*</span>
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
                } shadow-sm text-sm p-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                placeholder="Please provide a detailed reason for your leave request..."
              ></textarea>
              {errors.reason && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle size={12} />
                  {errors.reason}
                </p>
              )}
            </div>
          </div>

          <div className="p-6 bg-gray-50 dark:bg-gray-700/30">
            {errorMessage && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                <AlertCircle size={18} />
                {errorMessage}
              </div>
            )}
            {isAfterCutoffTime() &&
            !isHalfDay &&
            formData.leaveStartDate === getISTTime().date ? (
              <div className="mb-4 bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                <AlertCircle size={18} />
                You cannot apply for a full-day leave after 8:00 AM IST for
                today. Please select a half-day option if needed.
              </div>
            ) : (
              <button
                type="submit"
                className={`w-full ${
                  loading ||
                  Object.keys(errors).length > 0 ||
                  (isAfterCutoffTime() &&
                    formData.leaveStartDate === getISTTime().date &&
                    !isHalfDay)
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                } text-white py-3 rounded-lg font-medium transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg`}
                disabled={
                  loading ||
                  Object.keys(errors).length > 0 ||
                  (isAfterCutoffTime() &&
                    formData.leaveStartDate === getISTTime().date &&
                    !isHalfDay)
                }
              >
                {loading ? (
                  <ScaleLoader color="white" height={15} />
                ) : (
                  <>
                    <span>Request Leave</span>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      />
                    </svg>
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
