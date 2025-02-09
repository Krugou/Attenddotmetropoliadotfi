import React, {useContext} from 'react';
import {useTranslation} from 'react-i18next';
import {
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {toast} from 'react-toastify';
import {UserContext} from '../../../../contexts/UserContext';
import ApiHooks from '../../../../api';

/**
 * Represents the attendance of a student for a specific class.
 */
interface Attendance {
  date: string; // The date of the class
  name: string; // The name of the student
  start_date: string; // The start date of the class
  timeofday: string; // The time of day of the class
  topicname: string; // The name of the topic
  teacher: string; // The name of the teacher
  status: number; // The attendance status
}

/**
 * Represents the attendance of a student for a specific class, with additional information for teachers.
 */
interface AttendanceFromTeacher {
  usercourseid: number; // The ID of the user course
  email: string; // The email of the student
  first_name: string; // The first name of the student
  last_name: string; // The last name of the student
  studentnumber: string; // The student number
}

/**
 * Represents the information of a student.
 */
interface StudentInfo {
  email: string; // The email of the student
  first_name: string; // The first name of the student
  last_name: string; // The last name of the student
  role: string; // The role of the user
  roleid: number; // The ID of the role
  staff: number; // Whether the user is a staff member
  studentnumber: string; // The student number
  userid: number; // The ID of the user
  username: string; // The username of the user
  created_at: string; // The creation date of the user
  // Include other properties of student here
}

/**
 * Props for the AttendanceTable component.
 */
interface AttendanceTableProps {
  filteredAttendanceData: Attendance[] | AttendanceFromTeacher[]; // The filtered attendance data
  student?: StudentInfo | null; // The information of the student
  allAttendances?: boolean; // Whether to show all attendances
  usercourseId?: number; // The ID of the user course
  updateView?: () => void; // A function to update the view
}

/**
 * A table component that displays the attendance of students for specific classes.
 */
const AttendanceTable: React.FC<AttendanceTableProps> = ({
  filteredAttendanceData,
  student,
  allAttendances,
  updateView,
}) => {
  const {user} = useContext(UserContext);
  const {t} = useTranslation();
  const handleStatusChange = async (newStatus: number, attendanceid?) => {
    try {
      const token: string | null = localStorage.getItem('userToken');

      // Update the status in the database
      await ApiHooks.updateAttendanceStatus(attendanceid, newStatus, token);

      // You can add a toast notification or any other feedback here
      toast.success('Attendance status updated successfully');
      updateView && updateView();
    } catch (error) {
      // Handle error
      console.error(error);
      toast.error('Failed to update attendance status');
    }
  };

  return (
    <TableContainer className='overflow-x-auto border-gray-300 border-x border-t max-h-[20em] mt-5 mb-5 rounded-lg shadow-sm'>
      <Table className='min-w-full divide-y divide-gray-200'>
        <TableHead className='sticky top-0 z-10 bg-white'>
          <TableRow>
            <TableCell className='px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase'>
              {t('lectures.table.headers.date')}
            </TableCell>
            {student && (
              <TableCell className='px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase'>
                {t('common.user')}
              </TableCell>
            )}
            {allAttendances && (
              <TableCell className='px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase'>
                {t('common.user')}
              </TableCell>
            )}
            <TableCell className='px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase'>
              {t('admin.common.instructors')}
            </TableCell>
            <TableCell className='px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase'>
              {t('lectures.table.headers.timeOfDay')}
            </TableCell>
            <TableCell className='px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase'>
              {t('lectures.table.headers.topicName')}
            </TableCell>
            <TableCell className='px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase'>
              {t('admin.common.status')}
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody className='bg-white divide-y divide-gray-200'>
          {filteredAttendanceData.map((attendance, index) => (
            <TableRow
              key={index}
              className={`border-b hover:bg-gray-50 ${
                attendance.status === 0
                  ? 'bg-red-200'
                  : attendance.status === 1
                  ? 'bg-green-200'
                  : 'bg-orange-200'
              }`}>
              <TableCell className='px-6 py-4 whitespace-nowrap'>
                {new Date(attendance.start_date).toLocaleDateString()}
              </TableCell>
              {student && (
                <TableCell className='px-6 py-4 whitespace-nowrap'>
                  {student.last_name} {student.first_name}
                </TableCell>
              )}
              {allAttendances && (
                <TableCell className='px-6 py-4 whitespace-nowrap'>
                  {attendance.last_name} {attendance.first_name}
                </TableCell>
              )}
              <TableCell className='px-6 py-4 whitespace-nowrap'>
                {attendance.teacher}
              </TableCell>
              <TableCell className='px-6 py-4 whitespace-nowrap'>
                {attendance.timeofday}
              </TableCell>
              <TableCell className='px-6 py-4 whitespace-nowrap'>
                {attendance.topicname}
              </TableCell>
              <TableCell className='px-6 py-4 whitespace-nowrap'>
                {user?.role !== 'student' && (
                  <Select
                    value={attendance.status}
                    onChange={(e) =>
                      handleStatusChange(
                        e.target.value as number,
                        attendance.attendanceid,
                      )
                    }>
                    <MenuItem value={0}>
                      {t('attendance.status.absent')}
                    </MenuItem>
                    <MenuItem value={1}>
                      {t('attendance.status.present')}
                    </MenuItem>
                    <MenuItem value={2}>
                      {t('attendance.status.acceptedAbsence')}
                    </MenuItem>
                  </Select>
                )}
                {user?.role === 'student' && (
                  <p>
                    {attendance.status === 0
                      ? t('attendance.status.absent')
                      : attendance.status === 1
                      ? t('attendance.status.present')
                      : t('attendance.status.acceptedAbsence')}
                  </p>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default AttendanceTable;
