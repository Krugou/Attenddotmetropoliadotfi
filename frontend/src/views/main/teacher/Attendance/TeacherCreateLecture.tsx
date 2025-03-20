import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import TopicIcon from '@mui/icons-material/Topic';
import {formatISO} from 'date-fns';
import React, {useContext, useEffect, useRef, useState} from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import {useNavigate} from 'react-router-dom';
import {toast} from 'react-toastify';
import CheckOpenLectures from '../../../../components/main/course/attendance/CheckOpenLectures';
import DeleteLectureModal from '../../../../components/main/modals/DeleteLectureModal';
import {UserContext} from '../../../../contexts/UserContext';
import apihooks from '../../../../api';
import {useTranslation} from 'react-i18next';
import Loader from '../../../../utils/Loader';

/**
 * CreateLecture component.
 * This component is responsible for rendering the lecture creation view for a teacher.
 * It provides functionality for the teacher to select a course, select a topic, select a date and time, and create a lecture.
 * Additionally, it provides functionality for the teacher to delete a lecture.
 */
const CreateLecture: React.FC = () => {
  const {user} = useContext(UserContext);
  const navigate = useNavigate();
  const {t} = useTranslation(['teacher']);
  const [courses, setCourses] = useState<Course[]>([]);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [date, setDate] = useState<Date | Date[]>(new Date());
  const [calendarOpen, setCalendarOpen] = useState(false);
  const timeOfDay = ['am', 'pm'];
  const currentHour = new Date().getHours();
  const defaultTimeOfDay = currentHour < 12 ? timeOfDay[0] : timeOfDay[1];
  const [selectedTimeOfDay, setSelectedTimeOfDay] =
    useState<string>(defaultTimeOfDay);
  const [selectedSession, setSelectedSession] = useState<string>(
    courses.length > 0 ? courses[0].courseid : '',
  );
  /**
   * OpenLecture interface.
   * This interface defines the shape of an OpenLecture object.
   */
  interface OpenLecture {
    id: string;
    lectureid: string;
    courseid: string;
    teacher: string;
    start_date: string;
    timeofday: string;
    code: string;
    topicname: string;
  }
  const [loading, setLoading] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [highlightedDates, setHighlightedDates] = useState<Date[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [openLectures, setOpenLectures] = useState<OpenLecture[]>([]);
  const [showEndedCourses, setShowEndedCourses] = useState(false);
  // const [openDataText, setOpenDataText] = useState('');

  /**
   * Reservation interface.
   * This interface defines the shape of a Reservation object.
   */
  interface Reservation {
    startDate: string;
  }
  /**
   * Course interface.
   * This interface defines the shape of a Course object.
   */
  interface Course {
    codes: string;
    email: string;
    end_date: string;
  }
  const findNextLecture = (reservations) => {
    // Get current date
    const now = new Date();
    // Find the next upcoming lecture
    let nextLecture;
    try {
      nextLecture = reservations.find(
        (lecture) =>
          (new Date(lecture.startDate) <= now &&
            now <= new Date(lecture.endDate)) ||
          new Date(lecture.startDate) > now,
      );
    } catch (error) {
      console.log('Failed to find next lecture: ' + (error as Error).message);
      return;
    }

    // Check if the current time falls within the start and end time of the lecture
    if (
      nextLecture &&
      new Date(nextLecture.startDate) <= now &&
      now <= new Date(nextLecture.endDate)
    ) {
      const room = nextLecture.resources.find(
        (resource) => resource.type === 'room',
      );

      const message = ` ${nextLecture.subject}, Room: ${
        room?.code
      }  started at ${new Date(nextLecture.startDate).toLocaleTimeString()} `;
      toast.info('Open data result for next lecture: ' + message);
    } else if (nextLecture) {
      const room = nextLecture.resources.find(
        (resource) => resource.type === 'room',
      );

      const startDate = new Date(nextLecture.startDate);
      const today = new Date();
      const isToday =
        startDate.getDate() === today.getDate() &&
        startDate.getMonth() === today.getMonth() &&
        startDate.getFullYear() === today.getFullYear();

      const message = `${nextLecture.subject},  Room: ${
        room?.code
      } scheduled for ${
        isToday ? 'today' : startDate.toLocaleDateString()
      } at ${startDate.toLocaleTimeString()} `;
      toast.info('Open data result for next lecture: ' + message);
    } else {
      console.log('No next lecture found');
    }
  };

  useEffect(() => {
    if (selectedCourse) {
      console.log('🚀 ~ useEffect ~ selectedCourse:', selectedCourse);
      const token: string | null = localStorage.getItem('userToken');
      if (!token) {
        throw new Error('No token available');
      }

      apihooks.getCourseReservations(selectedCourse, token).then((data) => {
        const dates = data.reservations.map(
          (reservation: Reservation) => new Date(reservation.startDate),
        );
        setHighlightedDates(dates);
        const newText = findNextLecture(data.reservations);
        console.log('🚀 ~ apihooks.getCourseReservations ~ newText:', newText);

        // setOpenDataText(newText);
      });
    }
  }, [selectedCourse]);

  useEffect(() => {
    if (calendarOpen) {
      inputRef.current?.focus();
    }
  }, [calendarOpen]);
  useEffect(() => {
    if (user) {
      try {
        setLoading(true);
        const token: string | null = localStorage.getItem('userToken');
        if (!token) {
          throw new Error('No token available');
        }

        apihooks
          .getAllCoursesByInstructorEmail(user.email, token)
          .then((data) => {
            setAllCourses(data);

            const currentCourses = data.filter(
              (course) =>
                new Date(course.end_date).setHours(0, 0, 0, 0) >=
                new Date().setHours(0, 0, 0, 0),
            );

            setCourses(currentCourses);
            setLoading(false);
            setSelectedCourse(currentCourses[0]);
            setSelectedTopic(currentCourses[0].topic_names.split(',')[0]);
          });
      } catch (error) {
        console.error(error);
      }
    }
  }, [user]);
  const toggleCalendar = () => {
    setCalendarOpen((prev) => !prev);
  };
  const tileClassName = ({date, view}: {date: Date; view: string}) => {
    // Add class to dates in the month view only
    if (view === 'month') {
      // Check if a date React-Calendar wants to check is on the list of dates to highlight
      if (
        highlightedDates.find(
          (dDate) =>
            formatISO(dDate, {representation: 'date'}) ===
            formatISO(date, {representation: 'date'}),
        )
      ) {
        return 'highlight';
      }
    }
    return '';
  };
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (selectedCourse && selectedCourse.topic_names) {
      const topics = selectedCourse.topic_names.split(',');
      if (topics[selectedIndex]) {
        setSelectedTopic(topics[selectedIndex]);
      } else {
        setSelectedTopic(topics[0]);
        setSelectedIndex(0);
      }
    }
  }, [selectedCourse, selectedIndex]);
  const handleDateChangeCalendar = (
    value: Date | Date[] | null | [Date | null, Date | null],
  ) => {
    if (value) {
      let date: Date | null = null;
      if (Array.isArray(value)) {
        date = value[0];
      } else {
        date = value;
      }

      if (date) {
        setDate(date);
        const hours = date.getHours();
        setSelectedTimeOfDay(hours < 12 ? 'am' : 'pm');
        setCalendarOpen(false);
      }
    }
  };

  const handleOpenAttendance = async () => {
    const state = 'open';

    try {
      const token: string | null = localStorage.getItem('userToken');
      if (!token) {
        toast.error('No token available');
        throw new Error('No token available');
      }

      // Check for open lectures first
      const responseOpenLectures = await apihooks.getOpenLecturesByCourseid(
        selectedCourse?.courseid,
        token,
      );

      if (responseOpenLectures.length > 0) {
        setOpenLectures(responseOpenLectures);
        setDeleteModalOpen(true);
        return;
      }

      // Validate date input
      if (Array.isArray(date)) {
        toast.error(`Cannot create attendance for multiple dates`);
        return;
      }

      if (!selectedTimeOfDay) {
        toast.error(`Time of day not selected`);
        return;
      }

      if (!selectedTopic || !selectedCourse) {
        toast.error(`Topic or course not selected`);
        return;
      }

      // Properly construct and validate Date objects
      try {
        // Set hours based on time of day (am/pm)
        const start_date = new Date(date);
        start_date.setHours(selectedTimeOfDay === 'am' ? 10 : 14, 30, 0, 0);

        const end_date = new Date(date);
        end_date.setHours(selectedTimeOfDay === 'am' ? 13 : 17, 30, 0, 0);

        // Validate date objects
        if (isNaN(start_date.getTime())) {
          toast.error('Invalid start date');
          return;
        }

        if (isNaN(end_date.getTime())) {
          toast.error('Invalid end date');
          return;
        }

        if (start_date >= end_date) {
          toast.error('Start date must be before end date');
          return;
        }

        const response = await apihooks.CreateLecture(
          selectedTopic,
          selectedCourse,
          start_date,
          end_date,
          selectedTimeOfDay,
          state,
          token,
        );

        if (!response || !response.lectureInfo) {
          toast.error('Error creating lecture');
          throw new Error('Error creating lecture');
        }

        const lectureid = response.lectureInfo.lectureid;
        navigate(`/teacher/attendance/${lectureid}`);
        toast.success(
          `Lecture created successfully with lectureid ${lectureid}`,
        );
      } catch (error) {
        if (error instanceof Error) {
          toast.error(`Date error: ${error.message}`);
        } else {
          toast.error('Date error: Unknown error occurred');
        }
      }
    } catch (error) {
      console.error('Error creating lecture:', error);
      if (error instanceof Error) {
        toast.error(`Error creating lecture: ${error.message}`);
      } else {
        toast.error('An unknown error occurred while creating the lecture');
      }
    }
  };

  interface Course {
    name: string;
    code: string;
    courseid: string | (() => string);
    topic_names: string;
  }

  const handleDelete = (lectureid: string) => {
    // Delete the open lecture here
    const token: string | null = localStorage.getItem('userToken');
    if (!token) {
      toast.error('No token available');
      throw new Error('No token available');
    }
    try {
      apihooks.deleteLectureByLectureId(lectureid, token);
      toast.success(`Lecture deleted successfully`);
      toast.info(`Click open again to start a new lecture`);
    } catch (error) {
      toast.error(`Error deleting lecture: ${error}`);
      console.error(`Error deleting lecture: ${error}`);
    }
    setDeleteModalOpen(false);
  };

  const closeLecture = async (lectureid: string) => {
    // Close the open lecture here
    const token: string | null = localStorage.getItem('userToken');
    if (!token) {
      toast.error('No token available');
      throw new Error('No token available');
    }
    try {
      await apihooks.closeLectureByLectureId(lectureid, token);
      toast.success(`Lecture closed successfully`);
      toast.info(`Click open again to start a new lecture`);
    } catch (error) {
      toast.error(`Error closing lecture: ${error}`);
      console.error(`Error closing lecture: ${error}`);
    }
    setDeleteModalOpen(false);
  };

  return (
    <div className='w-full max-w-6xl mx-auto'>
      {loading ? (
        <div className='flex items-center justify-center min-h-[60vh]'>
          <Loader />
        </div>
      ) : (
        <>
          {openLectures.map((lecture) => (
            <DeleteLectureModal
              key={lecture.lectureid}
              open={deleteModalOpen}
              lecture={lecture}
              onClose={() => setDeleteModalOpen(false)}
              onCloseLecture={() => closeLecture(lecture.lectureid)}
              onDelete={() => handleDelete(lecture.lectureid)}
            />
          ))}
          <div className='flex flex-col items-center w-full p-4 m-auto bg-white shadow-lg rounded-xl 2xl:w-4/6 lg:w-5/6'>
            <CheckOpenLectures />
            <h1 className='p-2 mt-5 mb-6 text-2xl font-bold text-center text-metropolia-main-grey font-heading sm:text-3xl'>
              {t('teacher:createLecture.title')}
            </h1>

            {/* Course Selection Section */}
            <div className='w-full p-6 mb-8 bg-metropolia-support-white rounded-lg shadow-sm'>
              <h2 className='pb-4 mb-4 text-xl font-semibold border-b-2 border-metropolia-main-orange text-metropolia-main-grey'>
                {t('teacher:createLecture.courseSection.heading')}
              </h2>

              <div className='flex flex-col gap-6 md:flex-row md:items-start'>
                {/* Left Column - Labels */}
                <div className='flex flex-col w-full gap-4 md:w-1/3'>
                  <div className='flex items-center gap-2 mb-1'>
                    <div className='flex items-center justify-center w-10 h-10 rounded-full bg-metropolia-main-orange/10'>
                      <MenuBookIcon className='text-metropolia-main-orange' />
                    </div>
                    <label
                      className='text-lg font-medium text-metropolia-main-grey'
                      htmlFor='course'>
                      {t('teacher:createLecture.courseSection.courseLabel')}
                    </label>
                  </div>

                  <div className='flex items-center gap-2'>
                    <div className='flex items-center justify-center w-10 h-10 rounded-full bg-metropolia-main-orange/10'>
                      <TopicIcon className='text-metropolia-main-orange' />
                    </div>
                    <label
                      className='text-lg font-medium text-metropolia-main-grey'
                      htmlFor='topic'>
                      {t('teacher:createLecture.courseSection.topicLabel')}
                    </label>
                  </div>
                </div>

                {/* Right Column - Selection Inputs */}
                <div className='flex flex-col w-full gap-4 md:w-2/3'>
                  {/* Course selection with filter button */}
                  <div className='relative'>
                    <div className='flex items-center gap-2'>
                      <div className='relative flex-grow'>
                        <select
                          title={t(
                            'teacher:createLecture.courseSection.tooltips.pickCourse',
                          )}
                          id='course'
                          className='w-full px-4 py-3 pr-10 bg-white border rounded-lg cursor-pointer border-metropolia-main-grey/20 focus:border-metropolia-main-orange focus:ring-2 focus:ring-metropolia-secondary-orange/20 focus:outline-none transition-all'
                          value={selectedSession}
                          onClick={() => {
                            if (courses.length === 0) {
                              toast.error(
                                t(
                                  'teacher:createLecture.courseSection.errors.noCourses',
                                ),
                              );
                            }
                          }}
                          onChange={(e) => {
                            const selectedIndex = e.target.value;
                            setSelectedSession(selectedIndex);
                            setSelectedCourse(courses[selectedIndex] || null);
                            setSelectedTopic(
                              courses[selectedIndex] &&
                                courses[selectedIndex].topic_names
                                ? courses[selectedIndex].topic_names.split(
                                    ',',
                                  )[0]
                                : '',
                            );
                          }}
                          aria-label={t(
                            'teacher:createLecture.courseSection.courseLabel',
                          )}>
                          {Array.isArray(courses) &&
                            courses.map((course, index) => {
                              const courseId =
                                typeof course.courseid === 'function'
                                  ? course.courseid()
                                  : course.courseid;

                              const courseName = course.name || 'No Name';
                              const courseCode = course.code || 'No Code';

                              if (!courseId || !courseName || !courseCode) {
                                console.error('Invalid course data:', course);
                                return null;
                              }

                              return (
                                <option key={index} value={index}>
                                  {courseName + ' | ' + courseCode}
                                </option>
                              );
                            })}
                        </select>
                      </div>

                      <div className='flex items-center'>
                        <Tooltip
                          title={t(
                            `teacher:createLecture.courseSection.tooltips.${
                              showEndedCourses ? 'hideEnded' : 'showEnded'
                            }`,
                          )}
                          placement='top'>
                          <IconButton
                            aria-label={t(
                              `teacher:createLecture.courseSection.tooltips.${
                                showEndedCourses ? 'hideEnded' : 'showEnded'
                              }`,
                            )}
                            className='text-metropolia-main-orange hover:text-metropolia-secondary-orange hover:bg-metropolia-main-orange/10 transition-all'
                            onClick={() => {
                              const filteredCourses = showEndedCourses
                                ? allCourses.filter(
                                    (course) =>
                                      new Date(course.end_date).setHours(
                                        0,
                                        0,
                                        0,
                                        0,
                                      ) >= new Date().setHours(0, 0, 0, 0),
                                  )
                                : allCourses;

                              setShowEndedCourses(!showEndedCourses);
                              setCourses(filteredCourses);
                            }}>
                            {showEndedCourses ? (
                              <VisibilityOffIcon />
                            ) : (
                              <VisibilityIcon />
                            )}
                          </IconButton>
                        </Tooltip>
                        <div
                          className={`ml-1 text-sm ${
                            showEndedCourses
                              ? 'text-metropolia-support-red'
                              : 'text-metropolia-trend-green'
                          }`}></div>
                      </div>
                    </div>
                  </div>

                  {/* Topic selection with enhanced styling */}
                  <div className='relative'>
                    <select
                      title={t(
                        'teacher:createLecture.courseSection.tooltips.pickTopic',
                      )}
                      id='topic'
                      className='w-full px-4 py-3 bg-white border rounded-lg cursor-pointer border-metropolia-main-grey/20 focus:border-metropolia-main-orange focus:ring-2 focus:ring-metropolia-secondary-orange/20 focus:outline-none transition-all'
                      value={selectedTopic}
                      onChange={(e) => {
                        const index = e.target.selectedIndex;
                        setSelectedIndex(index);
                        setSelectedTopic(e.target.value);
                      }}
                      aria-label={t(
                        'teacher:createLecture.courseSection.topicLabel',
                      )}>
                      {selectedCourse &&
                        selectedCourse.topic_names &&
                        selectedCourse.topic_names
                          .split(',')
                          .map((topic: string) => (
                            <option key={topic} value={topic}>
                              {topic}
                            </option>
                          ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Date & Time Section */}
            <div className='w-full p-6 mb-8 bg-metropolia-support-white rounded-lg shadow-sm'>
              <h2 className='pb-4 mb-4 text-xl font-semibold border-b-2 border-metropolia-main-orange text-metropolia-main-grey'>
                {t('teacher:createLecture.dateSection.heading')}
              </h2>
              <div className='flex flex-col gap-6 md:flex-row md:items-start'>
                <div className='w-full md:w-1/2'>
                  <div className='relative'>
                    <label
                      className='flex items-center gap-2 mb-2 text-lg font-medium text-metropolia-main-grey'
                      htmlFor='calendar'>
                      <CalendarMonthIcon className='text-metropolia-main-orange' />
                      {t('teacher:createLecture.dateSection.calendar.label')}
                    </label>
                    <input
                      title={t(
                        'teacher:createLecture.dateSection.calendar.tooltip',
                      )}
                      ref={inputRef}
                      type='text'
                      aria-label='Date'
                      className='w-full px-4 py-3 text-center cursor-pointer bg-white border rounded-lg border-metropolia-main-grey/20 focus:border-metropolia-main-orange focus:ring-2 focus:ring-metropolia-secondary-orange/20 focus:outline-none transition-all'
                      value={
                        Array.isArray(date)
                          ? t(
                              'teacher:createLecture.dateSection.calendar.multipleDates',
                            )
                          : date.toDateString()
                      }
                      onClick={toggleCalendar}
                      onChange={(e) => setDate(new Date(e.target.value))}
                      id='calendar'
                    />
                    {calendarOpen && (
                      <div className='absolute left-0 right-0 z-20 p-1 mt-1 bg-white rounded-lg shadow-lg'>
                        <Calendar
                          onChange={handleDateChangeCalendar}
                          tileClassName={tileClassName}
                          onClickDay={(date) => setDate(date)}
                          className='border-0 rounded-lg'
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className='w-full md:w-1/2'>
                  <div className='relative'>
                    <label
                      className='flex items-center gap-2 mb-2 text-lg font-medium text-metropolia-main-grey'
                      htmlFor='timeofday'>
                      <AccessTimeIcon className='text-metropolia-main-orange' />
                      {t('teacher:createLecture.dateSection.timeOfDay.label')}
                    </label>
                    <select
                      id='timeofday'
                      aria-label={t(
                        'teacher:createLecture.dateSection.timeOfDay.label',
                      )}
                      title={t(
                        'teacher:createLecture.dateSection.timeOfDay.tooltip',
                      )}
                      value={selectedTimeOfDay}
                      onChange={(e) => setSelectedTimeOfDay(e.target.value)}
                      className='w-full px-4 py-3 text-center bg-white cursor-pointer border rounded-lg border-metropolia-main-grey/20 focus:border-metropolia-main-orange focus:ring-2 focus:ring-metropolia-secondary-orange/20 focus:outline-none transition-all'>
                      {timeOfDay.map((option) => (
                        <option key={option} value={option}>
                          {option.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className='w-full text-center'>
              <h3 className='mb-4 text-lg font-medium text-metropolia-main-grey'>
                {t('teacher:createLecture.doubleCheckMessage')}
              </h3>

              <button
                aria-label={t('teacher:createLecture.buttons.open')}
                title={`${t('teacher:createLecture.buttons.open')} ${
                  selectedCourse?.name
                } - ${selectedCourse?.code} - ${selectedTopic}`}
                className='px-6 py-3 m-4 text-lg font-medium text-white transition-all rounded-md shadow-md font-heading bg-metropolia-main-orange hover:bg-metropolia-secondary-orange focus:outline-none focus:ring-2 focus:ring-metropolia-secondary-orange focus:ring-offset-2'
                onClick={handleOpenAttendance}>
                {t('teacher:createLecture.buttons.open')}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CreateLecture;
