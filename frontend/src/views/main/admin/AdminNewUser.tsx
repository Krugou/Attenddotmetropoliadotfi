import {Container} from '@mui/material';
import React, {useContext, useEffect, useState} from 'react';
import {toast} from 'react-toastify';
import FormInput from '../../../components/main/newUser/FormInput';
import StudentGroupSelect from '../../../components/main/newUser/StudentGroupSelect';
import SubmitButton from '../../../components/main/newUser/SubmitButton';
import {UserContext} from '../../../contexts/UserContext';
import apiHooks from '../../../api';
import {useTranslation} from 'react-i18next';
/**
 * AdminNewUser component.
 * This component is used to create a new user in the system.
 * It provides fields to input user details and submit the form.
 * It also checks if the entered student number and email already exist in the system.
 *
 * @component
 */
const AdminNewUser: React.FC = () => {
  const {t} = useTranslation();
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [roleid, setRoleId] = useState<number>(3);
  const [staff, setStaff] = useState<number>(1);
  const [studentNumber, setStudentNumber] = useState('');
  const [studentGroupId, setStudentGroupId] = useState<number | null>(null);
  const [isStudentNumberTaken, setIsStudentNumberTaken] = useState(false);
  const [timeoutIdNumber, setTimeoutIdNumber] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);
  const [timeoutIdEmail, setTimeoutIdEmail] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);
  const [isEmailTaken, setIsEmailTaken] = useState(false);
  const [userType, setUserType] = useState<'staff' | 'student'>('student');
  const [roles, setRoles] = useState<
    {
      name: string;
      roleid: number;
      role: string;
    }[]
  >([]);

  interface StudentGroup {
    studentgroupid: number;
    group_name: string;
  }

  const [studentGroups, setStudentGroups] = useState<StudentGroup[]>([]);
  const {user} = useContext(UserContext);

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
    const getRoles = async () => {
      // Get token from local storage
      const token: string | null = localStorage.getItem('userToken');
      if (!token) {
        throw new Error('No token available');
      }
      const fetchedRoles = await apiHooks.fetchAllRoles(token);
      console.log('🚀 ~ getRoles ~ fetchedRoles:', fetchedRoles);

      setRoles(fetchedRoles);
    };

    getRoles();
  }, []);
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!email || !firstName || !lastName) {
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
        if (userType === 'staff') {
          await apiHooks.addNewStaffUser(
            token,
            email,
            firstName,
            lastName,
            roleid,
            staff,
          );
          toast.success('New staff user added successfully');
        } else {
          await apiHooks.addNewStudentUser(
            token,
            email,
            studentNumber,
            firstName,
            lastName,
            studentGroupId,
          );
          toast.success('New student user added successfully');
        }
      } catch (error) {
        const userTypeText = userType === 'staff' ? 'staff' : 'student';
        console.error(`Failed to add new ${userTypeText} user`, error);
        toast.error(`Failed to add new ${userTypeText} user ${error}`);
      }
    } else if (isStudentNumberTaken) {
      toast.error('The student number is already taken');
    }
  };

  return (
    <>
      <h1 className='p-3 mb-5 ml-auto mr-auto text-2xl text-center bg-white rounded-lg font-heading w-fit'>
        {t('admin.newUser.addNew')}
        {userType === 'student' ? 'Student' : 'Staff'} {t('admin.common.user')}
      </h1>
      <div className='relative bg-white rounded-lg w-fit'>
        <Container>
          <form onSubmit={handleSubmit} className='mt-4 mb-4'>
            <div className='flex flex-col'>
              <h2 className='mb-5 text-xl text-center font-heading'>
                {t('admin.newUser.userDetails')}
              </h2>

              <div className='flex flex-col items-start justify-center mt-4'>
                <label
                  htmlFor='userType'
                  className='mb-1 mr-2 text-gray-700 font-heading'>
                  {t('admin.newUser.userType')}
                </label>
                <select
                  id='userType'
                  value={userType}
                  onChange={(e) =>
                    setUserType(e.target.value as 'staff' | 'student')
                  }
                  className='w-full px-3 py-2 mb-3 leading-tight text-gray-700 border shadow-sm appearance-none cursor-pointer rounded-3xl focus:outline-hidden focus:shadow-outline'>
                  <option value='student'>
                    {t('admin.newUser.optionStudent')}
                  </option>
                  <option value='staff'>
                    {t('admin.newUser.optionTeacher')}
                  </option>
                </select>
              </div>
              {userType === 'staff' && (
                <div className='flex flex-col items-start justify-center mt-4'>
                  <label
                    htmlFor='staffRole'
                    className='mb-1 mr-2 text-gray-700 font-heading'>
                    {t('admin.newUser.staffRole')}
                  </label>
                  <select
                    title={t('admin.newUser.staffRolTitle')}
                    className='w-full px-3 py-2 mb-3 leading-tight text-gray-700 border shadow-sm appearance-none cursor-pointer rounded-3xl focus:outline-hidden focus:shadow-outline'
                    id='role'
                    value={roleid}
                    onChange={(e) => {
                      setRoleId(parseInt(e.target.value));

                      setStaff(1);
                    }}>
                    <option value='' disabled>
                      {t('admin.newUser.staffRolTitle')}
                    </option>
                    {roles.map((role) => (
                      <option key={role.roleid} value={role.roleid}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <FormInput
                label={t('admin.common.email')}
                placeholder='Matti.Meikäläinen@metropolia.fi'
                value={email}
                onChange={setEmail}
              />
              {isEmailTaken && (
                <h2 className='text-red-500'>
                  {' '}
                  {t('admin.newUser.emailTaken')}
                </h2>
              )}
              <FormInput
                label={t('admin.common.firstName')}
                placeholder='Matti'
                value={firstName}
                onChange={setFirstName}
              />
              <FormInput
                label={t('admin.common.lastName')}
                placeholder='Meikäläinen'
                value={lastName}
                onChange={setLastName}
              />
              {userType === 'student' && (
                <>
                  <FormInput
                    label={t('admin.common.studentNumber')}
                    placeholder='123456'
                    value={studentNumber}
                    onChange={setStudentNumber}
                  />
                  {isStudentNumberTaken && (
                    <h2 className='text-red-500'>
                      {t('admin.newUser.studentNumberTaken')}
                    </h2>
                  )}
                  <StudentGroupSelect
                    studentGroups={studentGroups}
                    selectedGroup={studentGroupId}
                    onChange={setStudentGroupId}
                  />
                </>
              )}
              <SubmitButton disabled={isEmailTaken || isStudentNumberTaken} />
            </div>
          </form>
        </Container>
      </div>
    </>
  );
};

export default AdminNewUser;
