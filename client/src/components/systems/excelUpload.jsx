import React, { useState } from "react";
import { Button, Table, Modal } from "react-bootstrap";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { motion } from "framer-motion";
import { Upload, Eye, FileSpreadsheet, Loader2, X } from "lucide-react";

const UploadExcel = ({ type = "student" }) => {
  const [file, setFile] = useState(null);
  const [excelData, setExcelData] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [uploadResults, setUploadResults] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Define the column headers
  const columnHeaders =
    type === "student"
      ? [
          "Roll No",
          "Register No",
          "Name",
          "Email",
          "Phone",
          "Parent Phone",
          "Department",
          "Batch",
          "Section",
          "Mentor",
        ]
      : [
          "Staff ID",
          "Name",
          "Email",
          "Phone",
          "Department",
          "Batch",
          "Section",
          "Class Incharge",
          "Mentor",
          "HOD",
        ];

  const handleFileChange = (e) => {
    const uploadedFile = e.target.files[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      readExcelFile(uploadedFile);
    }
  };

  const readExcelFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target.result;
      const workbook = XLSX.read(data, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
        header: 1,
        raw: false,
      });

      const formattedData = sheetData
        .filter((row) => row.length > 0 && row[0])
        .map((row) => {
          const rowData = {};
          columnHeaders.forEach((header, index) => {
            rowData[header] = row[index] ? row[index].toString().trim() : "";
          });
          return rowData;
        });

      setExcelData(formattedData);
    };
    reader.readAsBinaryString(file);
  };

  const downloadReport = (data, type) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, type);
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const dataBlob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(dataBlob, `${type}_records.xlsx`);
  };

  const handleSubmit = async () => {
    if (!file || !excelData.length) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      const endpoint =
        type === "student"
          ? "/api/data/uploadData"
          : "/api/data/uploadStaffData";

      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Upload failed");
      }

      setUploadResults(result);
      setShowResults(true);
      setShowPreview(false);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Error uploading file: " + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const ResultsModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-8xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-800 rounded-t-lg">
          <h3 className="text-xl font-bold text-white">Upload Results</h3>
          <button
            onClick={() => {
              setShowResults(false);
              setFile(null);
              setExcelData([]);
              setUploadResults(null);
            }}
            className="text-gray-400 hover:text-white transition-colors"
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
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {/* Summary Section */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {Object.entries(uploadResults.summary).map(([key, value]) => (
              <div key={key} className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-500 uppercase">
                  {key}
                </h4>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
              </div>
            ))}
          </div>

          {/* Tabs for different record types */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {["successful", "duplicates", "errors"].map(
                  (type) =>
                    uploadResults.details[type].length > 0 && (
                      <div key={type} className="mb-6">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-semibold capitalize">
                            {type} Records ({uploadResults.details[type].length}
                            )
                          </h3>
                          <button
                            onClick={() =>
                              downloadReport(uploadResults.details[type], type)
                            }
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                          >
                            Download {type} List
                          </button>
                        </div>
                        <div className="bg-white shadow overflow-hidden rounded-lg">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                {Object.keys(
                                  uploadResults.details[type][0]
                                ).map((header) => (
                                  <th
                                    key={header}
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                  >
                                    {header}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {uploadResults.details[type].map(
                                (record, index) => (
                                  <tr key={index}>
                                    {Object.values(record).map((value, i) => (
                                      <td
                                        key={i}
                                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                                      >
                                        {value}
                                      </td>
                                    ))}
                                  </tr>
                                )
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )
                )}
              </nav>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <button
            onClick={() => {
              setShowResults(false);
              setFile(null);
              setExcelData([]);
              setUploadResults(null);
            }}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Upload {type === "student" ? "Student" : "Staff"} Data
      </h2>

      <div className="flex flex-wrap gap-4 mb-6">
        <label
          htmlFor="file-upload"
          className={`px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 cursor-pointer transition duration-200 flex items-center gap-2 ${
            isUploading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <FileSpreadsheet className="w-5 h-5" />
          Choose Excel File
          <input
            id="file-upload"
            type="file"
            accept=".xlsx, .xls"
            onChange={handleFileChange}
            className="hidden"
            disabled={isUploading}
          />
        </label>
      </div>

      {file && (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-gray-600 font-medium">
            Selected file: <span className="text-blue-600">{file.name}</span>
          </p>

          <div className="flex gap-4">
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-200 flex items-center gap-2"
              onClick={() => setShowPreview(true)}
              disabled={isUploading}
            >
              <Eye className="w-5 h-5" />
              Preview Data
            </button>

            <button
              className={`px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition duration-200 flex items-center gap-2 ${
                isUploading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={handleSubmit}
              disabled={isUploading}
            >
              <Upload className="w-5 h-5" />
              <span className="text-white">Upload Data</span>
            </button>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-xl font-bold">Excel Data Preview</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-6">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {columnHeaders.map((header, index) => (
                      <th
                        key={index}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {excelData.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {columnHeaders.map((header, cellIndex) => (
                        <td
                          key={cellIndex}
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                        >
                          {row[header]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowPreview(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showResults && uploadResults && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.95 }}
            className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-800 rounded-t-lg">
              <h3 className="text-xl font-bold text-white">Upload Results</h3>
              <button
                onClick={() => {
                  setShowResults(false);
                  setFile(null);
                  setExcelData([]);
                  setUploadResults(null);
                }}
                className="text-gray-400 hover:text-white transition-colors"
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
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-auto p-6">
              {/* Summary Section */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                {Object.entries(uploadResults.summary).map(([key, value]) => (
                  <div key={key} className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-500 uppercase">
                      {key}
                    </h4>
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                  </div>
                ))}
              </div>

              {/* Tabs for different record types */}
              <div className="mb-6">
                <div className="border-b border-gray-200">
                  <nav className="-mb-px flex space-x-8">
                    {["successful", "duplicates", "errors"].map(
                      (type) =>
                        uploadResults.details[type].length > 0 && (
                          <div key={type} className="mb-6">
                            <div className="flex justify-between items-center mb-4">
                              <h3 className="text-lg font-semibold capitalize">
                                {type} Records (
                                {uploadResults.details[type].length})
                              </h3>
                              <button
                                onClick={() =>
                                  downloadReport(
                                    uploadResults.details[type],
                                    type
                                  )
                                }
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                              >
                                Download {type} List
                              </button>
                            </div>
                            <div className="bg-white shadow overflow-hidden rounded-lg">
                              <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                  <tr>
                                    {Object.keys(
                                      uploadResults.details[type][0]
                                    ).map((header) => (
                                      <th
                                        key={header}
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                      >
                                        {header}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                  {uploadResults.details[type].map(
                                    (record, index) => (
                                      <tr key={index}>
                                        {Object.values(record).map(
                                          (value, i) => (
                                            <td
                                              key={i}
                                              className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                                            >
                                              {value}
                                            </td>
                                          )
                                        )}
                                      </tr>
                                    )
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )
                    )}
                  </nav>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowResults(false);
                  setFile(null);
                  setExcelData([]);
                  setUploadResults(null);
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Upload Progress Overlay */}
      {isUploading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-xl flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
            <p className="text-lg font-medium text-gray-700">
              Uploading {type === "student" ? "Student" : "Staff"} Data...
            </p>
            <p className="text-sm text-gray-500">Please wait...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadExcel;
