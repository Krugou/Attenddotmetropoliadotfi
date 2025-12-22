import {jsPDF} from 'jspdf';
import autoTable from 'jspdf-autotable';
import {toast} from 'react-toastify';
import * as XLSX from 'xlsx';
import {utils, writeFile} from 'xlsx';
import metropolia_logo from '../assets/images/metropolia_s_oranssi_en.png';
/**
 * Function to create tables for PDF or Excel
 * @param {string} mode - The mode of the table, either 'pdf' or 'excel'.
 * @param {Array} filteredAttendanceData - The attendance data to be included in the table.
 * @param {Object} student - The student for whom the table is being created.
 * @returns {Object} An object containing the table headers and data.
 */
const createTables = (mode?, filteredAttendanceData?, student?) => {
  let tableData;
  const tableHeaders = [
    'Date',
    'Student',
    'Teacher',
    'Time of Day',
    'Topic',
    'Status',
  ];
  // If mode is 'pdf', set the table headers and data accordingly
  if (mode === 'pdf') {
    tableData = filteredAttendanceData.map((attendance) => [
      new Date(attendance.start_date).toLocaleDateString(),
      student
        ? `${student.last_name} ${student.first_name}`
        : attendance.last_name + ' ' + attendance.first_name,
      attendance.teacher,
      attendance.timeofday,
      attendance.topicname,
      attendance.status === 1
        ? 'Present'
        : attendance.status === 2
        ? 'Accepted Absence'
        : 'Absent',
    ]);
  } else if (mode === 'excel') {
    // If mode is 'excel', set the table headers and data accordingly
    tableData = filteredAttendanceData.map((attendance) => ({
      'Date': new Date(attendance.start_date).toLocaleDateString(),
      'Student': student
        ? ` ${student.last_name} ${student.first_name}`
        : attendance.last_name + ' ' + attendance.first_name,
      'Teacher': attendance.teacher,
      'Time of Day': attendance.timeofday,
      'Topic': attendance.topicname,
      'Status':
        attendance.status === 1
          ? 'Present'
          : attendance.status === 2
          ? 'Accepted Absence'
          : 'Absent',
    }));
  }

  return {tableHeaders, tableData};
};
/**
 * Function to export the attendance data to a PDF file.
 * @param {Array} filteredAttendanceData - The attendance data to be included in the PDF.
 * @param {Object} student - The student for whom the PDF is being created.
 * @param {string} sortOption - The option by which the data should be sorted.
 */
export const exportToPDF = (filteredAttendanceData, student?, sortOption?) => {
  const doc = new jsPDF();
  const imgWidth = 90;
  const imgHeight = (imgWidth * 1267) / 4961;
  const imgX = 15;
  const imgY = 10;
  doc.addImage(metropolia_logo, 'PNG', imgX, imgY, imgWidth, imgHeight);

  const {tableHeaders, tableData} = createTables(
    'pdf',
    filteredAttendanceData,
    student,
  );

  // Add the table to the PDF

  autoTable(doc, {
    head: [tableHeaders],
    body: tableData,
    startY: student ? 60 : 50, // start the table below the title

    didDrawPage: (data) => {
      // Add header only on the first page
      if (data.pageCount === 1) {
        doc.setFontSize(20);
        doc.setTextColor(40); // Set text color to black
        doc.setFont('helvetica', 'normal'); // Set font
        // Add the course name and student name to the PDF

        if (!student) {
          doc.text(
            `${filteredAttendanceData[0].name} attendance for ${new Date(
              filteredAttendanceData[0].start_date,
            ).toLocaleDateString()}`,
            data.settings.margin.left,
            45,
          );
        } else {
          doc.text(
            `${filteredAttendanceData[0].name} attendance for ${student?.first_name} ${student?.last_name}`,
            data.settings.margin.left,
            45,
          );
          doc.text(`Topics: ${sortOption}`, data.settings.margin.left, 55);
        }
      }
    },
  });

  // Save the PDF
  if (!student) {
    doc.save(
      `${filteredAttendanceData[0].name} attendance for ${new Date(
        filteredAttendanceData[0].start_date,
      ).toLocaleDateString()} .pdf`,
    );
    toast.success('attendance PDF downloaded successfully.', {
      position: 'top-center', // position the toast at the top center
      autoClose: 7000, // Display the toast for 7 seconds
    });
  } else {
    doc.save(`${student?.first_name} ${student?.last_name}'s attendance.pdf`);

    toast.success(
      `${student?.first_name} ${student?.last_name}'s attendance PDF for topics: ${sortOption} downloaded successfully. `,
      {
        position: 'top-center', // position the toast at the top center
        autoClose: 7000, // Display the toast for 7 seconds
      },
    );
  }
};
/**
 * Function to export the attendance data to an Excel file.
 * @param {Array} filteredAttendanceData - The attendance data to be included in the Excel file.
 * @param {Object} student - The student for whom the Excel file is being created.
 * @param {string} sortOption - The option by which the data should be sorted.
 */
export const exportToExcel = (
  filteredAttendanceData,
  student?,
  sortOption?,
) => {
  // Create the table
  const {tableHeaders, tableData} = createTables(
    'excel',
    filteredAttendanceData,
    student,
  );
  // Create a worksheet
  const ws = XLSX.utils.json_to_sheet(tableData, {header: tableHeaders});
  // Create a workbook
  const wb = XLSX.utils.book_new();
  // Add the worksheet to the workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

  // Save the workbook
  if (!student) {
    XLSX.writeFile(
      wb,
      `${filteredAttendanceData[0].name} attendance for ${new Date(
        filteredAttendanceData[0].start_date,
      ).toLocaleDateString()}.xlsx`,
    );
    toast.success('attendance EXCEL downloaded successfully.', {
      position: 'top-center', // position the toast at the top center
      autoClose: 7000, // Display the toast for 7 seconds
    });
  } else {
    XLSX.writeFile(
      wb,
      `${student?.first_name} ${student?.last_name}_${filteredAttendanceData[0].name}_${sortOption} attendance.xlsx`,
    );
    toast.success(
      `${student?.first_name} ${student?.last_name}'s attendance EXCEL for topics: ${sortOption} downloaded successfully. `,
      {
        position: 'top-center', // position the toast at the top center
        autoClose: 7000, // Display the toast for 7 secondss
      },
    );
  }
  // Display a toast message
};
/**
 * Function to export the attendance statistics to a PDF file.
 * @param {Array} allAttendanceCounts - The attendance counts for all students.
 * @param {Object} selectedCourse - The course for which the statistics are being exported.
 */
export const exportStatsTableToPdf = (allAttendanceCounts, selectedCourse) => {
  const doc = new jsPDF();
  const topics = allAttendanceCounts.map((item) => item.topicname);

  // Define the Metropolia logo
  const imgWidth = 90;
  const imgHeight = (imgWidth * 1267) / 4961;
  const imgX = 15;
  const imgY = 10;

  // Add the course name to the PDF
  doc.text(
    `Attendance statistics for: ${
      selectedCourse
        ? selectedCourse?.name + ' ' + selectedCourse?.code
        : 'unknown course'
    }`,
    15,
    45,
  );

  // Add the Metropolia logo to the PDF
  doc.addImage(metropolia_logo, 'PNG', imgX, imgY, imgWidth, imgHeight);
  // Define the columns for the table. It includes 'Student', 'Selected Topics', and all the topics.
  const columns = ['Student', 'Selected Topics', ...topics];

  // Map over the attendance counts to create the data for each student.
  const data = allAttendanceCounts[0]?.attendanceCounts.map((student, i) => {
    // Start with the student's name and selected topics.
    const studentData = [
      student.name,
      // If selectedTopics is an array, join them with a comma. Otherwise, use the value directly.
      Array.isArray(student.selectedTopics)
        ? student.selectedTopics.join(', ')
        : student.selectedTopics,
    ];

    // For each attendance count...
    allAttendanceCounts.forEach((item) => {
      // If the student did not select this topic, add 'N/A'.
      if (
        Array.isArray(student.selectedTopics) &&
        !student.selectedTopics.includes(item.topicname)
      ) {
        studentData.push('N/A');
      }
      // If there were no TeacherLectures for this topic, add 'No TeacherLectures'.
      else if (item.attendanceCounts[i]?.percentage === 'No TeacherLectures') {
        studentData.push('No TeacherLectures');
      }
      // Otherwise, add the student's attendance percentage for this topic.
      else {
        studentData.push(`${item.attendanceCounts[i]?.percentage}%`);
      }
    });

    // Return the data for the students.
    return studentData;
  });

  // Generate the table in the PDF document.
  autoTable(doc, {columns, body: data, startY: 50});
  doc.save(
    `${selectedCourse?.name}_${selectedCourse?.code}_attendancestatistics.pdf`,
  );
};
/**
 * Function to export the attendance statistics to an Excel file.
 * @param {Array} allAttendanceCounts - The attendance counts for all students.
 * @param {Object} selectedCourse - The course for which the statistics are being exported.
 */
export const exportStatsTableToExcel = (
  allAttendanceCounts,
  selectedCourse,
) => {
  // Headers
  const headers = ['Student', 'Selected Topics'].concat(
    allAttendanceCounts.map((item) => item.topicname),
  );

  // Data
  const ws_data = allAttendanceCounts[0]?.attendanceCounts.map((student, i) => {
    const studentData = [
      student.name,
      Array.isArray(student.selectedTopics)
        ? student.selectedTopics.join(', ')
        : student.selectedTopics,
    ];
    allAttendanceCounts.forEach((item) => {
      if (
        Array.isArray(student.selectedTopics) &&
        !student.selectedTopics.includes(item.topicname)
      ) {
        studentData.push('N/A');
      } else if (item.attendanceCounts[i]?.percentage === 'No TeacherLectures') {
        studentData.push('No TeacherLectures');
      } else {
        studentData.push(`${item.attendanceCounts[i]?.percentage}%`);
      }
    });
    return studentData;
  });

  // Add headers to the data
  ws_data.unshift(headers);

  const ws = utils.aoa_to_sheet(ws_data);
  const wb = utils.book_new();
  utils.book_append_sheet(wb, ws, 'Sheet1');

  writeFile(
    wb,
    `${selectedCourse?.name}_${selectedCourse?.code}_attendancestatistics.xlsx`,
  );
};
