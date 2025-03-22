import React, {useContext, useState, useCallback, useRef, useEffect} from 'react';
import {UserContext} from '../../../contexts/UserContext';
import {useTranslation} from 'react-i18next';
import {toast} from 'react-toastify';
import apiHooks from '../../../api';

export type Student = {
  userid?: number;
  email: string;
  exists?: boolean;
  first_name?: string;
  last_name?: string;
  studentnumber?: string | number;
};

type Props = {
  students: Student[];
  setStudents: (students: Student[]) => void;
};

function AddStudent({students, setStudents}: Props) {
  const {t} = useTranslation(['teacher', 'common']);
  const {user} = useContext(UserContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Student[]>([]);
  // @ts-expect-error resetTimer is not initialized
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);


  const debouncedSearch = useCallback(
    async (term: string) => {
      if (!term.trim() || !user?.userid) {
        setSearchResults([]);
        return;
      }

      try {
        const token = localStorage.getItem('userToken');
        if (!token) {
          toast.error(t('common:errors.noToken'));
          return;
        }

        const fetchedStudents = await apiHooks.getStudentsByInstructorId(user.userid, token);
        const filtered = fetchedStudents.filter(student =>
          (student.first_name?.toLowerCase().includes(term.toLowerCase()) ||
           student.last_name?.toLowerCase().includes(term.toLowerCase()) ||
           student.email?.toLowerCase().includes(term.toLowerCase()))
        );

        setSearchResults(filtered.map(student => ({
          ...student,
          userid: student.userid || undefined
        })));
      } catch (error) {
        console.error('Error searching for students:', error);
        toast.error(t('common:errors.searchFailed'));
      }
    },
    [user?.userid, t]
  );

  const handleSearch = (value: string) => {
    setSearchTerm(value);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      debouncedSearch(value);
    }, 300);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const selectStudent = (student: Student) => {
    setStudents([student]);
    setSearchTerm('');
    setSearchResults([]);
    toast.success(t('teacher:practicum.studentSelected'));
  };

  const removeStudent = () => {
    setStudents([]);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-metropolia-main-grey mb-4">
        {t('teacher:practicum.addStudent')}
      </h2>


      {students.length === 0 ? (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-metropolia-main-grey">
            {t('teacher:practicum.searchExistingStudents')}
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={e => handleSearch(e.target.value)}
            placeholder={t('common:searchByName')}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-metropolia-main-orange focus:outline-none"
            aria-required="true"
          />
          {searchTerm && searchResults.length > 0 && (
            <ul className="mt-2 border rounded max-h-60 overflow-auto bg-white shadow-md">
              {searchResults.map(student => (
                <li key={student.email} className="border-b last:border-b-0">
                  <button
                    type="button"
                    onClick={() => selectStudent(student)}
                    className="w-full p-3 text-left hover:bg-gray-50 transition duration-150"
                  >
                    {student.first_name} {student.last_name} <span className="text-sm text-gray-500">({student.email})</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {searchTerm && searchResults.length === 0 && searchTerm.trim() !== '' && (
            <p className="text-sm text-metropolia-support-red mt-1">
              {t('teacher:practicum.noStudentsFound')}
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <h3 className="font-medium text-metropolia-main-grey">
            {t('teacher:practicum.selectedStudent')}
          </h3>
          <div className="border rounded overflow-hidden bg-white p-4">
            <div className="flex justify-between items-center">
              <div>
                {students[0].first_name && students[0].last_name ? (
                  <>
                    <span className="font-medium">{students[0].first_name} {students[0].last_name}</span>
                    <span className="ml-2 text-sm text-gray-500">({students[0].email})</span>
                  </>
                ) : (
                  <span>{students[0].email}</span>
                )}
              </div>
              <button
                type="button"
                onClick={removeStudent}
                className="text-metropolia-support-red p-2 hover:bg-gray-100 rounded-full"
                aria-label={t('common:remove')}
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AddStudent;
