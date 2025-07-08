import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
  },
  header: {
    marginBottom: 20,
    textAlign: "center",
    borderBottom: 1,
    borderBottomColor: "#999",
    paddingBottom: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 12,
    marginBottom: 5,
  },
  studentInfo: {
    marginBottom: 20,
    fontSize: 10,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 5,
  },
  label: {
    width: 100,
    fontWeight: "bold",
  },
  // Summary table styles
  summaryTable: {
    marginTop: 20,
  },
  summaryHeader: {
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#000",
  },
  summaryRow: {
    flexDirection: "row",
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  summaryCol: {
    flex: 1,
    textAlign: "center",
  },
  // Existing styles
  table: {
    marginTop: 15,
    marginBottom: 15,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    backgroundColor: "#f0f0f0",
    padding: 6,
    fontWeight: "bold",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    padding: 6,
  },
  col1: { width: "15%" },
  col2: { width: "50%" },
  col3: { width: "12%", textAlign: "center" },
  col4: { width: "12%", textAlign: "center" },
  col5: { width: "12%", textAlign: "center" },
  semesterSummary: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 20,
    paddingRight: 10,
  },
  summaryItem: {
    flexDirection: "row",
    gap: 5,
  },
  summaryLabel: {
    color: "#666",
  },
  summaryValue: {
    fontWeight: "bold",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 10,
  },
  footerText: {
    fontSize: 8,
    color: "#666",
    marginBottom: 3,
  },
  pageNumber: {
    position: "absolute",
    bottom: 30,
    right: 40,
    fontSize: 8,
    color: "#666",
  },
});

const GradeSheetPDF = ({ student, results }) => {
  const formatDate = () => {
    return new Date().toLocaleDateString();
  };

  // Prepare summary data
  const semesterSummary = Object.entries(results || {})
    .sort((a, b) => a[0] - b[0])
    .map(([semester, data]) => ({
      semester,
      gpa: data.gpa,
      cgpa: data.cgpa,
      credits: `${data.earnedCredits}/${data.totalCredits}`,
    }));

  return (
    <Document>
      {/* Summary Page */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Consolidated Grade Sheet</Text>
          <Text style={styles.subtitle}>
            Velammal College of Engineering and Technology
          </Text>
          <Text style={styles.subtitle}>
            Department of Computer Science and Engineering
          </Text>
        </View>

        <View style={styles.studentInfo}>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Student Name:</Text>
            <Text>{student.name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Roll Number:</Text>
            <Text>{student.roll_no}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Register Number:</Text>
            <Text>{student.register_no}</Text>
          </View>
        </View>

        {/* Summary Table */}
        <View style={styles.summaryTable}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryCol}>Semester</Text>
            <Text style={styles.summaryCol}>GPA</Text>
            <Text style={styles.summaryCol}>CGPA</Text>
            <Text style={styles.summaryCol}>Credits</Text>
          </View>
          {semesterSummary.map((sem) => (
            <View key={sem.semester} style={styles.summaryRow}>
              <Text style={styles.summaryCol}>Semester {sem.semester}</Text>
              <Text style={styles.summaryCol}>{sem.gpa}</Text>
              <Text style={styles.summaryCol}>{sem.cgpa}</Text>
              <Text style={styles.summaryCol}>{sem.credits}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.pageNumber}>Page 1</Text>
      </Page>

      {/* Detailed Results Pages */}
      {Object.entries(results || {})
        .sort((a, b) => a[0] - b[0])
        .map(([semester, semData], index) => (
          <Page key={semester} size="A4" style={styles.page}>
            <View style={styles.header}>
              <Text style={styles.title}>Semester {semester} - Results</Text>
            </View>

            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={styles.col1}>Course Code</Text>
                <Text style={styles.col2}>Course Name</Text>
                <Text style={styles.col3}>Credits</Text>
                <Text style={styles.col4}>Grade</Text>
                <Text style={styles.col5}>Result</Text>
              </View>

              {semData.courses.map((course, idx) => (
                <View key={idx} style={styles.tableRow}>
                  <Text style={styles.col1}>{course.course_code}</Text>
                  <Text style={styles.col2}>{course.course_name}</Text>
                  <Text style={styles.col3}>{course.credits}</Text>
                  <Text style={styles.col4}>{course.grade}</Text>
                  <Text style={styles.col5}>
                    {course.grade === "F" || course.grade === "AB"
                      ? "FAIL"
                      : "PASS"}
                  </Text>
                </View>
              ))}
            </View>

            <View style={styles.semesterSummary}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>GPA:</Text>
                <Text style={styles.summaryValue}>{semData.gpa}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>CGPA:</Text>
                <Text style={styles.summaryValue}>{semData.cgpa}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Credits:</Text>
                <Text style={styles.summaryValue}>
                  {semData.earnedCredits}/{semData.totalCredits}
                </Text>
              </View>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Generated on: {formatDate(new Date())}
              </Text>
              <Text style={styles.footerText}>
                This is a computer-generated document
              </Text>
              <Text style={styles.footerText}>Generated from VCET Connect</Text>
            </View>

            <Text style={styles.pageNumber}>Page {index + 2}</Text>
          </Page>
        ))}
    </Document>
  );
};

export default GradeSheetPDF;
