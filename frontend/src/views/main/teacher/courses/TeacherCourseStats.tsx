import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TableChartIcon from '@mui/icons-material/TableChart';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import React, {useContext, useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {toast} from 'react-toastify';
import AttendanceStatsTable from '../../../../components/features/courses/attendance/AttendanceStatsTable.tsx';
import {UserContext} from '../../../../contexts/UserContext';
import apiHooks from '../../../../api';
import {useCourses} from '../../../../hooks/courseHooks';
import {
  exportStatsTableToExcel,
  exportStatsTableToPdf,
} from '../../../../utils/exportData';
import {useTranslation} from 'react-i18next';

interface Course {
  name: string;
  code: string;
  courseid: number;
}

interface AttendanceCount {
  name: string;
  selectedTopics: string | string[];
  percentage: number;
  count: number;
  topicname: string;
  userid: number;
}

interface TopicAttendance {
  topicname: string;
  attendanceCounts: AttendanceCount[];
}

const TeacherCourseStats = () => {
  const {t} = useTranslation('teacher'); // ✅ teacher namespace (ei arrayta)
  const [showTable, setShowTable] = useState(false);
  const {courseid} = useParams<{courseid: string}>();
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const {threshold, courses} = useCourses();

  const navigate = useNavigate();
  const {user} = useContext(UserContext);
  const [allAttendanceCounts, setAllAttendanceCounts] = useState<TopicAttendance[]>(
    [],
  );

  const sumUserAttendanceOnTopic = (users, userid, topicname) => {
    return users.filter(
      (user) =>
        user.userid === userid &&
        (user.status === 1 || user.status === 2) &&
        (user.selectedParts && user.selectedParts.length > 0
          ? user.selectedParts.some(
            (part) =>
              part.topicname === topicname && user.topicname === topicname,
          )
          : (!user.selectedParts || user.selectedParts.length === 0) &&
          user.topicname === topicname),
    ).length;
  };

  const calculateAttendanceForAllUsers = (
    users,
    allUsers,
    lectures,
    topicname,
  ) => {
    const uniqueUserIds = [...new Set(allUsers.map((user) => user.userid))];
    const lecture = lectures.find((lecture) => lecture.topicname === topicname);
    const lecture_count = lecture ? lecture.lecture_count : 0;

    const attendanceCounts = uniqueUserIds.map((userid) => {
      const count = sumUserAttendanceOnTopic(users, userid, topicname);
      let user = users.find((user) => user.userid === userid);
      if (!user) {
        user = allUsers.find((user) => user.userid === userid);
      }

      const name = user ? `${user.last_name} ${user.first_name}` : 'Unknown User';

      const selectedTopics =
        user && user.selectedParts && user.selectedParts.length > 0
          ? user.selectedParts.map((part) => part.topicname)
          : 'all';

      const percentage =
        lecture_count > 0
          ? parseFloat(((count / lecture_count) * 100).toFixed(1))
          : 'No TeacherLectures';

      return {
        name,
        count,
        topicname,
        percentage,
        selectedTopics,
        userid,
      };
    });

    return attendanceCounts;
  };

  const calculateAttendanceForAllTopics = (users, allUsers, lectures) => {
    return lectures.map((lecture) => {
      const attendanceCounts = calculateAttendanceForAllUsers(
        users,
        allUsers,
        lectures,
        lecture.topicname,
      );
      return {
        topicname: lecture.topicname,
        attendanceCounts,
      };
    });
  };

  const handleCourseSelect = async (value: string | null) => {
    if (!value) return;

    const selected: Course | undefined = courses.find(
      (course: Course) => `${course.name} ${course.code}` === value,
    );

    if (selected) {
      const course = selected as Course;
      try {
        if (user?.role === 'teacher') {
          navigate(`/teacher/courses/stats/${course?.courseid}`);
        }
        if (user?.role === 'counselor') {
          navigate(`/counselor/courses/stats/${course?.courseid}`);
        }
        if (user?.role === 'admin') {
          navigate(`/counselor/courses/stats/${course?.courseid}`);
        }

        setSelectedCourse(course);

        const token: string | null = localStorage.getItem('userToken');
        if (!token) throw new Error('No token available');

        const courseDetails = await apiHooks.getDetailsByCourseId(
          course.courseid.toString(),
          token,
        );

        const allAttendanceCounts = calculateAttendanceForAllTopics(
          courseDetails.users,
          courseDetails.allUsers,
          courseDetails.lectures,
        );

        setAllAttendanceCounts(allAttendanceCounts);
        setShowTable(true);
      } catch (error) {
        toast.error('Error fetching course details');
        console.log(error);
      }
    }
  };

  useEffect(() => {
    if (!courseid) {
      setSelectedCourse(null);
      setAllAttendanceCounts([]);
      setShowTable(false);
      return;
    }

    const selectedCourse: Course | undefined = courses.find(
      (course: Course) => course.courseid?.toString() === courseid,
    );

    if (selectedCourse) {
      const course = selectedCourse as Course;
      handleCourseSelect(`${course.name} ${course.code}`);
    }
  }, [courseid, courses]);

  const handlePdfExport = () => {
    if (!selectedCourse) {
      toast.error(t('courseStats.errors.noCourseSelected'));
      return;
    }
    exportStatsTableToPdf(allAttendanceCounts, selectedCourse);
  };

  const handleExcelExport = () => {
    if (!selectedCourse) {
      toast.error(t('courseStats.errors.noCourseSelected'));
      return;
    }
    exportStatsTableToExcel(allAttendanceCounts, selectedCourse);
  };

  const handleClearCourse = () => {
    setSelectedCourse(null);
    setAllAttendanceCounts([]);
    setShowTable(false);

    if (user?.role === 'teacher') navigate('/teacher/courses/stats', {replace: true});
    else if (user?.role === 'counselor') navigate('/counselor/courses/stats', {replace: true});
    else if (user?.role === 'admin') navigate('/counselor/courses/stats', {replace: true});
  };

  const exportDisabled =
    !selectedCourse || !showTable || allAttendanceCounts.length === 0;

  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-[1250px] px-2 sm:px-4 lg:px-6">
        <section className="w-full bg-gray-100 rounded-2xl p-3 sm:p-4 lg:p-6 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4">
            <h1 className="text-2xl sm:text-3xl font-heading text-metropolia-main-grey">
              {t('courseStats.title')}
            </h1>

            <div className="flex items-center gap-2 sm:gap-3">
              <Tooltip
                title={t('courseStats.buttons.printPdf')}
                disableHoverListener={exportDisabled}
                disableFocusListener={exportDisabled}
                disableTouchListener={exportDisabled}
              >
                <span>
                  <button
                    type="button"
                    aria-label={t('courseStats.buttons.printPdf')}
                    onClick={handlePdfExport}
                    disabled={exportDisabled}
                    className={[
                      'inline-flex items-center justify-center',
                      'h-10 w-10 sm:h-11 sm:w-11',
                      'rounded-xl shadow-sm',
                      'focus:outline-hidden focus:ring-2 focus:ring-metropolia-main-orange',
                      exportDisabled
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-metropolia-main-orange text-white hover:bg-metropolia-secondary-orange',
                    ].join(' ')}
                  >
                    <PictureAsPdfIcon fontSize="medium" />
                  </button>
                </span>
              </Tooltip>

              <Tooltip
                title={t('courseStats.buttons.exportExcel')}
                disableHoverListener={exportDisabled}
                disableFocusListener={exportDisabled}
                disableTouchListener={exportDisabled}
              >
                <span>
                  <button
                    type="button"
                    aria-label={t('courseStats.buttons.exportExcel')}
                    onClick={handleExcelExport}
                    disabled={exportDisabled}
                    className={[
                      'inline-flex items-center justify-center',
                      'h-10 w-10 sm:h-11 sm:w-11',
                      'rounded-xl shadow-sm',
                      'focus:outline-hidden focus:ring-2 focus:ring-metropolia-main-orange',
                      exportDisabled
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-metropolia-main-orange text-white hover:bg-metropolia-secondary-orange',
                    ].join(' ')}
                  >
                    <TableChartIcon fontSize="medium" />
                  </button>
                </span>
              </Tooltip>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-3 sm:p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="w-full sm:max-w-[520px]">
                <Autocomplete
                  className="sm:w-[30em] mr-3 ml-3 w-1/2"
                  freeSolo
                  options={courses.map(
                    (course: Course) => `${course.name} ${course.code}`,
                  )}
                  onChange={(_, value) => {
                    if (value === null) {
                      handleClearCourse();
                      return;
                    }
                    handleCourseSelect(value);
                  }}
                  value={
                    selectedCourse
                      ? `${selectedCourse.name} ${selectedCourse.code}`
                      : null
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={t('courseStats.search.label')}
                      margin="normal"
                      variant="outlined"
                    />
                  )}
                />
              </div>

              {selectedCourse && (
                <div className="text-sm text-gray-600">
                  {`${selectedCourse.name} (${selectedCourse.code})`}
                </div>
              )}
            </div>

            <div className="mt-4">
              {showTable ? (
                <AttendanceStatsTable
                  allAttendanceCounts={allAttendanceCounts}
                  threshold={threshold}
                  currentCourseId={courseid}
                />
              ) : (
                <div className="py-10 text-center text-gray-500">
                  {t('courseStats.search.noCourse')}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default TeacherCourseStats;
