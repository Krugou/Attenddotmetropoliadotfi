import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import React, {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {toast} from 'react-toastify';
import AddTeachers from '../../../../components/main/course/createcourse/AddTeachers';
import CourseDetails from '../../../../components/main/course/createcourse/CourseDetails';
import EditTopicsModal from '../../../../components/main/modals/EditTopicsModal';
import apiHooks from '../../../../api';
import {useTranslation} from 'react-i18next';
/**
 * CourseDetail interface.
 * This interface defines the shape of a course detail object.
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
 * AdminCourseModify component.
 * This component is responsible for rendering the course modification view for an admin.
 * It includes form fields for modifying various aspects of a course, including its name, code, student group, start and end dates, topics, and instructors.
 * It also includes logic for handling changes to these fields and submitting the modified course data to the server.
 *
 * @returns {JSX.Element} The rendered AdminCourseModify component.
 */
const AdminCourseModify: React.FC = () => {
  const {t} = useTranslation(['admin']);
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
        setCourseData(courseData[0]);
        setIsLoading(false);
        setInstructorEmail(courseData[0].instructor_name);
      }
    };

    fetchCourses();
  }, [id]);

  useEffect(() => {
    if (courseData) {
      setCourseCode(courseData.code);
      setCourseName(courseData.name);
      setStudentGroup(courseData.studentgroup_name);
      const startDate = new Date(courseData.start_date || '')
        .toISOString()
        .slice(0, 16);
      setStartDate(startDate);
      const endDate = new Date(courseData.end_date || '')
        .toISOString()
        .slice(0, 16);
      setEndDate(endDate);
      if (courseData.instructor_name) {
        setInstructors(
          courseData.instructor_name.split(',').map((email) => ({email})),
        );
      }
      // Parse the topics from the courseData into an array of strings
      const topics = courseData.topic_names.split(',');
      // Set the courseTopics state
      setCourseTopics(topics);
      setModifiedTopics(topics);
      setInitialCourseTopics(topics);
    }
  }, [courseData]);
  if (isLoading) {
    return <div>{t('admin:common.loading')}</div>;
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
      toast.success(t('admin:courses.success.modifySuccess'));
      navigate('/admin/courses/' + id);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error(t('admin:courses.error.modifyError'));
      }
    }
    console.log(modifiedData);
  };

  const handleTopicChange = (topic) => {
    toast.info(t('admin:courses.info.topicChange'));
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
      <h2 className='mb-6 font-semibold text-center text-gray-800 text-md sm:text-2xl'>
        {t('admin:courses.modify.mainTitle')}
      </h2>

      <form
        onSubmit={(e) => {
          e.preventDefault();
        }}
        className='w-full px-8 pt-6 pb-8 mx-auto mb-4 bg-white shadow-md md:w-2/4 xl:w-1/4 sm:w-2/3 rounded-xl'>
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
            {t('admin:courses.modify.modifyTeachers')}
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
          className='w-full p-4 mt-4 mb-4 text-left bg-white rounded-md shadow-sm focus:outline-hidden focus:shadow-outline'
          onClick={() => setOpen(true)}>
          {t('admin:courses.modify.modifyTopics')}
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
            className='w-1/2 px-4 py-2 text-white font-heading bg-metropolia-trend-green hover:bg-green-600 rounded-xl focus:outline-hidden focus:shadow-outline'
            type='button'
            onClick={handleSubmit}>
            {t('admin:courses.finish')}
          </button>
        </div>
      </form>
    </div>
  );
};
export default AdminCourseModify;
