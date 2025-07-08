import { motion } from "framer-motion";
import { GraduationCap, Lock, User } from "lucide-react";
import React, { useState } from "react";
import { MdSupervisorAccount } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  signInFailure,
  signInStart,
  signInSuccess,
} from "../../redux/user/userSlice";
import { Lightbulb, Target, BookOpenCheck } from "lucide-react";
export default function SignIn() {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const { loading, error: errorMessage } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [selectRole, setSelectRole] = useState("student");

  const roleOptions = [
    {
      value: "student",
      label: "Student",
      icon: <GraduationCap className="h-6 w-6" />,
      description: "Access your leave & OD requests",
    },
    {
      value: "staff",
      label: "Staff",
      icon: <MdSupervisorAccount className="h-6 w-6" />,
      description: "Manage student requests & approvals",
    },
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value.trim() });
    // Clear error when user starts typing
    if (errors[e.target.id]) {
      setErrors({ ...errors, [e.target.id]: "" });
    }
  };

  const validateForm = () => {
    let formErrors = {};
    let isValid = true;

    if (!formData.identifier) {
      formErrors.identifier = "User Name is required";
      isValid = false;
    }

    if (!formData.password) {
      formErrors.password = "Password is required";
      isValid = false;
    }

    if (!selectRole) {
      formErrors.role = "Please select a role";
      isValid = false;
    }

    setErrors(formErrors);
    return isValid;
  };

  const isFormFilled =
    formData.identifier?.trim() &&
    formData.password?.trim() &&
    selectRole?.trim();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      dispatch(signInStart());
      const endpoint =
        selectRole === "student"
          ? "/api/auth/studentsignin"
          : "/api/auth/staffsignin";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        dispatch(signInFailure(data.message || "Invalid credentials"));
        return;
      }

      dispatch(signInSuccess(data));
      if (selectRole === "student") {
        navigate("/profile");
      } else if (data.isHod) {
        navigate("/hoddash");
      } else {
        navigate("/staffdashboard");
      }
    } catch (error) {
      dispatch(signInFailure("Something went wrong. Please try again."));
    }
  };

  return (
    <div className="min-h-[70vh] flex flex-col-reverse md:flex-row gap-2 items-center justify-evenly bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl w-full space-y-8 flex gap-8">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex-1 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-md space-y-6"
        >
          <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-4">
            Department of Computer Science and Engineering
          </h2>

          <div className="flex items-start gap-4">
            {/* <Lightbulb className="text-blue-600 dark:text-blue-400 w-6 h-6 mt-1" /> */}
            <div>
              <h3 className="text-xl text-blue-600 font-semibold mb-1">
                Vision of the Department
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                To become a Center of Excellence in the field of Computer
                Science and Engineering upholding social values.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            {/* <Target className="text-green-600 dark:text-green-400 w-6 h-6 mt-1" /> */}
            <div>
              <h3 className="text-xl text-blue-600 font-semibold mb-2">
                Mission of the Department
              </h3>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>
                    Heightening the knowledge of the faculty in recent trends
                    through continuous development programmes.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>
                    Transforming the students into globally competent and
                    technically well-equipped Computer Professionals with strong
                    theoretical and practical knowledge.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>
                    Cultivating the spirit of social and ethical values for the
                    cause of development of our Nation.
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <div className="flex items-start gap-4">
            {/* <BookOpenCheck className="text-purple-600 dark:text-purple-400 w-6 h-6 mt-1" /> */}
            <div>
              <h3 className="text-xl text-blue-600 font-semibold mb-2">
                Program Educational Objectives (PEOs)
              </h3>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 mt-1">1.</span>
                  <span>
                    Graduates work productively as successful employees with
                    problem-solving skills, core computing skills, professional
                    ethics and soft skills with social awareness.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 mt-1">2.</span>
                  <span>
                    Graduates participate in lifelong learning through
                    successful completion of higher education with Research and
                    Development.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 mt-1">3.</span>
                  <span>
                    Graduates become successful entrepreneurs with
                    determination, self-reliance, leadership, and moral values
                    to enhance employability and innovation.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="max-w-lg w-full space-y-8 flex gap-8">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex-1 bg-white dark:bg-gray-800 p-8 md:p-12 rounded-2xl shadow-md space-y-6"
        >
          <div className="text-center items-center flex flex-col gap-4">
            {/* <img
            src="/vcet.jpeg"
            alt="VCET Logo"
            className="h-20 w-20 rounded-full shadow-lg"
          /> */}
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Sign In
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Please select your role and enter your credentials
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {roleOptions.map((role) => (
              <button
                disabled={loading}
                key={role.value}
                onClick={() => setSelectRole(role.value)}
                className={`relative p-4 rounded-xl border-2 transition-all duration-200
                  ${
                    selectRole === role.value
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 shadow-md"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }
                `}
              >
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={
                      selectRole === role.value
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-gray-600 dark:text-gray-400"
                    }
                  >
                    {role.icon}
                  </div>
                  <span className="font-medium">{role.label}</span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {role.description}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {errors.role && (
            <p className="text-sm text-red-500 dark:text-red-400 text-center">
              {errors.role}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {selectRole === "student" ? "Roll Number" : "Staff ID"}
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <input
                    id="identifier"
                    type="text"
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-2.5 border ${
                      errors.identifier
                        ? "border-red-500 dark:border-red-500"
                        : "border-gray-300 dark:border-gray-600"
                    } rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-500 dark:focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors`}
                    placeholder={
                      selectRole === "student"
                        ? "Enter roll number"
                        : "Enter staff ID"
                    }
                  />
                </div>
                {errors.identifier && (
                  <p className="mt-1 text-sm text-red-500 dark:text-red-400">
                    {errors.identifier}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-2.5 border ${
                      errors.password
                        ? "border-red-500 dark:border-red-500"
                        : "border-gray-300 dark:border-gray-600"
                    } rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-500 dark:focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors`}
                    placeholder="Enter your password"
                  />
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-500 dark:text-red-400">
                    {errors.password}
                  </p>
                )}
              </div>
            </div>

            {errorMessage && (
              <div className="rounded-xl bg-red-50 dark:bg-red-900/30 p-4">
                <p className="text-sm text-red-600 dark:text-red-400 text-center">
                  {errorMessage}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !isFormFilled}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                "Sign In"
              )}
            </button>
            <div className="flex items-center justify-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                <Link
                  to="/forgotpassword"
                  className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Forgot Password?
                </Link>
              </p>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
