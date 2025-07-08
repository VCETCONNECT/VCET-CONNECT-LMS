import React, { useState, useEffect } from "react";
import { Label, Checkbox } from "flowbite-react";
import { Calendar, FileText, AlertCircle, Clock } from "lucide-react";
import { ScaleLoader } from "react-spinners";

export default function LeaveRequestFormByStaff() {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [studentDetails, setStudentDetails] = useState(null);
  const [isHalfDay, setIsHalfDay] = useState(null);
  const [forOneDay, setForOneDay] = useState(false);

  const [formData, setFormData] = useState({
    rollNo: "",
    studentName: "",
    parent_phone: "",
    userId: "",
    email: "",
    regNo: "",
    batchId: "",
    year: "",
    department: "",
    departmentId: "",
    sectionName: "",
    sectionId: "",
    mentorName: "",
    mentorId: "",
    classInchargeName: "",
    classInchargeId: "",
    leaveStartDate: "",
    leaveEndDate: "",
    reason: "",
    forMedical: false,
    isHalfDay: null,
    typeOfLeave: "casual",
  });

  const handleIsHalfDayChange = (selectedOption) => {
    const newIsHalfDay = isHalfDay === selectedOption ? null : selectedOption;
    setIsHalfDay(newIsHalfDay);
    setFormData({
      ...formData,
      isHalfDay: newIsHalfDay,
    });
  };

  const handleForOneDayChange = (e) => {
    setForOneDay(e.target.checked);
    if (e.target.checked) {
      setFormData({ ...formData, leaveEndDate: formData.leaveStartDate });
    }
  };

  const handleRollNoChange = async (e) => {
    let rollNo = e.target.value;
    rollNo = rollNo.toUpperCase();
    setFormData({ ...formData, rollNo });

    if (rollNo.length >= 7) {
      try {
        // First fetch student ID using roll number
        const studentResponse = await fetch(
          `/api/defaulter/getStudentDetailsByRollforDefaulters/${rollNo}`
        );
        const studentData = await studentResponse.json();

        if (studentResponse.ok && studentData && studentData.studentId) {
          // Then fetch complete student details using the ID
          const detailsResponse = await fetch(
            `/api/user/student/${studentData.studentId}`
          );
          const completeDetails = await detailsResponse.json();

          if (detailsResponse.ok && completeDetails) {
            setStudentDetails(completeDetails);
            setFormData((prev) => ({
              ...prev,
              studentName: completeDetails.name || "",
              parent_phone: completeDetails.parent_phone || "",
              userId: completeDetails._id || null,
              email: completeDetails.email || "",
              regNo: completeDetails.register_no || "",
              batchId: completeDetails.batchId || null,
              year: completeDetails.year || "",
              departmentId: completeDetails.departmentId || null,
              sectionName: completeDetails.section_name || "",
              sectionId: completeDetails.sectionId || null,
              mentorName: studentData.mentorName || "",
              mentorId: studentData.mentorId || null,
              classInchargeName: studentData.classInchargeName || "",
              classInchargeId: studentData.classInchargeId || null,
              rollNo: rollNo,
            }));
            setErrorMessage(null);
          } else {
            throw new Error("Failed to fetch complete student details");
          }
        } else {
          setFormData((prev) => ({
            ...prev,
            studentName: "",
            parent_phone: "",
            userId: null,
            email: "",
            regNo: "",
            batchId: null,
            year: "",
            departmentId: null,
            sectionName: "",
            sectionId: null,
            mentorName: "",
            mentorId: null,
            classInchargeName: "",
            classInchargeId: null,
          }));
          setErrorMessage("Student not found");
          setStudentDetails(null);
        }
      } catch (error) {
        console.error("Error fetching student data:", error);
        setErrorMessage("Error fetching student data");
        setStudentDetails(null);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage(null);
    if (!studentDetails || !studentDetails._id) {
      setErrorMessage("Please enter a valid roll number");
      return;
    }

    if (
      !formData.leaveStartDate ||
      !formData.leaveEndDate ||
      !formData.reason ||
      !formData.mentorId ||
      !formData.classInchargeId
    ) {
      setErrorMessage("Please fill all required fields");
      return;
    }

    // Validate dates
    const startDate = new Date(formData.leaveStartDate);
    const endDate = new Date(formData.leaveEndDate);

    // Additional date validations
    if (startDate > endDate) {
      setErrorMessage("Start date cannot be after end date");
      return;
    }

    if (startDate < new Date().setHours(0, 0, 0, 0)) {
      setErrorMessage("Cannot apply leave for past dates");
      return;
    }

    // Calculate number of days
    const noOfDays =
      Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
    setLoading(true);

    try {
      const response = await fetch("/api/leave-request-staff", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: studentDetails._id,
          name: formData.studentName,
          userType: "Student",
          rollNo: formData.rollNo,
          regNo: formData.regNo,
          email: formData.email,
          parent_phone: formData.parent_phone,
          batchId: formData.batchId,
          sectionId: formData.sectionId,
          section_name: formData.sectionName,
          departmentId: formData.departmentId,
          mentorId: formData.mentorId,
          classInchargeId: formData.classInchargeId,
          leaveStartDate: formData.leaveStartDate,
          leaveEndDate: forOneDay
            ? formData.leaveStartDate
            : formData.leaveEndDate,
          reason: formData.reason,
          noOfDays: noOfDays,
          forMedical: formData.forMedical,
          isHalfDay: formData.isHalfDay,
          approvals: {
            mentor: {
              status: "approved",
              date: new Date(),
            },
            classIncharge: {
              status: "approved",
              date: new Date(),
            },
          },
          status: "approved",
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create leave request");
      }

      // Reset form on success
      setFormData({
        rollNo: "",
        studentName: "",
        parent_phone: "",
        userId: "",
        email: "",
        regNo: "",
        batchId: "",
        year: "",
        departmentId: "",
        sectionName: "",
        sectionId: "",
        mentorName: "",
        mentorId: "",
        classInchargeName: "",
        classInchargeId: "",
        leaveStartDate: "",
        leaveEndDate: "",
        reason: "",
        forMedical: false,
        isHalfDay: null,
        typeOfLeave: "casual",
      });
      setStudentDetails(null);
      setIsHalfDay(null);
      setForOneDay(false);
      setErrorMessage(null);
      setSuccessMessage("Leave request created successfully!");
    } catch (error) {
      console.error("Error creating leave request:", error);
      setErrorMessage(error.message || "Failed to create leave request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="p-6">
            <div className="space-y-4">
              {/* Roll Number Input */}
              <div>
                <Label className="block mb-2">
                  Student Roll No<span className="text-red-400 ml-1">*</span>
                </Label>
                <input
                  type="text"
                  name="rollNo"
                  value={formData.rollNo}
                  onChange={handleRollNoChange}
                  placeholder="Enter student roll number"
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 shadow-sm text-sm p-3"
                />
              </div>

              {/* Student Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="block mb-2">Student Name : {formData.studentName}</Label>
                </div>
                <div>
                  <Label className="block mb-2">Parent Phone : {formData.parent_phone}</Label>
                </div>
                {/* <div>
                  <Label className="block mb-2">Section</Label>
                  <input
                    type="text"
                    value={formData.sectionName}
                    readOnly
                    className="w-full rounded-lg border border-gray-300 bg-gray-50 dark:border-gray-600 shadow-sm text-sm p-3"
                  />
                </div> */}
                <div>
                  <Label className="block mb-2">Mentor : {formData.mentorName}</Label>
                </div>
                <div>
                  <p className="block mb-2">Class Incharge : {formData.classInchargeName}</p>
                </div>
              </div>

              <div className="">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="inline-flex items-center mb-2">
                      <Calendar size={16} className="mr-2" />
                      Start Date<span className="text-red-400 ml-1">*</span>
                    </Label>
                    <input
                      type="date"
                      name="leaveStartDate"
                      value={formData.leaveStartDate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          leaveStartDate: e.target.value,
                        })
                      }
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 shadow-sm text-sm p-3"
                    />
                  </div>
                  <div>
                    <Label className="inline-flex items-center mb-2">
                      <Calendar size={16} className="mr-2" />
                      End Date<span className="text-red-400 ml-1">*</span>
                    </Label>
                    <input
                      type="date"
                      name="leaveEndDate"
                      value={formData.leaveEndDate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          leaveEndDate: e.target.value,
                        })
                      }
                      disabled={forOneDay}
                      className={`w-full rounded-lg border border-gray-300 dark:border-gray-600 shadow-sm text-sm p-3 ${
                        forOneDay ? "bg-gray-100 cursor-not-allowed" : ""
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Leave Type Options */}
              <div className="dark:bg-gray-700/30">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white dark:bg-gray-800 rounded-lg">
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
                          checked={formData.forMedical}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              forMedical: e.target.checked,
                            })
                          }
                          className="text-[#1f3a6e] rounded"
                        />
                        <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                          Medical Leave
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg">
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

              {/* Reason Input */}
              <div>
                <Label className="inline-flex items-center mb-2">
                  <FileText size={16} className="mr-2" />
                  Reason<span className="text-red-400 ml-1">*</span>
                </Label>
                <textarea
                  name="reason"
                  value={formData.reason}
                  onChange={(e) =>
                    setFormData({ ...formData, reason: e.target.value })
                  }
                  rows="4"
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 shadow-sm text-sm p-3"
                  placeholder="Enter reason for leave..."
                />
              </div>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="px-6">
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                <AlertCircle size={18} />
                {errorMessage}
              </div>
            </div>
          )}

          {successMessage && (
            <div className="px-6">
              <div className="bg-green-100 border border-green-200 text-black-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                <AlertCircle size={18} />
                {successMessage}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="p-6 bg-gray-50 dark:bg-gray-700/30">
            <button
              type="submit"
              disabled={loading || !studentDetails}
              className={`w-full ${
                loading || !studentDetails
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
              } text-white py-3 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2`}
            >
              {loading ? (
                <ScaleLoader color="white" height={15} />
              ) : (
                "Create Leave Request"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
