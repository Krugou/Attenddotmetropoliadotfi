import { Container } from '@mui/material';
import React, { useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import FormInput from '../../../../components/ui/inputs/FormInput.tsx';
import SubmitButton from '../../../../components/ui/buttons/SubmitButton.tsx';
import { UserContext } from '../../../../contexts/UserContext.tsx';
import apiHooks from '../../../../api';
import { useTranslation } from 'react-i18next';

import UserTypeSelector from '../../../../components/internal/admin/AdminNewUser/UserTypeSelector.tsx';
import StaffRoleSelect from '../../../../components/internal/admin/AdminNewUser/StaffRoleSelect.tsx';
import StudentDetails from '../../../../components/internal/admin/AdminNewUser/StudentDetails.tsx';
import { useResetUserForm } from '../../../../hooks/useResetUserForm.ts'

/**
 * AdminNewUser View
 *
 * Renders a form for creating new student or staff users.
 * Handles input validation, dynamic form sections, and API calls.
 *
 * Uses: UserTypeSelector, StaffRoleSelect, StudentDetails.
 */

const AdminNewUser: React.FC = () => {
  const { t } = useTranslation(['admin']);
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [roleid, setRoleId] = useState<number>(3);
  const [staff] = useState<number>(1);
  const [studentNumber, setStudentNumber] = useState('');
  const [studentGroupId, setStudentGroupId] = useState<number | null>(null);
  const [isStudentNumberTaken, setIsStudentNumberTaken] = useState(false);
  const [timeoutIdNumber, setTimeoutIdNumber] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [timeoutIdEmail, setTimeoutIdEmail] = useState<ReturnType<typeof setTimeout> | null>(null);
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
  const { user } = useContext(UserContext);

  const { reset } = useResetUserForm({
    setEmail,
    setFirstName,
    setLastName,
    setStudentNumber,
    setStudentGroupId,
  });

  useEffect(() => {
    const checkStudentNumber = async () => {
      const token = localStorage.getItem('userToken');
      if (!token) throw new Error('No token available');
      try {
        const response = await apiHooks.checkStudentNumberExists(studentNumber, token);
        setIsStudentNumberTaken(response.exists);
      } catch (error) {
        console.error('Failed to check if student number exists', error);
      }
    };

    if (studentNumber) {
      if (timeoutIdNumber) clearTimeout(timeoutIdNumber);
      const newTimeoutIdNumber = setTimeout(checkStudentNumber, 500);
      setTimeoutIdNumber(newTimeoutIdNumber);
    }
  }, [studentNumber]);

  useEffect(() => {
    const checkEmail = async () => {
      const token = localStorage.getItem('userToken');
      if (!token) throw new Error('No token available');
      if (email !== '') {
        const response = await apiHooks.checkStudentEmailExists(email, token);
        setIsEmailTaken(response.exists);
      } else {
        setIsEmailTaken(false);
      }
    };

    if (email) {
      if (timeoutIdEmail) clearTimeout(timeoutIdEmail);
      const newTimeoutIdEmail = setTimeout(checkEmail, 500);
      setTimeoutIdEmail(newTimeoutIdEmail);
    }
  }, [email]);

  useEffect(() => {
    const getStudentGroups = async () => {
      const token = localStorage.getItem('userToken');
      if (!token) throw new Error('No token available');
      const fetchedStudentGroups = await apiHooks.fetchStudentGroups(token);
      setStudentGroups(fetchedStudentGroups);
    };
    getStudentGroups();
  }, []);

  useEffect(() => {
    const getRoles = async () => {
      const token = localStorage.getItem('userToken');
      if (!token) throw new Error('No token available');
      const fetchedRoles = await apiHooks.fetchAllRoles(token);
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
      const token = localStorage.getItem('userToken');
      if (!token) {
        toast.error('No token available');
        return;
      }

      try {
        if (userType === 'staff') {
          await apiHooks.addNewStaffUser(token, email, firstName, lastName, roleid, staff);
          toast.success('New staff user added successfully');
        } else {
          await apiHooks.addNewStudentUser(token, email, studentNumber, firstName, lastName, studentGroupId);
          toast.success('New student user added successfully');
        }
      } catch (error) {
        const userTypeText = userType === 'staff' ? 'staff' : 'student';
        console.error(`Failed to add new ${userTypeText} user`, error);
        toast.error(`Failed to add new ${userTypeText} user ${error}`);
      }
      reset();
    } else if (isStudentNumberTaken) {
      toast.error('The student number is already taken');
    }
  };

  return (
    <>
      <h1 className='p-3 mb-5 ml-auto mr-auto text-2xl text-center bg-white rounded-lg font-heading w-fit shadow-md'>
        {t('admin:newUser.addNew')}
        {userType === 'student' ? 'Student' : 'Staff'} {t('admin:ui.user')}
      </h1>
      <div className='relative bg-white rounded-lg w-fit shadow-lg'>
        <Container>
          <form onSubmit={handleSubmit} className='mt-4 mb-4'>
            <div className='flex flex-col'>
              <h2 className='mb-5 text-xl text-center font-heading text-metropolia-main-grey'>
                {t('admin:newUser.userDetails')}
              </h2>

              <UserTypeSelector userType={userType} setUserType={setUserType} t={t} />

              {userType === 'staff' && (
                <StaffRoleSelect roles={roles} roleid={roleid} setRoleId={setRoleId} t={t} />
              )}

              <FormInput
                label={t('admin:ui.email')}
                placeholder='Matti.Meikäläinen@metropolia.fi'
                value={email}
                onChange={setEmail}
              />
              {isEmailTaken && (
                <h2 className='text-metropolia-support-red mb-2'>
                  {t('admin:newUser.emailTaken')}
                </h2>
              )}
              <FormInput
                label={t('admin:ui.firstName')}
                placeholder='Matti'
                value={firstName}
                onChange={setFirstName}
              />
              <FormInput
                label={t('admin:ui.lastName')}
                placeholder='Meikäläinen'
                value={lastName}
                onChange={setLastName}
              />
              {userType === 'student' && (
                <StudentDetails
                  studentNumber={studentNumber}
                  setStudentNumber={setStudentNumber}
                  isStudentNumberTaken={isStudentNumberTaken}
                  studentGroups={studentGroups}
                  studentGroupId={studentGroupId}
                  setStudentGroupId={setStudentGroupId}
                  t={t}
                />
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
