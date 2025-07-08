import React from "react";
import { FaFileAlt, FaExternalLinkAlt, FaDownload } from "react-icons/fa";

const ResumeViewer = ({ resume_url }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <FaFileAlt className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="text-base font-medium text-gray-900 dark:text-white">
                Resume
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-[200px]">
                {resume_url}
              </p>
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <a
              href={resume_url}
              download
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
            >
              Download
              <FaDownload className="w-3 h-3" />
            </a>
            <a
              href={resume_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              View
              <FaExternalLinkAlt className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
      {/* <iframe
        src={resume_url}
        title="Resume Preview"
        className="w-full h-[60vh] rounded-b-2xl"
        loading="lazy"
      /> */}
    </div>
  );
};

export default ResumeViewer;
