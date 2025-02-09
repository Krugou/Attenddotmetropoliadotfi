import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import {Container} from '@mui/material';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import React, {useContext, useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {toast} from 'react-toastify';
import {UserContext} from '../../contexts/UserContext';
import apiHooks from '../../api';
import CourseSelect from './newUser/CourseSelect';
import FormInput from './newUser/FormInput';
import StudentGroupSelect from './newUser/StudentGroupSelect';
import SubmitButton from './newUser/SubmitButton';

const NewStudentUser: React.FC = () => {
  const {t} = useTranslation(['translation']);
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [studentNumber, setStudentNumber] = useState('');
  const [studentGroupId, setStudentGroupId] = useState<number | null>(null);
  const [isStudentNumberTaken, setIsStudentNumberTaken] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [showEndedCourses, setShowEndedCourses] = useState(false);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);

  interface StudentGroup {
    studentgroupid: number;
    group_name: string;
    // include other properties if they exist
  }

  interface Course {
    courseid: number;
    name: string;
    description: string;
    start_date: string;
    end_date: string;
    code: string;
    studentgroup_name: string;
    topic_names: string;
    // Include other properties of course here
  }

  const [studentGroups, setStudentGroups] = useState<StudentGroup[]>([]);
  const {user} = useContext(UserContext);

  // Check if the student number exists when it changes
  const [timeoutIdNumber, setTimeoutIdNumber] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);
  const [timeoutIdEmail, setTimeoutIdEmail] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);
  const [isEmailTaken, setIsEmailTaken] = useState(false);

  useEffect(() => {
    const checkStudentNumber = async () => {
      const token: string | null = localStorage.getItem('userToken');
      if (!token) {
        throw new Error('No token available');
      }
      try {
        const response = await apiHooks.checkStudentNumberExists(
          studentNumber,
          token,
        );

        if (response.exists) {
          setIsStudentNumberTaken(true);
        } else {
          setIsStudentNumberTaken(false);
        }
      } catch (error) {
        console.error('Failed to check if student number exists', error);
      }
    };

    if (studentNumber) {
      if (timeoutIdNumber) {
        clearTimeout(timeoutIdNumber);
      }

      const newTimeoutIdNumber = setTimeout(() => {
        checkStudentNumber();
      }, 500);

      setTimeoutIdNumber(newTimeoutIdNumber);
    }
  }, [studentNumber]);

  useEffect(() => {
    const checkEmail = async () => {
      const token: string | null = localStorage.getItem('userToken');
      if (!token) {
        throw new Error('No token available');
      }
      if (email !== '') {
        const response = await apiHooks.checkStudentEmailExists(email, token);

        setIsEmailTaken(response.exists);
      } else {
        setIsEmailTaken(false);
      }
    };

    if (email) {
      if (timeoutIdEmail) {
        clearTimeout(timeoutIdEmail);
      }

      const newTimeoutIdEmail = setTimeout(() => {
        checkEmail();
      }, 500);

      setTimeoutIdEmail(newTimeoutIdEmail);
    }
  }, [email]);

  // Fetch all student groups when the component mounts
  useEffect(() => {
    const getStudentGroups = async () => {
      const token: string | null = localStorage.getItem('userToken');
      if (!token) {
        throw new Error('No token available');
      }
      const fetchedStudentGroups = await apiHooks.fetchStudentGroups(token);

      setStudentGroups(fetchedStudentGroups);
    };
    getStudentGroups();
  }, []);

  useEffect(() => {
    const fetchCourses = async () => {
      if (user) {
        const token: string | null = localStorage.getItem('userToken');
        if (!token) {
          toast.error('No token available');
          return;
        }
        const fetchedCourses = await apiHooks.getAllCourses(token);
        setAllCourses(fetchedCourses);
        setCourses(
          fetchedCourses.filter(
            (course) => new Date(course.end_date) > new Date(),
          ),
        );
      }
    };

    fetchCourses();
  }, [user]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // Form validation
    if (!email || !studentNumber || !firstName || !lastName) {
      toast.error('Please fill in all fields');
      return;
    }

    if (user && !isStudentNumberTaken && !isEmailTaken) {
      const token: string | null = localStorage.getItem('userToken');
      if (!token) {
        toast.error('No token available');
        return;
      }

      try {
        await apiHooks.addNewStudentUserCourse(
          token,
          email,
          studentNumber,
          firstName,
          lastName,
          studentGroupId,
          selectedCourseId,
        );
        toast.success(t('newStudent.success.userAdded'));
      } catch (error) {
        console.error('Failed to add new student user', error);
        toast.error(t('newStudent.errors.addFailed', {error}));
      }
    } else if (isStudentNumberTaken) {
      toast.error(t('newStudent.errors.studentNumberTaken'));
    }
  };

  return (
    <>
      <h1 className='p-3 mb-5 ml-auto mr-auto text-2xl text-center bg-white rounded-lg font-heading w-fit'>
        {t('translation:newStudent.title')}
      </h1>
      <div className='relative w-11/12 m-auto bg-white rounded-lg sm:w-3/4'>
        <Container>
          <form onSubmit={handleSubmit} className='mt-4 mb-4 '>
            <div className='flex flex-col'>
              <h2 className='m-2 text-xl text-center font-heading'>
                {t('translation:newStudent.studentDetails')}
              </h2>
              <FormInput
                label={t('translation:common.email')}
                placeholder='Matti.Meikäläinen@metropolia.fi'
                value={email}
                onChange={setEmail}
              />
              {isEmailTaken && (
                <h2 className='text-red-500'>
                  {t('translation:common.errors.emailTaken')}
                </h2>
              )}
              <FormInput
                label={t('translation:common.firstName')}
                placeholder='Matti'
                value={firstName}
                onChange={setFirstName}
              />
              <FormInput
                label={t('translation:common.lastName')}
                placeholder='Meikäläinen'
                value={lastName}
                onChange={setLastName}
              />
              <FormInput
                label={t('translation:common.studentNumber')}
                placeholder='123456'
                value={studentNumber}
                onChange={setStudentNumber}
              />
              {isStudentNumberTaken && (
                <h2 className='text-red-500'>
                  {t('translation:common.errors.studentNumberTaken')}
                </h2>
              )}
              <StudentGroupSelect
                studentGroups={studentGroups}
                selectedGroup={studentGroupId}
                onChange={setStudentGroupId}
              />
              <div className='flex justify-center'>
                <div className='w-full'>
                  <CourseSelect
                    courses={showEndedCourses ? allCourses : courses}
                    selectedCourse={selectedCourseId}
                    onChange={setSelectedCourseId}
                  />
                </div>
                <div className='flex items-end mb-3 ml-2'>
                  <Tooltip
                    title={t(
                      showEndedCourses
                        ? 'common.hideEndedCourses'
                        : 'common.showEndedCourses',
                    )}
                    placement='top'>
                    <IconButton
                      className='h-fit'
                      onClick={() => setShowEndedCourses(!showEndedCourses)}>
                      {showEndedCourses ? (
                        <VisibilityOffIcon />
                      ) : (
                        <VisibilityIcon />
                      )}
                    </IconButton>
                  </Tooltip>
                </div>
              </div>
            </div>
            <div className='mt-4 w-fit'>
              <h2 className='text-lg font-heading'>
                {t('translation:newStudent.note.title')}
              </h2>
              <p className='mt-2'>
                {t('translation:newStudent.note.checkDetails')}
              </p>
              <p className='mt-4'>
                {t('translation:newStudent.note.contactAdmin')}
              </p>
            </div>
            <div className='flex justify-center pb-3'>
              <SubmitButton disabled={isEmailTaken || isStudentNumberTaken} />
            </div>
          </form>
        </Container>
      </div>
    </>
  );
};

export default NewStudentUser;
