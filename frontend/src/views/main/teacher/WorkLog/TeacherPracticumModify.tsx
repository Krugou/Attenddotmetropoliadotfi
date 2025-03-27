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
import PracticumData from '../../../../components/main/practicum/PracticumDetailsStep';

interface Instructor {
  email: string;
}

interface PracticumDetail {
  work_log_practicum_id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  required_hours: number;
  instructor_name: string;
  instructors?: Instructor[];
}

interface PracticumUpdateData {
  name: string;
  code: string;
  description: string;
  required_hours: number;
  start_date: string;
  end_date: string;
  instructors: string[];
}

const TeacherPracticumModify: React.FC = () => {
  const {t} = useTranslation(['translation']);
  const [practicumData, setPracticumData] = useState<PracticumDetail | null>(null);
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [requiredHours, setRequiredHours] = useState<number>(0);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [instructorEmail, setInstructorEmail] = useState<string>('');

  const navigate = useNavigate();
  const {practicumid} = useParams<{practicumid: string}>();
  useEffect(() => {
    const fetchPracticum = async () => {
      if (practicumid) {
        setIsLoading(true);
        const token = localStorage.getItem('userToken');
        if (!token) throw new Error('No token available');

        try {
          const practicumData = await apiHooks.getPracticumDetails(
            Number(practicumid),
            token,
          );

          setPracticumData(practicumData.practicum);

          // Set instructor data from the response
          if (practicumData.practicum.instructor_name) {
            const instructorEmails = practicumData.practicum.instructor_name
              .split(',')
              .map((email) => ({email: email.trim()}));
            setInstructors(instructorEmails);
            setInstructorEmail(instructorEmails[0]?.email || '');
          }

          setIsLoading(false);
        } catch (error) {
          toast.error(t('common:worklog.error.fetchFailed'));
          setIsLoading(false);
        }
      }
    };

    fetchPracticum();
  }, [practicumid]);

  useEffect(() => {
    if (practicumData) {
      setName(practicumData.name || '');
      setDescription(practicumData.description || '');
      setRequiredHours(practicumData.required_hours || 0);
      if (practicumData.start_date) {
        setStartDate(formatDate(practicumData.start_date));
      }
      if (practicumData.end_date) {
        setEndDate(formatDate(practicumData.end_date));
      }
    }
  }, [practicumData]);

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    // Validate the date is valid before formatting
    if (isNaN(date.getTime())) {
      return '';
    }
    return date.toISOString().split('T')[0];
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const token = localStorage.getItem('userToken');
    if (!token) throw new Error('No token available');

    if (!name || !startDate || !endDate || requiredHours <= 0) {
      toast.error(t('common:worklog.error.requiredFields'));
      return;
    }

    try {
      const modifiedData: PracticumUpdateData = {
        name,
        code: practicumData?.name || name,
        description,
        required_hours: requiredHours,
        start_date: startDate,
        end_date: endDate,
        instructors: instructors.map((i) => i.email),
      };
      await apiHooks.updatePracticum(Number(practicumid), modifiedData, token);
      toast.success(t('teacher:worklog.modifySuccess'));
      navigate(`/teacher/practicum/${practicumid}`);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };

  if (isLoading) {
    return <div>{t('teacher:worklog.modify.loading')}</div>;
  }

  return (
    <div className='w-full'>
      <h2 className='p-3 m-auto mb-6 text-center text-gray-800 bg-white rounded-lg font-heading w-fit text-md sm:text-2xl'>
        {t('teacher:worklog.modify.title')}
      </h2>
      <form className='w-full px-8 pt-6 pb-8 mx-auto mb-4 bg-white shadow-md md:w-2/4 xl:w-1/4 sm:w-2/3 rounded-xl'>
        <div className='mt-2 mb-4'>
          <GeneralLinkButton
            path='/teacher/worklog'
            text={t('teacher:worklog.modify.backToWorklog')}
          />
        </div>

        <PracticumData
          name={name}
          setName={setName}
          description={description}
          setDescription={setDescription}
          requiredHours={requiredHours}
          setRequiredHours={setRequiredHours}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
        />

        <Accordion className='mt-4 mb-4'>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls='panel2a-content'
            id='panel2a-header'>
            {t('teacher:worklog.modify.instructors')}
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
            className='w-1/2 px-4 py-2 text-white transition font-heading bg-metropolia-trend-green hover:bg-green-600 rounded-xl focus:outline-hidden focus:shadow-outline'
            type='button'
            onClick={handleSubmit}>
            {t('teacher:worklog.modify.save')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TeacherPracticumModify;
