import ShowChartIcon from '@mui/icons-material/ShowChart';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TableChartIcon from '@mui/icons-material/TableChart';
//import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import React, {useContext, useEffect, useState} from 'react';
import Calendar from 'react-calendar';
import {useNavigate, useParams} from 'react-router-dom';
import AttendanceTable from '../../../../components/features/courses/attendance/AttendanceTable.tsx';
import {UserContext} from '../../../../contexts/UserContext';
import apiHooks from '../../../../api';
import {exportToExcel, exportToPDF} from '../../../../utils/exportData';
import {useTranslation} from 'react-i18next';
import { Link } from 'react-router-dom';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';

/**
 * TeacherCourseAttendances component.
 * This component is responsible for rendering the attendance view for a course for a teacher.
 * It fetches the TeacherLectures and their attendances and provides functionality for the teacher to filter the attendances based on a selected date, print the attendances to a PDF, export the attendances to an Excel file, and navigate to the attendance statistics view.
 */
const TeacherCourseAttendances: React.FC = () => {
  const {t} = useTranslation(['teacher']);
  const navigate = useNavigate();
  const {id: courseId, date: dateParam} = useParams();

  // Initialize selectedDate from URL parameter or current date
  const [selectedDate, setSelectedDate] = useState<Date | null>(() => {
    if (dateParam) {
      const parsedDate = new Date(dateParam);
      return isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
    }
    return new Date();
  });

  const [lecturesAndTheirAttendances, setLecturesAndTheirAttendances] =
    useState<any[]>([]); // [lecture, [attendances]
  const {update, setUpdate} = useContext(UserContext);
  const {user} = useContext(UserContext);
  const userEmail = user?.email;
  const [showOwnAttendances, setShowOwnAttendances] = useState(true);

  // Fetch the TeacherLectures and their attendances
  useEffect(() => {
    const fetchAttendances = async () => {
      try {
        const token: string | null = localStorage.getItem('userToken');
        if (!token) {
          throw new Error('No token available');
        }
        const response = await apiHooks.getLecturesAndAttendances(
          courseId,
          token,
        );
        console.log(response, 'response');
        // Set the TeacherLectures and their attendances
        setLecturesAndTheirAttendances(response);
      } catch (error) {
        console.log(error);
      }
    };
    fetchAttendances();
  }, [courseId, update]);

  // Function to handle date change
  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    const formattedDate = date.toISOString().split('T')[0];
    navigate(`/teacher/courses/attendances/${courseId}/${formattedDate}`);
  };

  // Map the lecture start dates to an array
  const lectureStartDates = lecturesAndTheirAttendances.map((lecture) =>
    new Date(lecture.start_date).toLocaleDateString(),
  );

  // Filter the attendances based on the selected date
  const filteredAttendances = selectedDate
    ? lecturesAndTheirAttendances
        .filter(
          (lecture) =>
            new Date(lecture.start_date).toDateString() ===
            selectedDate.toDateString(),
        )
        .filter(
          (lecture) => !showOwnAttendances || lecture.teacher === userEmail,
        )
        .map((lecture) => ({
          ...lecture,
          timeofday: lecture.timeofday,
          teacher: lecture.teacher,
          topicname: lecture.topicname,
          name: lecture.name,
          email: lecture.email,
          first_name: lecture.first_name,
          last_name: lecture.last_name,
          studentnumber: lecture.studentnumber,
        }))
    : [showOwnAttendances];
  const handleToggleOwnAttendances = () => {
    setShowOwnAttendances(!showOwnAttendances);
  };
  // Function to handle printing to pdf
  const handlePrintToPdf = () => {
    exportToPDF(filteredAttendances);
  };

  // Function to handle exporting to excel
  const handleExportToExcel = () => {
    exportToExcel(filteredAttendances);
  };

  const updateView = () => {
    setUpdate(!update);
  };

  return (
    <div className="w-full">
      <div className="mx-auto w-full max-w-[1400px] px-6">
        {/* Page card */}
        <section className="bg-gray-50/70 rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <Tooltip title={t('teacher:courseAttendances.buttons.backToCourses')} arrow>
                <Link
                  to={
                    user?.role === 'admin' || user?.role === 'counselor'
                      ? '/counselor/courses'
                      : '/teacher/courses'
                  }
                  aria-label={t('teacher:courseAttendances.buttons.backToCourses')}
                  className="inline-flex items-center justify-center w-10 h-10 rounded-full text-metropolia-main-orange hover:bg-metropolia-main-orange/10 transition-colors shrink-0"
                >
                  <ArrowBackRoundedIcon fontSize="medium" />
                </Link>
              </Tooltip>

              <h1 className="text-3xl font-heading truncate">
                {t('teacher:courseAttendances.title')}
              </h1>
            </div>

            <div className="w-10 h-10 shrink-0" />
          </div>

          {/* Filters / calendar row */}
          <div className="mt-6 grid items-start gap-6 lg:grid-cols-[420px_1fr]">
            {/* Calendar card */}
            <div className="bg-white border rounded-xl h-fit self-start">

              <div className="p-4">
                <Calendar
                  className="w-full rounded-xl "
                  // @ts-ignore
                  onChange={handleDateChange}
                  value={selectedDate}
                  tileContent={({date}) => {
                    const calendarDate = new Date(date).toLocaleDateString();
                    const isLectureStartDate = lectureStartDates.includes(calendarDate);

                    return isLectureStartDate ? (
                      <div className="w-full h-full rounded bg-yellow-200/70" />
                    ) : null;
                  }}
                />
              </div>
            </div>

            {/* Right side card */}
            <div className="bg-white border rounded-xl shadow-sm self-start min-w-0">
              {selectedDate ? (
                filteredAttendances.length > 0 ? (
                  <>
                    {/* Card header: title + actions (oikealla) */}
                    <div className="p-4 md:p-5 border-b border-gray-100 flex items-start justify-between gap-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <h2 className="text-xl md:text-2xl font-heading break-words">
                          {t('teacher:courseAttendances.table.title', {
                            date: selectedDate.toLocaleDateString(),
                          })}
                        </h2>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 justify-end sm:flex-nowrap sm:justify-end">
                        {/* Segmented toggle */}
                        {user?.role !== 'student' && (
                          <div className="inline-flex rounded-xl border border-gray-200 bg-white p-1">
                            <button
                              type="button"
                              onClick={() => {
                                if (showOwnAttendances) handleToggleOwnAttendances();
                              }}
                              className={[
                                'px-3 py-2 text-sm rounded-lg font-body transition-colors',
                                !showOwnAttendances
                                  ? 'bg-orange-50 text-metropolia-main-orange'
                                  : 'text-gray-700 hover:bg-gray-50',
                              ].join(' ')}
                            >
                              {t('teacher:courseAttendances.toggle.all')}
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                if (!showOwnAttendances) handleToggleOwnAttendances();
                              }}
                              className={[
                                'px-3 py-2 text-sm rounded-lg font-body transition-colors',
                                showOwnAttendances
                                  ? 'bg-orange-50 text-metropolia-main-orange'
                                  : 'text-gray-700 hover:bg-gray-50',
                              ].join(' ')}
                            >
                              {t('teacher:courseAttendances.toggle.own')}
                            </button>
                          </div>
                        )}

                        {/* Actions: Stats + PDF + Excel */}
                        <Tooltip title={t('teacher:courseAttendances.buttons.statistics')}>
                          <button
                            type="button"
                            onClick={() => navigate(`/teacher/courses/stats/${courseId}`)}
                            aria-label={t('teacher:courseAttendances.buttons.statistics')}
                            className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-metropolia-main-orange text-white shadow-sm hover:bg-metropolia-secondary-orange transition-colors">
                            <ShowChartIcon fontSize="medium" />
                          </button>
                        </Tooltip>

                        <Tooltip title={t('teacher:courseAttendances.buttons.printPdf')}>
                          <button
                            type="button"
                            onClick={handlePrintToPdf}
                            aria-label={t('teacher:courseAttendances.buttons.printPdf')}
                            className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-metropolia-main-orange text-white shadow-sm hover:bg-metropolia-secondary-orange transition-colors"
                          >
                            <PictureAsPdfIcon fontSize="medium" sx={{color: 'white'}} />
                          </button>
                        </Tooltip>

                        <Tooltip title={t('teacher:courseAttendances.buttons.exportExcel')}>
                          <button
                            type="button"
                            onClick={handleExportToExcel}
                            aria-label={t('teacher:courseAttendances.buttons.exportExcel')}
                            className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-metropolia-main-orange text-white shadow-sm hover:bg-metropolia-secondary-orange transition-colors"
                          >
                            <TableChartIcon fontSize="medium" sx={{color: 'white'}} />
                          </button>
                        </Tooltip>
                      </div>
                    </div>

                    {/* Card content (table) */}
                    <div className="p-4 md:p-5">
                      <div className="w-full overflow-x-auto">
                        <div className="min-w-[700px]">
                          <AttendanceTable
                            filteredAttendanceData={filteredAttendances}
                            allAttendances={true}
                            updateView={updateView}
                          />
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="p-6 md:p-8">
                    <div className="flex flex-col items-center justify-center py-8">
                      {user?.role !== 'student' && (
                        <button
                          className="px-3 py-2 rounded-lg border border-metropolia-main-orange text-metropolia-main-orange bg-orange-50 hover:bg-orange-100 transition-colors font-body"
                          onClick={handleToggleOwnAttendances}
                        >
                          {t(
                            `teacher:courseAttendances.buttons.toggleView.${
                              showOwnAttendances ? 'showAll' : 'showOwn'
                            }`,
                          )}
                        </button>
                      )}

                      <p className="mt-4 text-lg text-gray-700 font-body text-center">
                        {t(
                          `teacher:courseAttendances.search.noAttendances.${
                            showOwnAttendances ? 'own' : 'all'
                          }`,
                          {date: selectedDate.toDateString()},
                        )}
                      </p>
                    </div>
                  </div>
                )
              ) : (
                <div className="p-6 text-gray-600 font-body" />
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default TeacherCourseAttendances;
