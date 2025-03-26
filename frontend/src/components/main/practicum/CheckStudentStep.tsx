import React, {useState, useContext} from 'react';
import {useTranslation} from 'react-i18next';
import {toast} from 'react-toastify';
import apiHooks from '../../../api';
import {Student} from './AddStudent';
import {UserContext} from '../../../contexts/UserContext';
  import {CheckCircleOutline, Cancel} from '@mui/icons-material';

type Props = {
  student: Student | null;
  setStudent: (student: Student | null) => void;
};

/**
 * CheckStudentStep component allows checking if a student exists in the system
 * as the first step in practicum creation process.
 *
 * @param props - Component props containing student state and setter
 * @returns React component for checking student existence
 */
const CheckStudentStep: React.FC<Props> = ({setStudent}) => {
  const {t} = useTranslation(['teacher', 'common']);
  const {user} = useContext(UserContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchStatus, setSearchStatus] = useState<
    'initial' | 'found' | 'notFound'
  >('initial');
  const [matchingStudents, setMatchingStudents] = useState<Student[]>([]);

  /**
   * Check if student exists in the system based on name or email
   */
  const checkStudent = async () => {
    if (!searchTerm.trim() || !user?.userid) {
      return;
    }

    setIsSearching(true);
    setSearchStatus('initial');

    const token = localStorage.getItem('userToken');
    if (!token) {
      setIsSearching(false);
      toast.error(t('common:errors.noToken'));
      return;
    }

    try {
      const fetchedStudents = await apiHooks.getStudentsByInstructorId(
        user.userid,
        token,
      );

      const searchLower = searchTerm.toLowerCase();
      const foundStudents = fetchedStudents.filter(
        (s) =>
          (s.first_name &&
            s.last_name &&
            `${s.first_name} ${s.last_name}`
              .toLowerCase()
              .includes(searchLower)) ||
          (s.email && s.email.toLowerCase().includes(searchLower)) ||
          (s.studentnumber && String(s.studentnumber).includes(searchLower)),
      );

      setMatchingStudents(foundStudents);

      if (foundStudents.length > 0) {
        setSearchStatus('found');
        setStudent({
          userid: foundStudents[0].userid,
          email: foundStudents[0].email || '',
          first_name: foundStudents[0].first_name,
          last_name: foundStudents[0].last_name,
          studentnumber: foundStudents[0].studentnumber,
          exists: true,
        });
      } else {
        setSearchStatus('notFound');
      }
      setIsSearching(false);
    } catch (error) {
      setIsSearching(false);
      toast.error(t('common:errors.searchFailed'));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      checkStudent();
    }
  };

  return (
    <div className='space-y-6'>
      <h2 className='text-xl font-bold text-metropolia-main-grey mb-4'>
        {t('teacher:practicum.findStudent')}
      </h2>

      <div className='space-y-4'>
        <div className='space-y-2'>
          <label className='block text-sm font-medium text-metropolia-main-grey'>
            {t('teacher:practicum.searchStudentByName')}
          </label>
          <div className='flex flex-col gap-2'>
            <div className='relative flex-1'>
              <input
                type='text'
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  if (searchStatus !== 'initial') {
                    setSearchStatus('initial');
                  }
                }}
                onKeyDown={handleKeyDown}
                placeholder={t('teacher:practicum.searchPlaceholder')}
                className='w-full p-2 border rounded focus:ring-2 focus:ring-metropolia-main-orange focus:outline-none'
                disabled={isSearching}
              />
            </div>

            <button
              type='button'
              onClick={checkStudent}
              disabled={isSearching || !searchTerm.trim()}
              className='px-4 py-2 bg-metropolia-main-orange text-white rounded
                hover:bg-metropolia-main-orange-dark transition disabled:opacity-50
                disabled:cursor-not-allowed whitespace-nowrap'>
              {isSearching ? (
                <span className='flex items-center justify-center'>
                  <span className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></span>
                  {t('common:checking')}
                </span>
              ) : (
                t('common:check')
              )}
            </button>
          </div>

          {searchStatus === 'found' && matchingStudents.length > 0 && (
            <div className='mt-4'>
              <h3 className='text-lg font-medium text-metropolia-main-grey mb-2'>
                {t('teacher:practicum.matchingStudents')}
              </h3>
              <div className='space-y-2'>
                {matchingStudents.map((student) => (
                  <div
                    key={student.userid}
                    className='w-full p-3 border rounded hover:bg-gray-50 flex justify-between items-center
            text-left transition-colors duration-200'>
                    <div>
                      <div className='font-medium'>
                        {student.first_name} {student.last_name}
                      </div>
                      <div className='text-sm text-gray-600'>
                        {student.studentnumber} • {student.email}
                      </div>
                    </div>
                    <CheckCircleOutline className='text-metropolia-trend-green' />
                  </div>
                ))}
              </div>
            </div>
          )}
          {searchStatus === 'notFound' && (
            <div className='mt-4'>
              <div
                className='w-full p-3 border rounded bg-metropolia-support-red text-white flex justify-between items-center
            text-left transition-colors duration-200'>
                <div>{t('teacher:practicum.noStudentsFound')}</div>
                <Cancel />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckStudentStep;
