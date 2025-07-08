import React, { useState } from "react";
import { Label, Checkbox } from "flowbite-react";
import { useSelector } from "react-redux";
import { ScaleLoader } from "react-spinners";
import {
  FileText,
  AlertCircle,
  Building2,
  GraduationCap,
  Home,
  Construction,
  ChevronRight,
  Upload,
} from "lucide-react";
import { motion } from "framer-motion";


export default function BonafiedRequestForm({ setTab }) {
  const { currentUser } = useSelector((state) => state.user);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [errors, setErrors] = useState({});
  const [attachment, setAttachment] = useState(null);
  const [inDevelopment , setInDevelopment] = useState(true);
  const [formData, setFormData] = useState({
    studentId: currentUser.id,
    studentName: currentUser.name,
    batchId: currentUser.batchId,
    rollNo: currentUser.roll_no,
    class: `${currentUser.degree} ${currentUser.branch} ${currentUser.year} Year`,
    admittedQuota: "Government", // default value
    stayType: "Day", // default value
    feesPaid: false,
    attachments: "",
    sectionId: currentUser.sectionId,

    reason: "",
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setAttachment(file);
      // You can add file validation here if needed
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.admittedQuota) {
      newErrors.admittedQuota = "Admitted quota is required";
    }

    if (!formData.stayType) {
      newErrors.stayType = "Stay type is required";
    }

    if (!formData.reason) {
      newErrors.reason = "Reason is required";
    } else if (formData.reason.length > 200) {
      newErrors.reason = "Reason must be less than 200 characters";
    }

    if (!formData.feesPaid) {
      newErrors.feesPaid = "You must confirm that fees are paid";
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

      // Handle file upload first if there's an attachment
      let attachmentUrl = "";
      if (attachment) {
        const formData = new FormData();
        formData.append("file", attachment);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) {
          throw new Error("Failed to upload attachment");
        }

        const uploadData = await uploadRes.json();
        attachmentUrl = uploadData.url;
      }

      const requestBody = {
        ...formData,
        attachments: attachmentUrl,
      };

      const res = await fetch("/api/bonafied-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await res.json();
      if (!data.success) {
        setErrorMessage(data.message);
        setLoading(false);
        return;
      }

      if (res.ok) {
        setLoading(false);
        setTab("Your Bonafied Requests");
      }
    } catch (error) {
      setErrorMessage(
        "An error occurred while submitting the bonafied request. Please try again later."
      );
      setLoading(false);
    }
  };

  const ErrorMessage = ({ error }) => {
    if (!error) return null;
    return (
      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
        <AlertCircle size={12} />
        {error}
      </p>
    );
  };

  if (inDevelopment) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto p-6"
      >
        <motion.div 
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-blue-500 dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden p-8"
        >
          <motion.h2 
            initial={{ x: -20 }}
            animate={{ x: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="text-2xl font-semibold text-white dark:text-white flex items-center gap-3 mb-4"
          >
            <Construction size={50} />
            Under Development
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.6 }}
            className="text-white dark:text-gray-300"
          >
            We're working hard to bring you this feature soon. Please check back later!
          </motion.p>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header with Gradient Background */}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        {errorMessage && (
          <div className="m-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
            <AlertCircle size={16} />
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Student Information Section */}

          {/* Request Details Section */}
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Building2 size={20} />
              Request Details
            </h2>

            {/* Admission Quota */}
            <div className="space-y-2">
              <Label className="inline-flex items-center px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                Admitted Quota<span className="text-red-400 ml-1">*</span>
              </Label>
              <div className="flex gap-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="admittedQuota"
                    value="Government"
                    checked={formData.admittedQuota === "Government"}
                    onChange={handleChange}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span>Government</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="admittedQuota"
                    value="Management"
                    checked={formData.admittedQuota === "Management"}
                    onChange={handleChange}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span>Management</span>
                </label>
              </div>
              <ErrorMessage error={errors.admittedQuota} />
            </div>

            {/* Stay Type */}
            <div className="space-y-2">
              <Label className="inline-flex items-center px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                <Home size={16} className="mr-2" />
                Stay Type<span className="text-red-400 ml-1">*</span>
              </Label>
              <div className="flex gap-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="stayType"
                    value="Day"
                    checked={formData.stayType === "Day"}
                    onChange={handleChange}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span>Day Scholar</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="stayType"
                    value="Hostel"
                    checked={formData.stayType === "Hostel"}
                    onChange={handleChange}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span>Hostel</span>
                </label>
              </div>
              <ErrorMessage error={errors.stayType} />
            </div>

            {/* Reason */}
            <div className="space-y-2">
              <Label className="inline-flex items-center px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                <FileText size={16} className="mr-2" />
                Reason for Request<span className="text-red-400 ml-1">*</span>
              </Label>
              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                rows="4"
                className={`w-full rounded-lg border ${
                  errors.reason ? "border-red-500" : "border-gray-300"
                } p-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none`}
                placeholder="Please provide the reason for requesting bonafied certificate..."
              />
              <ErrorMessage error={errors.reason} />
            </div>

            {/* Fees Confirmation */}
            <div className="space-y-2">
              <label className="flex items-center p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                <Checkbox
                  id="feesPaid"
                  name="feesPaid"
                  checked={formData.feesPaid}
                  onChange={handleChange}
                  className="text-[#1f3a6e] rounded"
                />
                <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                  I confirm that I have paid all the required fees
                </span>
              </label>
              <ErrorMessage error={errors.feesPaid} />
            </div>

            {/* File Upload */}
            <div className="space-y-2">
              <Label className="inline-flex items-center px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                <Upload size={16} className="mr-2" />
                Supporting Documents (Required)
              </Label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                      <span>Upload a file</span>
                      <input
                        type="file"
                        className="sr-only"
                        onChange={handleFileChange}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PDF, PNG, JPG up to 10MB
                  </p>
                </div>
              </div>
              {attachment && (
                <p className="text-sm text-gray-500">
                  Selected file: {attachment.name}
                </p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
            disabled={loading}
          >
            {loading ? (
              <ScaleLoader color="white" height={15} />
            ) : (
              <>
                Submit Bonafied Request
                <ChevronRight size={20} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
