import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  User,
  Mail,
  Phone,
  Building,
  Users,
  GraduationCap,
} from "lucide-react";
import { Modal, Button } from "flowbite-react";
import { Eye, EyeOff } from "lucide-react";
import axios from "axios";
const StaffProfile = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [staffProfile, setStaffProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [feedback, setFeedback] = useState({ message: "", success: false });

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
    setOldPassword("");
    setNewPassword("");
    setShowOldPassword(false);
    setShowNewPassword(false);
    setFeedback({ message: "", success: false });
  };

  const handleSavePassword = async () => {
    if (!oldPassword || !newPassword) {
      setFeedback({ message: "Both fields are required.", success: false });
      return;
    }

    try {
      setLoading(true);
      const response = await axios.put(
        `/api/auth/changePassword/${currentUser.userType}/${currentUser.userId}`,
        {
          oldPassword,
          newPassword,
        }
      );
      setFeedback({ message: response.data.message, success: true }); // Success feedback
    } catch (error) {
      const errorMessage =
        error.response && error.response.data.message
          ? error.response.data.message
          : "An error occurred.";
      setFeedback({ message: errorMessage, success: false }); // Error feedback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchStaffProfile = async () => {
      try {
        const response = await fetch(`/api/user/staff/${currentUser.userId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch profile");
        }
        const data = await response.json();
        setStaffProfile(data);
        setError(null);
      } catch (error) {
        console.error("Error fetching staff profile:", error);
        setError("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    if (currentUser?.userId) {
      fetchStaffProfile();
    }
  }, [currentUser?.userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1f3a6e]"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>;
  }

  return (
    <div className="w-full mx-auto p-4">
      {/* Profile Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Profile
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            View and manage your profile
          </p>
        </div>
      </div>
      <div className="bg-white flex items-center justify-between dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-full">
            <User size={40} className="text-[#1f3a6e] dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
              {staffProfile?.name}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Staff ID: {staffProfile?.staffId}
            </p>
          </div>
        </div>
        <div>
          <Button
            onClick={toggleModal}
            size="sm"
            className="rounded-lg bg-[#1f3a6e] hover:bg-[#0b1f44] transition-all duration-300"
          >
            <p className="text-white text-sm font-semibold">Change Password</p>
          </Button>
        </div>
      </div>
      <Modal show={isModalOpen} onClose={toggleModal} size="sm">
        <Modal.Header className="border-b border-gray-200 dark:border-gray-700 p-4">
          <span className="text-lg font-semibold">Change Password</span>
        </Modal.Header>
        <Modal.Body className="p-4">
          <div className="space-y-4">
            {feedback.message && (
              <div
                className={`p-3 rounded-lg text-sm ${
                  feedback.success
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}
              >
                {feedback.message}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Old Password
              </label>
              <div className="relative">
                <input
                  type={showOldPassword ? "text" : "password"}
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm px-3 py-2 text-sm dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter current password"
                />
                <button
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showOldPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm px-3 py-2 text-sm dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter new password"
                />
                <button
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer className="border-t border-gray-200 dark:border-gray-700 p-4">
          <Button
            onClick={handleSavePassword}
            disabled={loading}
            size="sm"
            className="rounded-lg"
          >
            {loading ? (
              <Spinner size="sm" />
            ) : (
              <p className="text-white">Save Changes</p>
            )}
          </Button>
          <Button
            onClick={toggleModal}
            color="gray"
            size="sm"
            className="rounded-lg"
          >
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
      {/* Contact Information */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Contact Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <Mail className="text-gray-500 dark:text-gray-400" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
              <p className="text-gray-900 dark:text-gray-100">
                {staffProfile?.email}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <Phone className="text-gray-500 dark:text-gray-400" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
              <p className="text-gray-900 dark:text-gray-100">
                {staffProfile?.phone}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Academic Information */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Academic Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <Building
                className="text-gray-500 dark:text-gray-400"
                size={20}
              />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Department
              </p>
              <p className="text-gray-900 dark:text-gray-100">
                {staffProfile?.department?.name}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <Users className="text-gray-500 dark:text-gray-400" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Section
              </p>
              <p className="text-gray-900 dark:text-gray-100">
                {staffProfile?.section?.name}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <GraduationCap
                className="text-gray-500 dark:text-gray-400"
                size={20}
              />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Batch</p>
              <p className="text-gray-900 dark:text-gray-100">
                {staffProfile?.batch?.name}
                {staffProfile?.batch?.year && ` (${staffProfile?.batch?.year})`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mentor Handling Information */}
      {staffProfile?.roles?.isMentor &&
        staffProfile?.mentorHandlingData?.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Mentor Handling Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {staffProfile.mentorHandlingData.map((data, index) => (
                <div
                  key={index}
                  className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                >
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Batch
                      </p>
                      <p className="text-gray-900 dark:text-gray-100">
                        {data.batch.name}{" "}
                        {data.batch.year && `(${data.batch.year})`}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Section
                      </p>
                      <p className="text-gray-900 dark:text-gray-100">
                        {data.section.name}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      {/* Roles */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Currently Assigned Roles
        </h2>
        <div className="flex flex-wrap gap-2">
          {staffProfile?.roles?.isMentor && (
            <span className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded-full text-sm">
              Mentor
            </span>
          )}
          {staffProfile?.roles?.isClassIncharge && (
            <span className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full text-sm">
              Class Incharge
            </span>
          )}
          {staffProfile?.roles?.isPEStaff && (
            <span className="px-3 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 rounded-full text-sm">
              PE Staff
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default StaffProfile;
