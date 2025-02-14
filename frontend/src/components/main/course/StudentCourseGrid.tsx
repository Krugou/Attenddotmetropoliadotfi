import Delete from '@mui/icons-material/Delete';
import ReportIcon from '@mui/icons-material/Report';
import {Modal} from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import React, {useContext, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {toast} from 'react-toastify';
import {UserContext} from '../../../contexts/UserContext';
import apiHooks from '../../../api';
import {useCourses} from '../../../hooks/courseHooks';
import DeleteModal from '../modals/DeleteModal';
import EditTopicsModal from '../modals/EditTopicsModal';
import {useTranslation} from 'react-i18next';
/**
 * Course interface represents the structure of a course.
 * It includes properties for the course's name, code, start date, end date, student group name, topic names, selected topics, creation date, instructor's name, and user course id.
 */
interface Course {
  courseid: number;
  course_name: string;
  startDate: string;
  endDate: string;
  code: string;
  student_group: number | null;
  topic_names: string;
  selected_topics: string;
  instructor_name: string;
  usercourseid: number;
}
/**
 * SelectedCourse interface represents the structure of a selected course.
 * It includes properties for the course's name, code, id, start date, end date, student group name, topic names, selected topics, and creation date.
 */
interface SelectedCourse {
  name: string;
  code: string;
  courseid: number;
  start_date: string;
  end_date: string;
  studentgroup_name: string;
  topic_names: string;
  selected_topics: string;
  created_at: string;
}
/**
 * StudentCourseGridProps interface represents the structure of the StudentCourseGrid props.
 * It includes properties for the courses, show ended courses state, update view function, add student to course function, and remove student from course function.
 */
interface StudentCourseGridProps {
  courses: Course[];
  showEndedCourses: boolean;
  updateView?: () => void;
  handleAddStudentToCourse?: (courseid: number | undefined) => void;
  handleRemoveStudentFromCourse?: (usercourseid: number) => void;
}
/**
 * StudentCourseGrid component.
 * This component is responsible for displaying a grid of courses for a student.
 * It uses the courses, showEndedCourses, updateView, handleAddStudentToCourse, and handleRemoveStudentFromCourse props to determine the current state of the grid and to handle user interactions.
 * The component uses the useState hook from React to manage the state of the course name, course topics, modified topics, initial course topics, user course id, open state, new topic, selected course, course to delete, and delete modal open state.
 * The component also uses the useContext hook from React to access the user context, and the useNavigate hook from React Router to navigate between pages.
 *
 * @param {StudentCourseGridProps} props The props that define the state and behavior of the grid.
 * @returns {JSX.Element} The rendered StudentCourseGrid component.
 */
const StudentCourseGrid: React.FC<StudentCourseGridProps> = ({
  courses,
  showEndedCourses,
  updateView,
  handleAddStudentToCourse,
  handleRemoveStudentFromCourse,
}) => {
  const {user} = useContext(UserContext);
  const navigate = useNavigate();
  const [courseName, setCourseName] = useState('');
  const [courseTopics, setCourseTopics] = useState<string[]>([]);
  const [modifiedTopics, setModifiedTopics] = useState<string[]>([]);
  const [initialCourseTopics, setInitialCourseTopics] = useState<string[]>([]);
  const [usercourseid, setUsercourseid] = useState<number>(0);
  const [open, setOpen] = useState(false);
  const [newTopic, setNewTopic] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<SelectedCourse | null>(
    null,
  );

  const [courseToDelete, setCourseToDelete] = useState<number | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [editCourseOpen, setEditCourseOpen] = useState(false);
  const {courses: editCourses} =
    user?.role !== 'student' ? useCourses() : {courses: []};
  const handleOpenEditCourse = () => {
    setEditCourseOpen(true);
  };

  const handleCloseEditCourse = () => {
    setEditCourseOpen(false);
  };

  // Open and close the modal
  const handleOpen = (
    thisCourseName,
    thisCourseTopics,
    thisusercourseid,
    allTopicsArray,
  ) => {
    setOpen(true);
    // Set the course name and topics
    setCourseName(thisCourseName);
    // Set the initial topics to be used in the reset function (student's topics)
    setInitialCourseTopics(thisCourseTopics);
    // Set the course topics to be used in the modal (all topics in the course)
    setCourseTopics(allTopicsArray);
    // Set the modified topics
    setModifiedTopics(thisCourseTopics);
    // Set the usercourseid to be used in the save function
    setUsercourseid(thisusercourseid);
  };

  // Handle the topic change
  const handleTopicChange = (topic) => {
    toast.info('Topics changed');
    // If the topic is already in the modified topics array, remove it
    setModifiedTopics((prevTopics) =>
      prevTopics.includes(topic)
        ? prevTopics.filter((t) => t !== topic)
        : [...prevTopics, topic],
    );
  };
  const handleDeleteTopic = (topic) => {
    // If the topic is already in the modified topics array, remove it
    setCourseTopics((prevTopics) => prevTopics.filter((t) => t !== topic));
    setModifiedTopics((prevTopics) => prevTopics.filter((t) => t !== topic));
  };

  // Reset the data
  const resetData = () => {
    // Reset the topics to the initial topics
    setCourseTopics(initialCourseTopics);
    setModifiedTopics(initialCourseTopics);
  };

  const handleSave = async (usercourseid) => {
    console.log(usercourseid, 'USERCOURSEID');
    console.log(modifiedTopics, 'MODIFIED TOPICS');
    const token = localStorage.getItem('userToken');
    if (!token) {
      throw new Error('No token available');
    }
    try {
      const response = await apiHooks.updateUserCourseTopics(
        token,
        usercourseid,
        modifiedTopics,
      );
      console.log(response);
      toast.success('Topics saved');

      // Rerender the view after saving the topics
      updateView && updateView();
    } catch (error) {
      toast.error('Error saving topics');
    }

    setOpen(false);
  };

  let additionalClasses = '';

  if (courses.length === 2) {
    additionalClasses = 'grid-cols-1 md:grid-cols-2';
  } else if (courses.length >= 3) {
    additionalClasses =
      'grid-cols-1 md:grid-cols-2 xl:grid-cols-3 h-fit sm:max-h-[30em] overflow-hidden sm:overflow-y-scroll';
  } else if (courses.length === 1) {
    additionalClasses = 'grid-cols-1';
  }
  const handleCourseSelect = (value: string) => {
    const selected: SelectedCourse | undefined = editCourses.find(
      (course: SelectedCourse) => `${course.name} ${course.code}` === value,
    );
    setSelectedCourse(selected || null);
  };

  console.log(selectedCourse, 'SELECTED COURSE');
  const {t} = useTranslation(['teacher']);
  return (
    <div className={`grid ${additionalClasses} gap-4 mt-4`}>
      {courses
        .filter((course) => {
          const endDate = new Date(course.endDate);
          const isCourseEnded =
            endDate.setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0);
          return !isCourseEnded || showEndedCourses;
        })
        .map((course, index) => {
          // Format the dates
          const startDate = new Date(course.startDate).toLocaleDateString();
          const endDate = new Date(course.endDate);
          const endDateString = endDate.toLocaleDateString();
          const studentsTopicsArray = course.selected_topics
            ? course.selected_topics.split(',')
            : course.topic_names
            ? course.topic_names.split(',')
            : [];
          // Format the topics
          const topics = course.selected_topics
            ? // If the course has selected topics by the student, use those
              course.selected_topics.replace(/,/g, ', ') // Replace commas with commas and spaces
            : // Otherwise use the default topics
            course.topic_names
            ? course.topic_names.replace(/,/g, ', ')
            : 'You have no assigned topics on this course';

          const allTopicsArray = course?.topic_names.split(',');
          // Check if the course has ended
          const isCourseEnded =
            endDate.setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0);

          return (
            <Tooltip
              placement='top'
              title={
                isCourseEnded
                  ? t('teacher:studentCourse.tooltips.courseEnded')
                  : ''
              }
              key={index}>
              <div
                className={`p-5 bg-white shadow-md rounded-lg relative ${
                  isCourseEnded ? 'opacity-50' : ''
                }`}>
                {isCourseEnded && (
                  <div className='absolute top-2 right-2'>
                    <ReportIcon style={{color: 'red'}} />
                  </div>
                )}
                <h2 className='mb-2 text-lg text-black underline font-heading sm:text-2xl underline-offset-8 decoration-metropolia-main-orange'>
                  {course.course_name + ' ' + course.code}
                </h2>
                <p className='mb-1'>
                  <strong>
                    {t('teacher:studentCourse.labels.assignedTopics')}
                  </strong>{' '}
                  {topics}
                </p>
                {user?.role !== 'student' && (
                  <p className='mb-1'>
                    <strong>
                      {t('teacher:studentCourse.labels.allTopics')}
                    </strong>{' '}
                    {course?.topic_names.replace(/,/g, ', ')}
                  </p>
                )}
                <p className='mb-1'>
                  <strong>{t('teacher:studentCourse.labels.startDate')}</strong>{' '}
                  {startDate}
                </p>
                <p className='mb-1'>
                  <strong>{t('teacher:studentCourse.labels.endDate')}</strong>{' '}
                  {endDateString}
                </p>
                <h2 className='mt-2 text-lg text-gray-700 font-heading'>
                  {t('teacher:studentCourse.labels.instructors')}
                </h2>
                <ul>
                  {course.instructor_name
                    .split(',')
                    .map((instructor, index) => (
                      <li key={index}>{instructor.trim()}</li>
                    ))}
                </ul>
                <div className='flex flex-wrap items-center justify-between'>
                  <button
                    className={`mt-4 mr-4 transition font-heading md:text-base text-sm py-2 px-4 rounded ${
                      isCourseEnded
                        ? 'bg-metropolia-support-red hover:bg-red-900'
                        : 'bg-metropolia-main-orange hover:bg-metropolia-secondary-orange'
                    } text-white`}
                    onClick={() =>
                      user?.role === 'student'
                        ? navigate(
                            `/student/courses/attendance/${course.usercourseid}`,
                          )
                        : navigate(
                            user?.role === 'admin'
                              ? `/counselor/students/attendance/${course.usercourseid}`
                              : `/${user?.role}/students/attendance/${course.usercourseid}`,
                          )
                    }>
                    {t('teacher:studentCourse.buttons.attendance')}
                  </button>
                  {user?.role !== 'student' && (
                    <>
                      <button
                        className={`mt-4 mr-2 transition md:text-base text-sm md:mr-4 font-heading py-2 px-4 rounded ${
                          isCourseEnded
                            ? 'bg-metropolia-support-red hover:bg-red-900'
                            : 'bg-metropolia-main-orange hover:bg-metropolia-secondary-orange'
                        } text-white`}
                        onClick={() =>
                          handleOpen(
                            course.course_name,
                            studentsTopicsArray,
                            course.usercourseid,
                            allTopicsArray,
                          )
                        }>
                        {t('teacher:studentCourse.buttons.editTopics')}
                      </button>
                      <Tooltip
                        title={t(
                          'teacher:studentCourse.tooltips.removeStudent',
                        )}>
                        <div className='w-[2.5em] mt-5  right-5 bg-gray-100 rounded-lg'>
                          <IconButton
                            onClick={() => {
                              setIsDeleteModalOpen(true);
                              setCourseToDelete(course.usercourseid); // Set the course to delete
                            }}
                            aria-label='remove student'>
                            <Delete style={{color: 'red'}} />
                          </IconButton>
                        </div>
                      </Tooltip>
                      <DeleteModal
                        isOpen={isDeleteModalOpen}
                        onDelete={() => {
                          if (courseToDelete !== null) {
                            handleRemoveStudentFromCourse &&
                              handleRemoveStudentFromCourse(courseToDelete);
                            setIsDeleteModalOpen(false); // Close the modal
                          }
                        }}
                        student={true}
                        onClose={() => setIsDeleteModalOpen(false)}
                      />
                      <EditTopicsModal
                        open={open}
                        setOpen={setOpen}
                        courseName={courseName} // replace 'courseName' with the actual course name
                        newTopic={newTopic}
                        setNewTopic={setNewTopic}
                        courseTopics={courseTopics}
                        setCourseTopics={setCourseTopics}
                        modifiedTopics={modifiedTopics}
                        handleTopicChange={handleTopicChange}
                        handleDeleteTopic={handleDeleteTopic}
                        resetData={resetData}
                        counselor={true}
                        usercourseid={usercourseid}
                        handleSave={handleSave}
                      />
                    </>
                  )}
                </div>
              </div>
            </Tooltip>
          );
        })}
      {user?.role !== 'student' && (
        <>
          <div
            className='flex items-center justify-center p-4 text-center transition-colors duration-200 ease-in-out bg-gray-200 rounded-lg cursor-pointer hover:bg-gray-300'
            onClick={() => {
              handleOpenEditCourse();
            }}>
            <button className='flex flex-col items-center'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
                className='w-8 h-8 mb-2'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 6v6m0 0v6m0-6h6m-6 0H6'
                />
              </svg>
              {t('teacher:studentCourse.buttons.addStudent')}
            </button>
          </div>
          <Modal open={editCourseOpen} onClose={handleCloseEditCourse}>
            <div className='flex items-center justify-center'>
              <div className='absolute max-w-xl p-8 m-4 mx-auto transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg top-1/2 left-1/2'>
                <div>
                  <Autocomplete
                    className='sm:w-[20em] w-1/2'
                    freeSolo
                    options={editCourses.map(
                      (course: SelectedCourse) =>
                        `${course.name} ${course.code}`,
                    )}
                    onChange={(_, value) => handleCourseSelect(value as string)}
                    value={
                      selectedCourse
                        ? `${selectedCourse.name} ${selectedCourse.code}`
                        : null
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={t('teacher:studentCourse.labels.searchCourses')}
                        margin='normal'
                        variant='outlined'
                      />
                    )}
                  />
                  {selectedCourse && (
                    <div>
                      <p className='mt-2'>
                        {selectedCourse?.name} {selectedCourse?.code}
                      </p>
                      <p className='mt-2'>
                        Topics:{' '}
                        {selectedCourse?.topic_names.split(',').join(', ')}
                      </p>
                      <p className='mt-2'>
                        Course Started:{' '}
                        {new Date(
                          selectedCourse?.start_date,
                        ).toLocaleDateString()}
                      </p>
                      <p className='mt-2'>
                        Course ends:{' '}
                        {new Date(
                          selectedCourse?.end_date,
                        ).toLocaleDateString()}
                      </p>
                      <p className='mt-2'>
                        Student group: {selectedCourse?.studentgroup_name}
                      </p>
                      <p className='mt-2'>
                        Course created:{' '}
                        {new Date(
                          selectedCourse?.created_at,
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  <button
                    className='px-4 py-2 mt-4 text-white transition rounded-sm font-heading bg-metropolia-main-orange hover:bg-metropolia-secondary-orange'
                    onClick={() => {
                      handleAddStudentToCourse &&
                        handleAddStudentToCourse(selectedCourse?.courseid);
                      handleCloseEditCourse();
                    }}>
                    {t('teacher:studentCourse.buttons.addToCourse')}
                  </button>
                </div>
              </div>
            </div>
          </Modal>
        </>
      )}
    </div>
  );
};

export default StudentCourseGrid;
