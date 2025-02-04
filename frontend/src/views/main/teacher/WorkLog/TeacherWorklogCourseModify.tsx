import React, {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {toast} from 'react-toastify';
import GeneralLinkButton from '../../../../components/main/buttons/GeneralLinkButton';
import AddTeachers from '../../../../components/main/course/createcourse/AddTeachers';
import apiHooks from '../../../../api';
import {useTranslation} from 'react-i18next';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import WorklogDetails from '../../../../components/main/worklog/WorklogDetails';

interface WorkLogDetail {
  work_log_course_id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  code: string;
  required_hours: number;
  instructor_name: string;
  instructors?: { email: string }[];  // Add this property
}

const TeacherWorklogCourseModify: React.FC = () => {
  const {t} = useTranslation();
  const [worklogData, setWorklogData] = useState<WorkLogDetail | null>(null);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [requiredHours, setRequiredHours] = useState(0);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [instructors, setInstructors] = useState<{email: string}[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [instructorEmail, setInstructorEmail] = useState('');
  const [codeExists, setCodeExists] = useState(false);

  const navigate = useNavigate();
  const {courseid} = useParams<{courseid: string}>();

  useEffect(() => {
    const fetchWorklog = async () => {
      if (courseid) {
        setIsLoading(true);
        const token = localStorage.getItem('userToken');
        if (!token) throw new Error('No token available');

        try {
          const worklogData = await apiHooks.getWorkLogCourseDetail(courseid, token);
          setWorklogData(worklogData.course);

          // Set instructor data from the response
          if (worklogData.course.instructor_name) {
            const instructorEmails = worklogData.course.instructor_name
              .split(',')
              .map(email => ({ email: email.trim() }));
            setInstructors(instructorEmails);
            setInstructorEmail(instructorEmails[0]?.email || '');
          }

          setIsLoading(false);
        } catch (error) {
          console.error('Error fetching worklog:', error);
          toast.error(t('worklog.error.fetchFailed'));
          setIsLoading(false);
        }
      }
    };

    fetchWorklog();
  }, [courseid]);

  useEffect(() => {
    if (worklogData) {
      setName(worklogData.name || '');
      setCode(worklogData.code || '');
      setDescription(worklogData.description || '');
      setRequiredHours(worklogData.required_hours || 0);
      // Add null checks for dates
      if (worklogData.start_date) {
        setStartDate(formatDate(worklogData.start_date));
      }
      if (worklogData.end_date) {
        setEndDate(formatDate(worklogData.end_date));
      }
    }
  }, [worklogData]);

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    // Validate the date is valid before formatting
    if (isNaN(date.getTime())) {
      console.warn('Invalid date string:', dateString);
      return '';
    }
    return date.toISOString().split('T')[0];
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const token = localStorage.getItem('userToken');
    if (!token) throw new Error('No token available');

    if (!name || !code || !startDate || !endDate || requiredHours <= 0) {
      toast.error(t('worklog.error.requiredFields'));
      return;
    }

    if (codeExists && code !== worklogData?.code) {
      toast.error(t('worklog.error.codeExists'));
      return;
    }

    try {
      const modifiedData = {
        name,
        code,
        description,
        required_hours: requiredHours,
        start_date: startDate,
        end_date: endDate,
        instructors: instructors.map(i => i.email),
      };
      await apiHooks.modifyWorkLog(token, courseid, modifiedData);
      toast.success(t('teacher.worklog.modifySuccess'));
      navigate(`/teacher/worklog/${courseid}`);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };

  if (isLoading) {
    return <div>{t('teacher.worklog.modify.loading')}</div>;
  }

  return (
    <div className='w-full'>
      <h2 className='p-3 m-auto mb-6 text-center text-gray-800 bg-white rounded-lg font-heading w-fit text-md sm:text-2xl'>
        {t('teacher.worklog.modify.title')}
      </h2>
      <form className='w-full px-8 pt-6 pb-8 mx-auto mb-4 bg-white shadow-md md:w-2/4 xl:w-1/4 sm:w-2/3 rounded-xl'>
        <div className='mt-2 mb-4'>
          <GeneralLinkButton
            path='/teacher/worklog'
            text={t('teacher.worklog.modify.backToWorklog')}
          />
        </div>

        <WorklogDetails
          name={name}
          setName={setName}
          code={code}
          setCode={setCode}
          description={description}
          setDescription={setDescription}
          requiredHours={requiredHours}
          setRequiredHours={setRequiredHours}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          codeExists={codeExists}
          setCourseExists={setCodeExists}
          modify={true}
        />

        <Accordion className='mt-4 mb-4'>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls='panel2a-content'
            id='panel2a-header'>
            {t('teacher.worklog.modify.instructors')}
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

        <div className='flex justify-center w-full'>
          <button
            className='w-1/2 px-4 py-2 text-white transition font-heading bg-metropoliaTrendGreen hover:bg-green-600 rounded-xl focus:outline-none focus:shadow-outline'
            type='button'
            onClick={handleSubmit}>
            {t('teacher.worklog.modify.save')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TeacherWorklogCourseModify;
