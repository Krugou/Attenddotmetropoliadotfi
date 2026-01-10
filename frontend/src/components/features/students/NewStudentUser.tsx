import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import {Container} from '@mui/material';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import React, {useContext, useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {toast} from 'react-toastify';
import {UserContext} from '../../../contexts/UserContext.tsx';
import apiHooks from '../../../api';
import CourseSelect from '../../ui/inputs/CourseSelect.tsx';
import FormInput from '../../ui/inputs/FormInput.tsx';
import StudentGroupSelect from '../../ui/inputs/StudentGroupSelect.tsx';
import SubmitButton from '../../ui/buttons/SubmitButton.tsx';

const NewStudentUser: React.FC = () => {
  const {t} = useTranslation(['common']);
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
  const [showWorklogSelect, setShowWorklogSelect] = useState(false);
  const [worklogCourses, setWorklogCourses] = useState<WorklogCourse[]>([]);
  const [selectedWorklogId, setSelectedWorklogId] = useState<number | null>(
    null,
  );

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

  interface WorklogCourse {
    work_log_course_id: number;
    name: string;
    code: string;
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

  useEffect(() => {
    const fetchWorklogCourses = async () => {
      if (user) {
        const token = localStorage.getItem('userToken');
        if (!token) return;

        try {
          const courses = await apiHooks.getWorkLogCoursesByInstructor(
            user.email,
            token,
          );
          setWorklogCourses(courses);
        } catch (error) {
          console.error('Failed to fetch worklog courses:', error);
          toast.error(t('errors.fetchWorklogCoursesFailed'));
        }
      }
    };

    if (showWorklogSelect) {
      fetchWorklogCourses();
    }
  }, [user, showWorklogSelect]);

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
        // Add to regular course if selected
        if (selectedCourseId) {
          await apiHooks.addNewStudentUserCourse(
            token,
            email,
            studentNumber,
            firstName,
            lastName,
            studentGroupId,
            selectedCourseId,
          );
        }

        // Add to worklog course if selected
        if (selectedWorklogId) {
          await apiHooks.addNewStudentToWorklog(
            token,
            String(selectedWorklogId),
            {
              email,
              first_name: firstName,
              last_name: lastName,
              studentnumber: studentNumber,
              studentGroupId,
            },
          );
        }

        toast.success(t('newStudent.success.userAdded'));
      } catch (error) {
        console.error('Failed to add student:', error);
        toast.error(t('newStudent.errors.addFailed'));
      }
    } else if (isStudentNumberTaken) {
      toast.error(t('newStudent.errors.studentNumberTaken'));
    }
  };

  return (
    <>
      <h1 className="p-3 mb-1 ml-auto mr-auto text-2xl text-center bg-white rounded-lg font-heading w-fit">
        {t('newStudent.title')}
      </h1>

      <div className="relative w-11/12 m-auto bg-white rounded-lg sm:w-3/4">
        <Container>
          <form onSubmit={handleSubmit} className="mb-1">
            <div className="flex flex-col">
              <h2 className="mb-1 text-xl text-center font-heading">
                {t('newStudent.studentDetails')}
              </h2>

              <FormInput
                label={t('email')}
                placeholder="Etunimi.Sukunimi@metropolia.fi"
                value={email}
                onChange={setEmail}
              />
              {isEmailTaken && (
                <h2 className="text-red-500">{t('errors.emailTaken')}</h2>
              )}

              <FormInput
                label={t('firstName')}
                placeholder="Etunimi"
                value={firstName}
                onChange={setFirstName}
              />

              <FormInput
                label={t('lastName')}
                placeholder="Sukunimi"
                value={lastName}
                onChange={setLastName}
              />

              <FormInput
                label={t('studentNumber')}
                placeholder="123456"
                value={studentNumber}
                onChange={setStudentNumber}
              />
              {isStudentNumberTaken && (
                <h2 className="text-red-500">{t('errors.studentNumberTaken')}</h2>
              )}

              <StudentGroupSelect
                studentGroups={studentGroups}
                selectedGroup={studentGroupId}
                onChange={setStudentGroupId}
              />

              {/* Kurssimuoto (label-tyylinen, sama hierarkia kuin muut kenttäotsikot) */}
              <div className="mt-1">
              <span className="block mb-2 text-base font-heading font-semibold text-gray-700">
                {t('newStudent.selection.title')}
              </span>

                <span className="block mb-1 text-sm text-metropolia-main-grey/70 font-body">
                {t('newStudent.selection.modeHelp')}
              </span>

                <div className="flex flex-col gap-3">
                  <div className="flex flex-col items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowWorklogSelect(!showWorklogSelect)}
                      className="w-full p-1 transition-colors duration-200 rounded-xl bg-gray-100 hover:bg-gray-200"
                      aria-pressed={showWorklogSelect}
                    >
                    <span className="relative grid grid-cols-2 items-center">
                      {/* pill indicator */}
                      <span
                        className={[
                          'absolute top-0 bottom-0 m-1 rounded-lg bg-white shadow-sm transition-transform duration-200',
                          'w-[calc(50%-0.5rem)]',
                          showWorklogSelect ? 'translate-x-full' : 'translate-x-0',
                        ].join(' ')}
                      />
                      <span
                        className={[
                          'relative z-10 py-2 text-sm font-semibold font-body rounded-lg',
                          !showWorklogSelect
                            ? 'text-metropolia-main-orange'
                            : 'text-metropolia-main-grey',
                        ].join(' ')}
                      >
                        {t('worklog.enrollment.switchToRegular')}
                      </span>
                      <span
                        className={[
                          'relative z-10 py-2 text-sm font-semibold font-body rounded-lg',
                          showWorklogSelect
                            ? 'text-metropolia-main-orange'
                            : 'text-metropolia-main-grey',
                        ].join(' ')}
                      >
                        {t('worklog.enrollment.switchToWorklog')}
                      </span>
                    </span>
                    </button>

                    <div className=" w-full">
                      {showWorklogSelect ? (
                        <div className="w-full">
                          <label className="mt-2 block">
                          <span className='font-heading text-gray-700'>
                            {t('worklog.selectCourseLabel')}
                          </span>
                            <select
                              value={selectedWorklogId || ''}
                              onChange={(e) =>
                                setSelectedWorklogId(Number(e.target.value) || null)
                              }
                              className="w-full px-3 py-2 mt-1 mb-3 leading-tight text-gray-700 border shadow-sm appearance-none cursor-pointer rounded-3xl"
                            >
                              <option value="">{t('worklog.selectCourse')}</option>
                              {worklogCourses.map((course) => (
                                <option
                                  key={course.work_log_course_id}
                                  value={course.work_log_course_id}
                                >
                                  {course.name} ({course.code})
                                </option>
                              ))}
                            </select>
                          </label>
                        </div>
                      ) : (
                        <div className="flex justify-center w-full">
                          <div className="w-full mt-2">
                            <CourseSelect
                              courses={showEndedCourses ? allCourses : courses}
                              selectedCourse={selectedCourseId}
                              onChange={setSelectedCourseId}
                            />
                          </div>

                          <div className="flex items-end mb-3 ml-2">
                            <Tooltip
                              title={t(
                                showEndedCourses
                                  ? 'hideEndedCourses'
                                  : 'showEndedCourses',
                              )}
                              placement="top"
                            >
                              <IconButton
                                className="h-fit"
                                onClick={() => setShowEndedCourses(!showEndedCourses)}
                              >
                                {showEndedCourses ? (
                                  <VisibilityOffIcon />
                                ) : (
                                  <VisibilityIcon />
                                )}
                              </IconButton>
                            </Tooltip>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 w-fit">
              <h2 className="text-lg font-heading">{t('newStudent.note.title')}</h2>
              <p className="mt-2">{t('newStudent.note.checkDetails')}</p>
              <p className="mt-4">{t('newStudent.note.contactAdmin')}</p>
            </div>

            <div className="flex justify-center pb-3">
              <SubmitButton disabled={isEmailTaken || isStudentNumberTaken} />
            </div>
          </form>
        </Container>
      </div>
    </>
  );
};

export default NewStudentUser;
