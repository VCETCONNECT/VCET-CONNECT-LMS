import React, { useState } from "react";
import StudentAnalytics from "./StudentAnalytics";
import AIIntegrations from "./AIIntegrations";
import { FcGoogle } from "react-icons/fc";

const Academics = ({ student }) => {
  const [updatedStudent, setUpdatedStudent] = useState(student);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);

  const handleResultsUpdate = (newResults) => {
    setUpdatedStudent((prev) => ({
      ...prev,
      semester_results: newResults,
    }));
  };

  return (
    <div className="relative w-full">
      <div className="w-full">
        <StudentAnalytics
          student={updatedStudent}
          department={student.departmentId}
          onResultsSave={handleResultsUpdate}
        />
      </div>

      {/* Floating AI Chat Button */}
      <button
        onClick={() => setIsAIChatOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-white hover:bg-gray-200 text-black rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 z-50"
      >
        <FcGoogle className="w-6 h-6" />
      </button>

      {/* AI Chat Modal */}
      {isAIChatOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg h-[80vh] flex flex-col relative">
            <button
              onClick={() => setIsAIChatOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <AIIntegrations student={updatedStudent} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Academics;
