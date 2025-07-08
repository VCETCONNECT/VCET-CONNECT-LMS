import React from "react";
import { UserPlus, GraduationCap } from "lucide-react";
import UploadExcel from "../excelUpload";

const DataUpload = ({ uploadType, setUploadType }) => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-6 text-gray-800 dark:text-gray-200">
          Data Upload
        </h2>
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setUploadType("student")}
            className={`flex items-center gap-2 flex-1 px-4 py-3 rounded-lg transition-colors ${
              uploadType === "student"
                ? "bg-blue-500 text-white shadow-lg dark:bg-blue-600 dark:hover:bg-blue-700"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600"
            }`}
          >
            <GraduationCap size={20} />
            Student Upload
          </button>
          <button
            onClick={() => setUploadType("staff")}
            className={`flex items-center gap-2 flex-1 px-4 py-3 rounded-lg transition-colors ${
              uploadType === "staff"
                ? "bg-blue-500 text-white shadow-lg dark:bg-blue-600 dark:hover:bg-blue-700"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600"
            }`}
          >
            <UserPlus size={20} />
            Staff Upload
          </button>
        </div>
        <UploadExcel type={uploadType} />
      </div>
    </div>
  );
};

export default DataUpload;
