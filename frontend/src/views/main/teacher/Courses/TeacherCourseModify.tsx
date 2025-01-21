import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import React, {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {toast} from 'react-toastify';
import GeneralLinkButton from '../../../../components/main/buttons/GeneralLinkButton';
import AddTeachers from '../../../../components/main/course/createcourse/AddTeachers';
import CourseDetails from '../../../../components/main/course/createcourse/CourseDetails';
import EditTopicsModal from '../../../../components/main/modals/EditTopicsModal';
import apiHooks from '../../../../hooks/ApiHooks';
import {useTranslation} from 'react-i18next';

/**
 * CourseDetail interface.
 * This interface defines the shape of a CourseDetail object.
 */
interface CourseDetail {
  courseid: string;
  name: string;
  start_date: string;
  end_date: string;
  code: string;
  studentgroup_name: string;
  created_at: string;
  topic_names: string;
  user_count: number;
  instructor_name: string;
}
/**
 * TeacherCourseModify component.
 * This component is responsible for rendering the course modification view for a teacher.
 * It fetches the course details and provides functionality for the teacher to modify the course details, including the course name, code, student group, start and end dates, topics, and instructors.
 */
const TeacherCourseModify: React.FC = () => {
  const {t} = useTranslation();
  const [courseData, setCourseData] = useState<CourseDetail | null>(null);
  const [courseName, setCourseName] = useState(
    courseData ? courseData.name : '',
  );
  const [courseCode, setCourseCode] = useState<string>('');
  const [studentGroup, setStudentGroup] = useState(
    courseData ? courseData.studentgroup_name : '',
  );
  const [startDate, setStartDate] = useState(
    courseData ? courseData.start_date : '',
  );
  const [endDate, setEndDate] = useState(courseData ? courseData.end_date : '');
  const [courseTopics, setCourseTopics] = useState<string[]>([]);
  const [modifiedTopics, setModifiedTopics] = useState<string[]>([]);
  const [initialCourseTopics, setInitialCourseTopics] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [instructors, setInstructors] = useState<{email: string}[]>([]);
  const [instructorEmail, setInstructorEmail] = useState('');
  const navigate = useNavigate();
  const {id} = useParams<{id: string}>();
  const [courseExists, setCourseExists] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [newTopic, setNewTopic] = useState('');
  useEffect(() => {
    const fetchCourses = async () => {
      if (id) {
        setIsLoading(true);
        const token: string | null = localStorage.getItem('userToken');
        if (!token) {
          throw new Error('No token available');
        }
        const courseData = await apiHooks.getCourseDetailByCourseId(id, token);
        console.log(courseData, 'COUSRDATA');
        setCourseData(courseData[0]);
        setIsLoading(false);
        setInstructorEmail(courseData[0].instructor_name);
      }
    };

    fetchCourses();
  }, [id]);

  const toLocalDate = (dateString) => {
    if (!dateString) {
      return '';
    }

    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      return '';
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // months are 0-indexed in JavaScript
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  };
  useEffect(() => {
    if (courseData) {
      setCourseCode(courseData.code);
      setCourseName(courseData.name);

      setStudentGroup(
        courseData.studentgroup_name ? courseData.studentgroup_name : '',
      );

      const startDate = toLocalDate(courseData.start_date);

      setStartDate(startDate);
      const endDate = toLocalDate(courseData.end_date);
      setEndDate(endDate);
      if (courseData.instructor_name) {
        setInstructors(
          courseData.instructor_name.split(',').map((email) => ({email})),
        );
      }
      // Parse the topics from the courseData into an array of strings
      const topics = courseData.topic_names
        ? courseData.topic_names.split(',')
        : [];
      // Set the courseTopics state
      setCourseTopics(topics);
      setModifiedTopics(topics);
      setInitialCourseTopics(topics);
    }
  }, [courseData]);
  if (isLoading) {
    return <div>{t('teacher.courseModify.loading')}</div>;
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const modifiedData = {
      courseName: courseName,
      courseCode: courseCode,
      studentGroup: studentGroup,
      start_date: startDate,
      end_date: endDate,
      topic_names: modifiedTopics,
      instructors: instructors.map((instructor) => instructor.email),
    };
    const token: string | null = localStorage.getItem('userToken');

    try {
      const result = await apiHooks.modifyCourse(token, id, modifiedData);
      console.log(result);
      toast.success('Course modified successfully');
      navigate('/teacher/courses/' + id);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('An unknown error occurred');
      }
    }
    console.log(modifiedData);
  };

  const handleTopicChange = (topic) => {
    toast.info('Topics changed');

    setModifiedTopics((prevTopics) =>
      prevTopics.includes(topic)
        ? prevTopics.filter((t) => t !== topic)
        : [...prevTopics, topic],
    );
  };

  const handleDeleteTopic = (topic) => {
    setCourseTopics((prevTopics) => prevTopics.filter((t) => t !== topic));
    setModifiedTopics((prevTopics) => prevTopics.filter((t) => t !== topic));
  };
  const resetData = () => {
    setCourseTopics(initialCourseTopics);
    setModifiedTopics(initialCourseTopics);
  };

  return (
    <div className='w-full'>
      <h2 className='p-3 m-auto mb-6 font-heading text-center text-gray-800 bg-white rounded-lg w-fit text-md sm:text-2xl'>
        {t('teacher.courseModify.title')}
      </h2>

      <form
        onSubmit={(e) => {
          e.preventDefault();
        }}
        className='w-full px-8 pt-6 pb-8 mx-auto mb-4 bg-white shadow-md md:w-2/4 xl:w-1/4 sm:w-2/3 rounded-xl'>
        <div className='mt-2 mb-4'>
          <GeneralLinkButton
            path={`/teacher/courses`}
            text={t('teacher.courseModify.buttons.backToCourses')}
          />
        </div>
        <CourseDetails
          courseCode={courseCode}
          setCourseCode={setCourseCode}
          courseName={courseName}
          setCourseName={setCourseName}
          studentGroup={studentGroup}
          setStudentGroup={setStudentGroup}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          modify={true}
          courseExists={courseExists}
          setCourseExists={setCourseExists}
        />

        <Accordion className='mt-4 mb-4' onClick={(e) => e.stopPropagation()}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls='panel2a-content'
            id='panel2a-header'>
            {t('teacher.courseModify.sections.teachers.title')}
          </AccordionSummary>
          <AccordionDetails>
            <AddTeachers
              instructors={instructors}
              setInstructors={setInstructors}
              instructorEmail={instructorEmail}
              modify={true}
            />
          </AccordionDetails>
        </Accordion>

        <button
          className='w-full p-4 mt-4 mb-4 text-left bg-white rounded-md shadow focus:outline-none focus:shadow-outline'
          onClick={() => setOpen(true)}>
          {t('teacher.courseModify.sections.topics.title')}
        </button>
        <EditTopicsModal
          open={open}
          setOpen={setOpen}
          courseName={courseName}
          newTopic={newTopic}
          setNewTopic={setNewTopic}
          courseTopics={courseTopics}
          setCourseTopics={setCourseTopics}
          modifiedTopics={modifiedTopics}
          handleTopicChange={handleTopicChange}
          handleDeleteTopic={handleDeleteTopic}
          resetData={resetData}
        />
        <div className='flex justify-center w-full'>
          <button
            className='w-1/2 px-4 py-2 font-heading text-white transition  bg-metropoliaTrendGreen hover:bg-green-600 rounded-xl focus:outline-none focus:shadow-outline'
            type='button'
            onClick={handleSubmit}>
            {t('teacher.courseModify.buttons.finish')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TeacherCourseModify;
