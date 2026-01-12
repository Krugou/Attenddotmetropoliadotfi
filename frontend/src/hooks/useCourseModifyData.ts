import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import apiHooks from '../api';
import { useTranslation } from 'react-i18next';

interface Instructor {
  email: string;
}

export const useCourseModifyData = () => {
  const { t } = useTranslation(['admin']);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [courseName, setCourseName] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [studentGroup, setStudentGroup] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [instructorEmail, setInstructorEmail] = useState('');
  const [courseTopics, setCourseTopics] = useState<string[]>([]);
  const [modifiedTopics, setModifiedTopics] = useState<string[]>([]);
  const [initialCourseTopics, setInitialCourseTopics] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [courseExists, setCourseExists] = useState(false);
  const [newTopic, setNewTopic] = useState('');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!id) return;

      const token = localStorage.getItem('userToken');
      if (!token) throw new Error('No token available');

      try {
        setIsLoading(true);
        const courseData = await apiHooks.getCourseDetailByCourseId(id, token);
        const course = courseData[0];

        setCourseName(course.name);
        setCourseCode(course.code);
        setStudentGroup(course.studentgroup_name);
        setStartDate(new Date(course.start_date || '').toISOString().slice(0, 16));
        setEndDate(new Date(course.end_date || '').toISOString().slice(0, 16));
        setInstructorEmail(course.instructor_name);

        const instructorList = course.instructor_name
          ? course.instructor_name.split(',').map((email: string) => ({ email }))
          : [];

        const topics = course.topic_names.split(',').map((t: string) => t.trim());

        setInstructors(instructorList);
        setCourseTopics(topics);
        setModifiedTopics(topics);
        setInitialCourseTopics(topics);

        setIsLoading(false);
      } catch (error) {
        console.error(error);
        setIsLoading(false);
      }
    };

    fetchCourse();
  }, [id]);

  const handleSubmit = async () => {
    const token = localStorage.getItem('userToken');
    if (!token || !id) return;

    const modifiedData = {
      courseName,
      courseCode,
      studentGroup,
      start_date: startDate,
      end_date: endDate,
      topic_names: modifiedTopics,
      instructors: instructors.map(i => i.email),
    };

    try {
      await apiHooks.modifyCourse(token, id, modifiedData);
      toast.success(t('admin:courses.success.modifySuccess'));
      navigate(`/admin/courses/${id}`);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error(t('admin:courses.error.modifyError'));
      }
    }
  };

  const handleTopicChange = (topic: string) => {
    toast.info(t('admin:courses.info.topicChange'));
    setModifiedTopics(prev =>
      prev.includes(topic) ? prev.filter(t => t !== topic) : [...prev, topic]
    );
  };

  const handleDeleteTopic = (topic: string) => {
    setCourseTopics(prev => prev.filter(t => t !== topic));
    setModifiedTopics(prev => prev.filter(t => t !== topic));
  };

  const resetData = () => {
    setCourseTopics(initialCourseTopics);
    setModifiedTopics(initialCourseTopics);
  };

  return {
    id,
    t,
    navigate,
    courseName,
    setCourseName,
    courseCode,
    setCourseCode,
    studentGroup,
    setStudentGroup,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    instructors,
    setInstructors,
    instructorEmail,
    setInstructorEmail,
    courseTopics,
    setCourseTopics,
    modifiedTopics,
    setModifiedTopics,
    initialCourseTopics,
    setInitialCourseTopics,
    courseExists,
    setCourseExists,
    newTopic,
    setNewTopic,
    open,
    setOpen,
    isLoading,
    handleSubmit,
    handleTopicChange,
    handleDeleteTopic,
    resetData,
  };
};
