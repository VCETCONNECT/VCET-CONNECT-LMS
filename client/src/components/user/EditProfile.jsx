import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Modal, Button, Spinner } from "flowbite-react";
import {
  Eye,
  EyeOff,
  User,
  Mail,
  Phone,
  Hash,
  BookOpen,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Home,
  LogOut,
  Menu,
  Users,
  X,
} from "lucide-react";
import axios from "axios";
import { FaChalkboardTeacher } from "react-icons/fa";
import { MdSupervisorAccount } from "react-icons/md";
import { formatPhone } from "../../utils";
import {
  FaGithub,
  FaLinkedin,
  FaHackerrank,
  FaGlobe,
  FaFileAlt,
} from "react-icons/fa";
import { TbBrandLeetcode } from "react-icons/tb";
import LeetStats from "./LeetStats";
import PortfolioPage from "./PortfolioPage";
import ResumeViewer from "./ResumeVewer";
import GitStats from "./GitStats";

const EditProfile = ({ mentor, classIncharge, initialActiveTab }) => {
  const { currentUser } = useSelector((state) => state.user);
  const [isModalOpen, setIsModalOpen] = useState(
    initialActiveTab ? true : false
  );
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [feedback, setFeedback] = useState({ message: "", success: false });
  const [userData, setUserData] = useState(null);
  const [showProfileUpdateModal, setShowProfileUpdateModal] = useState(false);
  const [activeTab, setActiveTab] = useState(initialActiveTab || "profile");
  const [editData, setEditData] = useState({
    email: "",
    phone: "",
    oldPassword: "",
    newPassword: "",
    portfolio_url: "",
    resume_url: "",
    linkedin_url: "",
    github_url: "",
    hackerrank_url: "",
    leetcode_url: "",
  });

  const fetchUserData = async () => {
    try {
      setPageLoading(true);
      const response = await axios.get(
        `/api/user/${currentUser.userType.toLowerCase()}/${currentUser.id}`
      );
      setUserData(response.data);
      setEditData((prev) => ({
        ...prev,
        email: response.data.email || response.data.staff_mail || "",
        phone: response.data.phone || response.data.staff_phone || "",
        portfolio_url: response.data.portfolio_url || "",
        resume_url: response.data.resume_url || "",
        linkedin_url: response.data.linkedin_url || "",
        github_url: response.data.github_url || "",
        hackerrank_url: response.data.hackerrank_url || "",
        leetcode_url: response.data.leetcode_url || "",
      }));

      // Check if any required profile fields are empty
      if (
        !response.data.leetcode_url ||
        !response.data.linkedin_url ||
        !response.data.github_url ||
        !response.data.hackerrank_url ||
        !response.data.resume_url ||
        !response.data.portfolio_url
      ) {
        setShowProfileUpdateModal(true);

        setActiveTab("links");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [currentUser.id]);

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
    if (!isModalOpen) {
      setEditData({
        email: userData?.email || userData?.staff_mail || "",
        phone: userData?.phone || userData?.staff_phone || "",
        oldPassword: "",
        newPassword: "",
        portfolio_url: userData?.portfolio_url || "",
        resume_url: userData?.resume_url || "",
        linkedin_url: userData?.linkedin_url || "",
        github_url: userData?.github_url || "",
        hackerrank_url: userData?.hackerrank_url || "",
        leetcode_url: userData?.leetcode_url || "",
      });
      setShowOldPassword(false);
      setShowNewPassword(false);
      setFeedback({ message: "", success: false });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone") {
      // Remove any non-digit characters
      const sanitizedValue = value.replace(/\D/g, "");

      // Limit to 10 digits
      if (sanitizedValue.length <= 10) {
        setEditData((prev) => ({
          ...prev,
          [name]: sanitizedValue,
        }));
      }
    } else {
      setEditData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleUpdateProfile = async () => {
    if (editData.phone && editData.phone.length !== 10) {
      setFeedback({
        message: "Phone number must be exactly 10 digits",
        success: false,
      });
      return;
    }

    try {
      setLoading(true);
      const response = await axios.put(
        `/api/auth/updateProfile/${currentUser.userType}/${currentUser.id}`,
        {
          email: editData.email,
          phone: editData.phone,
          portfolio_url: editData.portfolio_url,
          resume_url: editData.resume_url,
          linkedin_url: editData.linkedin_url,
          github_url: editData.github_url,
          hackerrank_url: editData.hackerrank_url,
          leetcode_url: editData.leetcode_url,
        }
      );
      setFeedback({ message: response.data.message, success: true });
      await fetchUserData();
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "An error occurred.";
      setFeedback({ message: errorMessage, success: false });
    } finally {
      setLoading(false);
    }
  };

  const handleSavePassword = async () => {
    if (!editData.oldPassword || !editData.newPassword) {
      setFeedback({
        message: "Both password fields are required.",
        success: false,
      });
      return;
    }
    try {
      setLoading(true);
      const response = await axios.put(
        `/api/auth/changePassword/${currentUser.userType}/${currentUser.id}`,
        {
          oldPassword: editData.oldPassword,
          newPassword: editData.newPassword,
        }
      );
      setFeedback({ message: response.data.message, success: true });
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "An error occurred.";
      setFeedback({ message: errorMessage, success: false });
    } finally {
      setLoading(false);
    }
  };

  const renderModalContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={editData.email}
                onChange={handleInputChange}
                className="w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm px-3 py-2 text-sm dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Phone
              </label>
              <div className="relative">
                <input
                  type="tel"
                  name="phone"
                  value={editData.phone}
                  onChange={handleInputChange}
                  maxLength={10}
                  placeholder="Enter 10 digit number"
                  className="w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm px-3 py-2 text-sm dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {editData.phone && editData.phone.length !== 10 && (
                  <p className="text-xs text-red-500 mt-1">
                    Phone number must be 10 digits
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      case "password":
        return (
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Old Password
              </label>
              <div className="relative">
                <input
                  type={showOldPassword ? "text" : "password"}
                  name="oldPassword"
                  value={editData.oldPassword}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm px-3 py-2 text-sm dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  name="newPassword"
                  value={editData.newPassword}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm px-3 py-2 text-sm dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
        );
      case "links":
        return (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Go to your profile on each platform and copy the URL to paste here
            </p>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Portfolio URL
              </label>
              <input
                type="url"
                name="portfolio_url"
                value={editData.portfolio_url}
                onChange={handleInputChange}
                className="w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm px-3 py-2 text-sm dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Resume URL
              </label>
              <input
                type="url"
                name="resume_url"
                value={editData.resume_url}
                onChange={handleInputChange}
                className="w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm px-3 py-2 text-sm dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                LinkedIn URL
              </label>
              <input
                type="url"
                name="linkedin_url"
                value={editData.linkedin_url}
                onChange={handleInputChange}
                className="w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm px-3 py-2 text-sm dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                GitHub URL
              </label>
              <input
                type="url"
                name="github_url"
                value={editData.github_url}
                onChange={handleInputChange}
                className="w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm px-3 py-2 text-sm dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                HackerRank URL
              </label>
              <input
                type="url"
                name="hackerrank_url"
                value={editData.hackerrank_url}
                onChange={handleInputChange}
                className="w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm px-3 py-2 text-sm dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                LeetCode URL
              </label>
              <input
                type="url"
                name="leetcode_url"
                value={editData.leetcode_url}
                onChange={handleInputChange}
                className="w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm px-3 py-2 text-sm dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (pageLoading) {
    return (
      <div className="w-full h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile & Basic Info */}
          <div className="lg:sticky lg:top-0 h-fit">
            {/* Profile Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
              {/* Profile Header */}
              <div className="relative">
                <div className="h-32 bg-slate-100 dark:bg-gradient-to-br dark:from-gray-700 dark:via-gray-800 dark:to-gray-900"></div>
                <div className="absolute -bottom-12 inset-x-0 flex justify-center">
                  <div className="w-24 h-24 bg-white dark:bg-gray-700 rounded-full p-1 shadow-xl">
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                      <User className="w-12 h-12 text-white" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile Content */}
              <div className="pt-16 px-6 pb-6">
                <div className="text-center mb-8 flex flex-col items-center justify-between">
                  <h2 className="text-2xl  text-gray-900 dark:text-white mb-2">
                    {userData?.name || userData?.staff_name}
                  </h2>
                  
                  <Button
                    onClick={toggleModal}
                    size="sm"
                    className="bg-blue-500 hover:bg-blue-600 text-white rounded-full px-6 py-2 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    Edit Profile
                  </Button>
                </div>

                {/* Information Cards */}
                <div className="space-y-6">
                  {/* Academic Info Card */}
                  <div className="border dark:border-gray-700 rounded-xl overflow-hidden">
                    <div className="bg-blue-50 dark:bg-gray-700 px-4 py-3 flex items-center gap-2">
                      <Hash className="w-5 h-5 text-blue-500" />
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        Academic Information
                      </h3>
                    </div>
                    <div className="p-4 grid gap-3">
                      <div className="flex justify-between items-center px-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Register No
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {currentUser.register_no}
                        </span>
                      </div>
                      <div className="flex justify-between items-center px-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Roll No
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {currentUser.roll_no}
                        </span>
                      </div>
                      <div className="flex justify-between items-center px-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Section
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {currentUser.section_name}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Contact Info Card */}
                  <div className="border dark:border-gray-700 rounded-xl overflow-hidden">
                    <div className="bg-blue-50 dark:bg-gray-700 px-4 py-3 flex items-center gap-2">
                      <Mail className="w-5 h-5 text-purple-500" />
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        Contact Information
                      </h3>
                    </div>
                    <div className="p-4 grid gap-3">
                      <div className="flex justify-between items-center px-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Email
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {userData?.email || userData?.staff_mail}
                        </span>
                      </div>
                      <div className="flex justify-between items-center px-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Phone
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {formatPhone(
                            userData?.phone || userData?.staff_phone
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between items-center px-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Parent Phone
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {formatPhone(userData?.parent_phone)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Stats & Links */}
          <div className="lg:col-span-2">
            <div className="space-y-6 lg:h-[90vh] lg:overflow-y-auto lg:pr-4 pb-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-2 gap-4">
                <StatBox
                  icon={<BookOpen className="w-6 h-6 text-blue-600" />}
                  label="Semesters"
                  value={
                    Object.values(userData?.semester_results || {}).length || 0
                  }
                />
                <StatBox
                  icon={<Hash className="w-6 h-6 text-purple-600" />}
                  label="Subjects"
                  value={
                    Object.values(userData?.semester_results || {}).reduce(
                      (acc, sem) => acc + Object.values(sem || {}).length,
                      0
                    ) || 0
                  }
                />
                <StatBox
                  icon={
                    <FaChalkboardTeacher className="w-6 h-6 text-green-600" />
                  }
                  label="Class Incharge"
                  value={classIncharge?.staff_name || "Loading..."}
                  isText
                />
                <StatBox
                  icon={
                    <MdSupervisorAccount className="w-6 h-6 text-orange-600" />
                  }
                  label="Mentor"
                  value={mentor?.staff_name || "Loading..."}
                  isText
                />
              </div>

              {/* Professional Links Grid */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <div className="flex flex-col space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Professional Links
                    </h3>
                    {showProfileUpdateModal && (
                      <Button
                        onClick={() => {
                          setIsModalOpen(true);
                          setActiveTab("links");
                        }}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors duration-200"
                      >
                        Add Missing Links
                      </Button>
                    )}
                  </div>

                  {showProfileUpdateModal && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800/50 dark:to-gray-700/50 rounded-xl p-4 mb-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                          <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          Complete your profile by adding the missing
                          professional links
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {!userData?.leetcode_url && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-white/50 dark:bg-gray-800/50 rounded-lg text-xs text-gray-700 dark:text-gray-300">
                            <TbBrandLeetcode className="w-3 h-3 text-yellow-600" />
                            LeetCode
                          </span>
                        )}
                        {!userData?.github_url && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-white/50 dark:bg-gray-800/50 rounded-lg text-xs text-gray-700 dark:text-gray-300">
                            <FaGithub className="w-3 h-3 text-gray-700" />
                            GitHub
                          </span>
                        )}
                        {!userData?.linkedin_url && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-white/50 dark:bg-gray-800/50 rounded-lg text-xs text-gray-700 dark:text-gray-300">
                            <FaLinkedin className="w-3 h-3 text-blue-600" />
                            LinkedIn
                          </span>
                        )}
                        {!userData?.hackerrank_url && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-white/50 dark:bg-gray-800/50 rounded-lg text-xs text-gray-700 dark:text-gray-300">
                            <FaHackerrank className="w-3 h-3 text-green-600" />
                            HackerRank
                          </span>
                        )}
                        {!userData?.resume_url && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-white/50 dark:bg-gray-800/50 rounded-lg text-xs text-gray-700 dark:text-gray-300">
                            <FaFileAlt className="w-3 h-3 text-red-600" />
                            Resume
                          </span>
                        )}
                        {!userData?.portfolio_url && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-white/50 dark:bg-gray-800/50 rounded-lg text-xs text-gray-700 dark:text-gray-300">
                            <FaGlobe className="w-3 h-3 text-purple-600" />
                            Portfolio
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    <ProfessionalLink
                      icon={<TbBrandLeetcode className="w-5 h-5" />}
                      label="LeetCode"
                      url={userData?.leetcode_url}
                      bgColor="bg-yellow-500"
                    />
                    <ProfessionalLink
                      icon={<FaLinkedin className="w-5 h-5" />}
                      label="LinkedIn"
                      url={userData?.linkedin_url}
                      bgColor="bg-blue-600"
                    />
                    <ProfessionalLink
                      icon={<FaGithub className="w-5 h-5" />}
                      label="GitHub"
                      url={userData?.github_url}
                      bgColor="bg-gray-800"
                    />
                    <ProfessionalLink
                      icon={<FaHackerrank className="w-5 h-5" />}
                      label="HackerRank"
                      url={userData?.hackerrank_url}
                      bgColor="bg-green-600"
                    />
                    <ProfessionalLink
                      icon={<FaFileAlt className="w-5 h-5" />}
                      label="Resume"
                      url={userData?.resume_url}
                      bgColor="bg-green-500"
                    />
                    <ProfessionalLink
                      icon={<FaGlobe className="w-5 h-5" />}
                      label="Your Site"
                      url={userData?.portfolio_url}
                      bgColor="bg-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* GitHub Stats */}
              {/* {userData?.github_url && (
                <div className="lg:col-span-2">
                  <GitStats github_url={userData.github_url} />
                </div>
              )} */}

              {/* LeetCode Stats */}
              {userData?.leetcode_url && (
                <div className="lg:col-span-2">
                  <LeetStats leetcode_url={userData.leetcode_url} />
                </div>
              )}

              {/* Resume Viewer */}
              {userData?.resume_url && (
                <div className="col-span-1">
                  <ResumeViewer resume_url={userData.resume_url} />
                </div>
              )}

              {/* Portfolio Page */}
              {userData?.portfolio_url && (
                <div className="col-span-1">
                  <PortfolioPage portfolio_url={userData.portfolio_url} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      <Modal show={isModalOpen} onClose={toggleModal} size="md">
        <Modal.Header className="border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="flex space-x-4">
            <button
              className={`text-sm font-medium ${
                activeTab === "profile"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("profile")}
            >
              Edit Profile
            </button>
            <button
              className={`text-sm font-medium ${
                activeTab === "password"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("password")}
            >
              Change Password
            </button>
            <button
              className={`text-sm font-medium ${
                activeTab === "links"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("links")}
            >
              Academic Links
            </button>
          </div>
        </Modal.Header>
        <Modal.Body className="p-4">
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
          {renderModalContent()}
        </Modal.Body>
        <Modal.Footer className="border-t border-gray-200 dark:border-gray-700 p-4">
          <Button
            onClick={
              activeTab === "profile"
                ? handleUpdateProfile
                : activeTab === "password"
                ? handleSavePassword
                : handleUpdateProfile
            }
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
    </div>
  );
};

const StatBox = ({ icon, label, value, isText }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
    <div className="flex items-center gap-3 mb-2">
      {icon}
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
    <p
      className={`font-semibold ${
        isText ? "text-sm" : "text-2xl"
      } text-gray-900 dark:text-white truncate`}
    >
      {value}
    </p>
    </div>
  </div>
);

const ProfessionalLink = ({ icon, label, url, bgColor }) => {
  const isActive = !!url;

  return (
    <div className="group relative">
      {url ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className={`block p-4 rounded-xl ${
            isActive
              ? `${bgColor} hover:opacity-90`
              : "bg-gray-100 dark:bg-gray-700"
          } transition-all duration-200`}
        >
          <div className="flex items-center gap-3">
            <div className="text-white">{icon}</div>
            <p className="text-sm font-medium text-white">{label}</p>
          </div>
        </a>
      ) : (
        <div className="p-4 rounded-xl bg-gray-100 dark:bg-gray-700">
          <div className="flex items-center gap-3">
            <div className="text-gray-400 dark:text-gray-500">{icon}</div>
            <p className="text-sm font-medium text-gray-400 dark:text-gray-500">
              {label}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// New InfoGroup component for organizing information
const InfoGroup = ({ icon, label, items }) => (
  <div className="space-y-3">
    <div className="flex items-center gap-2 mb-2">
      {icon}
      <h4 className="font-medium text-gray-900 dark:text-white">{label}</h4>
    </div>
    <div className="pl-2 space-y-2">
      {items.map(
        (item, index) =>
          item.value && (
            <div
              key={index}
              className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
            >
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {item.label}
                </p>
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {item.value}
                </p>
              </div>
            </div>
          )
      )}
    </div>
  </div>
);

export default EditProfile;
