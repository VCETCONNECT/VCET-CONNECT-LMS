import React from "react";
import { FaGlobe, FaExternalLinkAlt } from "react-icons/fa";

const PortfolioPage = ({ portfolio_url }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <FaGlobe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-base font-medium text-gray-900 dark:text-white">
                Portfolio Website
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-[200px]">
                {portfolio_url}
              </p>
            </div>
          </div>
          <a
            href={portfolio_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Visit Site
            <FaExternalLinkAlt className="w-3 h-3" />
          </a>
        </div>
      </div>
      <iframe
        src={portfolio_url}
        title="Portfolio Preview"
        className="w-full h-[40vh] rounded-b-2xl"
        loading="lazy"
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  );
};

export default PortfolioPage;
