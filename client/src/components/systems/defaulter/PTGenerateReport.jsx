import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import collegelogo from "../../../../public/vcet.jpeg";
import { FileText, Download, Filter, X } from "lucide-react";

export default function PTGenerateReport() {
  const [defaulterType, setDefaulterType] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [mentorFilter, setMentorFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [sectionFilter, setSectionFilter] = useState("");
  const navigate = useNavigate();

  // Filter the data based on the filter criteria
  useEffect(() => {
    const filterData = () => {
      let filtered = reportData;
      if (mentorFilter) {
        filtered = filtered.filter((item) =>
          item.mentorName?.toLowerCase().includes(mentorFilter.toLowerCase())
        );
      }
      if (departmentFilter) {
        filtered = filtered.filter((item) =>
          item.departmentName
            ?.toLowerCase()
            .includes(departmentFilter.toLowerCase())
        );
      }
      if (sectionFilter) {
        filtered = filtered.filter((item) =>
          item.section_name?.toLowerCase().includes(sectionFilter.toLowerCase())
        );
      }
      setFilteredData(filtered);
    };
    filterData();
  }, [reportData, mentorFilter, departmentFilter, sectionFilter]);

  const handleGenerateReport = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const apiUrl = `/api/defaulter/getDefaulterReport/${defaulterType}/${fromDate}/${toDate}`;
    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(
          `Failed to generate the report. Status: ${response.status}`
        );
      }
      const data = await response.json();
      setReportData(data.defaulterReport);
      setFilteredData(data.defaulterReport);
    } catch (error) {
      console.error("Error generating report:", error);
      setError("Details Not Found");
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    const doc = new jsPDF("l", "mm", "a4");
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 10;

    doc.addImage(collegelogo, "PNG", margin, margin, 25, 25);

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(
      "VELAMMAL COLLEGE OF ENGINEERING AND TECHNOLOGY",
      pageWidth / 2,
      margin + 10,
      {
        align: "center",
      }
    );

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("(An Autonomous Institution)", pageWidth / 2, margin + 15, {
      align: "center",
    });
    doc.text(
      "Velammal Nagar Viraganoor - Madurai 625009",
      pageWidth / 2,
      margin + 20,
      {
        align: "center",
      }
    );

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    const title = `Defaulters Report - ${defaulterType}`;
    doc.text(title, pageWidth / 2, margin + 35, { align: "center" });

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Period: ${new Date(fromDate).toLocaleDateString()} to ${new Date(
        toDate
      ).toLocaleDateString()}`,
      pageWidth / 2,
      margin + 42,
      { align: "center" }
    );

    let filterText = "";
    if (departmentFilter) filterText += `Department: ${departmentFilter} `;
    if (sectionFilter) filterText += `Section: ${sectionFilter}`;
    if (filterText) {
      doc.text(filterText, pageWidth / 2, margin + 48, { align: "center" });
    }

    doc.autoTable({
      startY: margin + 55,
      head: [
        [
          { content: "S.No", styles: { halign: "center" } },
          { content: "Roll No", styles: { halign: "center" } },
          { content: "Student Name", styles: { halign: "left" } },
          { content: "Department", styles: { halign: "center" } },
          { content: "Year", styles: { halign: "center" } },
          { content: "Section", styles: { halign: "center" } },
          { content: "Mentor", styles: { halign: "left" } },
          { content: "Date", styles: { halign: "center" } },
          { content: "Type", styles: { halign: "center" } },
        ],
      ],
      body: filteredData.map((item, index) => [
        { content: index + 1, styles: { halign: "center" } },
        { content: item.roll_no, styles: { halign: "center" } },
        { content: item.studentName, styles: { halign: "left" } },
        { content: item.departmentName, styles: { halign: "center" } },
        { content: item.year, styles: { halign: "center" } },
        { content: item.section_name, styles: { halign: "center" } },
        { content: item.mentorName, styles: { halign: "left" } },
        {
          content: new Date(item.entryDate).toLocaleDateString(),
          styles: { halign: "center" },
        },
        { content: item.defaulterType, styles: { halign: "center" } },
      ]),
      styles: {
        fontSize: 10,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [71, 85, 105],
        textColor: 255,
        fontSize: 11,
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      tableLineColor: [226, 232, 240],
      tableLineWidth: 0.1,
      margin: { top: margin, right: margin, bottom: margin, left: margin },
    });

    const pageCount = doc.internal.getNumberOfPages();
    doc.setFontSize(8);
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.text(
        `Page ${i} of ${pageCount}`,
        pageWidth - margin,
        pageHeight - margin,
        { align: "right" }
      );
      doc.text(
        `Generated on: ${new Date().toLocaleString()}`,
        margin,
        pageHeight - margin,
        { align: "left" }
      );
    }

    doc.save("defaulters_report.pdf");
  };

  const downloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Defaulters Report");
    XLSX.writeFile(workbook, "defaulters_report.xlsx");
  };

  const clearFilters = () => {
    setMentorFilter("");
    setDepartmentFilter("");
    setSectionFilter("");
  };

  return (
    <div className="space-y-6 pt-5">
      {/* Header Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="h-6 w-6 text-gray-600" />
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                Generate Defaulters Report
              </h2>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className="p-6">
          <form onSubmit={handleGenerateReport} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label
                  htmlFor="defaulterType"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
                >
                  Defaulters Type
                </label>
                <select
                  id="defaulterType"
                  value={defaulterType}
                  onChange={(e) => setDefaulterType(e.target.value)}
                  required
                  className="w-full rounded-lg border-gray-300 dark:bg-gray-800 dark:text-gray-200 dark:focus:ring-blue-500 dark:focus:border-blue-500"
                >
                  <option value="">Select Type</option>
                  <option value="Discipline and Dresscode">
                    Dresscode
                  </option>
                  <option value="Late">Latecomers</option>
                  <option value="Both">Dresscode and Latecomers</option>
                  <option value="All">All</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="fromDate"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
                >
                  From Date
                </label>
                <input
                  type="date"
                  id="fromDate"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  required
                  className="w-full rounded-lg border-gray-300 dark:bg-gray-800 dark:text-gray-200 dark:focus:ring-blue-500 dark:focus:border-blue-500"
                />
              </div>

              <div>
                <label
                  htmlFor="toDate"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
                >
                  To Date
                </label>
                <input
                  type="date"
                  id="toDate"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  required
                  className="w-full rounded-lg border-gray-300 dark:bg-gray-800 dark:text-gray-200 dark:focus:ring-blue-500 dark:focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <span className="animate-spin">⌛</span>
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4" />
                    <span>Generate Report</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Results Section */}
      {reportData.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">
                Report Results
              </h3>
              <div className="flex space-x-2">
                <button
                  onClick={downloadPDF}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 flex items-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>PDF</span>
                </button>
                <button
                  onClick={downloadExcel}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Excel</span>
                </button>
              </div>
            </div>
          </div>

          {/* Filters Section */}
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Filter by Mentor"
                    value={mentorFilter}
                    onChange={(e) => setMentorFilter(e.target.value)}
                    className="w-full rounded-lg border-gray-300 pl-10 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Filter by Department"
                    value={departmentFilter}
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                    className="w-full rounded-lg border-gray-300 pl-10 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Filter by Section"
                    value={sectionFilter}
                    onChange={(e) => setSectionFilter(e.target.value)}
                    className="w-full rounded-lg border-gray-300 pl-10 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 flex items-center space-x-2"
              >
                <X className="h-4 w-4" />
                <span>Clear</span>
              </button>
            </div>
          </div>

          {/* Table Section */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {[
                    "Roll Number",
                    "Student Name",
                    "Department",
                    "Batch",
                    "Year",
                    "Section",
                    "Mentor Name",
                    "Date",
                    "Type",
                  ].map((header) => (
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
                {filteredData.length > 0 ? (
                  filteredData.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.roll_no}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.studentName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.departmentName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.batchName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.year}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.section_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.mentorName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(item.entryDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.defaulterType}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="9"
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      No data found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
