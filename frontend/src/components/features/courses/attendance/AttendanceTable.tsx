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
import {UserContext} from '../../../../contexts/UserContext.tsx';
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
  const {t} = useTranslation(['teacher']);
  const handleStatusChange = async (newStatus: number, attendanceid?) => {
    try {
      const token: string | null = localStorage.getItem('userToken');

      // Update the status in the database
      await ApiHooks.updateAttendanceStatus(attendanceid, newStatus, token);

      // You can add a toast notification or any other feedback here
      toast.success('attendance status updated successfully');
      updateView && updateView();
    } catch (error) {
      // Handle error
      console.error(error);
      toast.error('Failed to update attendance status');
    }
  };

  const statusMeta = (status: number) => {
    switch (status) {
      case 1:
        return {
          label: t('attendance.status.present'),
          dot: 'bg-green-500',
          pill: 'bg-green-50 text-green-800 border-green-200',
        };
      case 2:
        return {
          label: t('attendance.status.acceptedAbsence'),
          dot: 'bg-orange-500',
          pill: 'bg-orange-50 text-orange-800 border-orange-200',
        };
      default:
        return {
          label: t('attendance.status.absent'),
          dot: 'bg-red-500',
          pill: 'bg-red-50 text-red-800 border-red-200',
        };
    }
  };

  const statusSelectSx = (status: number) => {
    const common = {
      minWidth: 170,
      borderRadius: 2,
      fontSize: '0.875rem',
      '& .MuiSelect-select': {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        paddingTop: '10px',
        paddingBottom: '10px',
      },
    } as const;

    if (status === 1) {
      return {
        ...common,
        backgroundColor: 'rgba(34,197,94,0.12)',
        '& .MuiOutlinedInput-notchedOutline': {borderColor: 'rgba(34,197,94,0.45)'},
        '&:hover .MuiOutlinedInput-notchedOutline': {borderColor: 'rgba(34,197,94,0.70)'},
      };
    }

    if (status === 2) {
      return {
        ...common,
        backgroundColor: 'rgba(249,115,22,0.12)',
        '& .MuiOutlinedInput-notchedOutline': {borderColor: 'rgba(249,115,22,0.45)'},
        '&:hover .MuiOutlinedInput-notchedOutline': {borderColor: 'rgba(249,115,22,0.70)'},
      };
    }

    return {
      ...common,
      backgroundColor: 'rgba(239,68,68,0.10)',
      '& .MuiOutlinedInput-notchedOutline': {borderColor: 'rgba(239,68,68,0.45)'},
      '&:hover .MuiOutlinedInput-notchedOutline': {borderColor: 'rgba(239,68,68,0.70)'},
    };
  };

  return (
    <TableContainer
      className="mt-5 mb-5 overflow-x-auto rounded-2xl border border-gray-200 bg-white/95 shadow-md">
      <Table className="min-w-full table-fixed">
        <TableHead
          className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b-2 border-metropolia-main-orange/20">
          <TableRow>
            <TableCell className="w-[110px] px-3 py-2 text-[10px] md:text-[11px] font-semibold tracking-wider text-left text-gray-500 uppercase">
              {t('TeacherLectures.table.headers.date')}
            </TableCell>

            {(student || allAttendances) && (
              <TableCell className="min-w-0 w-[110px] px-3 py-2 text-[10px] md:text-[11px] font-semibold tracking-wider text-left text-gray-500 uppercase">
                {t('TeacherLectures.table.headers.student')}
              </TableCell>
            )}

            <TableCell className="w-[110px] px-3 py-2 text-[10px] md:text-[11px] font-semibold tracking-wider text-left text-gray-500 uppercase hidden lg:table-cell">
              {t('TeacherLectures.table.headers.topicName')}
            </TableCell>

            <TableCell className="w-[130px] md:w-[170px] px-3 py-2 text-[10px] md:text-[11px] font-semibold tracking-wider text-right text-gray-500 uppercase">
              {t('TeacherLectures.table.headers.status')}
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {filteredAttendanceData.map((attendance: any, index) => {
            const meta = statusMeta(attendance.status);

            return (
              <TableRow
                key={index}
                className={[
                  'border-b border-gray-100',
                  'hover:bg-gray-50 transition-colors',
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50/40',
                ].join(' ')}
              >
                <TableCell
                  className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">
                  {new Date(attendance.start_date).toLocaleDateString()}
                </TableCell>

                {student && (
                  <TableCell
                    className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">
                    {student.last_name} {student.first_name}
                  </TableCell>
                )}

                {allAttendances && (
                  <TableCell
                    className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">
                    {attendance.last_name} {attendance.first_name}
                  </TableCell>
                )}

                <TableCell
                  className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 hidden lg:table-cell">
                  {attendance.topicname}
                </TableCell>

                <TableCell className="px-4 py-3 whitespace-nowrap text-right">
                  {user?.role !== 'student' ? (
                    <Select
                      size="small"
                      value={attendance.status}
                      onChange={e =>
                        handleStatusChange(e.target.value as number, attendance.attendanceid)
                      }
                      sx={statusSelectSx(attendance.status)}
                      renderValue={value => {
                        const m = statusMeta(value as number);
                        return (
                          <span
                            className="inline-flex items-center gap-2 font-medium">
                            <span className={`h-2 w-2 rounded-full ${m.dot}`} />
                            {m.label}
                          </span>
                        );
                      }}
                    >
                      <MenuItem
                        value={0}>{t('attendance.status.absent')}</MenuItem>
                      <MenuItem
                        value={1}>{t('attendance.status.present')}</MenuItem>
                      <MenuItem
                        value={2}>{t('attendance.status.acceptedAbsence')}</MenuItem>
                    </Select>
                  ) : (
                    <span
                      className={`inline-flex items-center gap-2 px-2 py-1 rounded-full border text-xs font-medium ${meta.pill}`}>
                      <span className={`h-2 w-2 rounded-full ${meta.dot}`} />
                      {meta.label}
                    </span>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default AttendanceTable;
