import React, {useCallback, useContext, useEffect, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {toast} from 'react-toastify';
import {Link} from 'react-router-dom';
import {CheckCircleOutline, Cancel} from '@mui/icons-material';

import apiHooks from '../../../api';
import {UserContext} from '../../../contexts/UserContext.tsx';
import type {Student} from './AddStudent.tsx';

type Props = {
  students: Student[];
  setStudents: (students: Student[]) => void;
};

const PracticumStudentPicker: React.FC<Props> = ({students, setStudents}) => {
  const {t} = useTranslation(['teacher', 'common']);
  const {user} = useContext(UserContext);

  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [matchingStudents, setMatchingStudents] = useState<Student[]>([]);
  const [searchStatus, setSearchStatus] = useState<'initial' | 'found' | 'notFound'>('initial');

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runSearch = useCallback(
    async (term: string) => {
      if (!term.trim() || !user?.userid) {
        setMatchingStudents([]);
        setSearchStatus('initial');
        return;
      }

      const token = localStorage.getItem('userToken');
      if (!token) {
        toast.error(t('ui:errors.noToken'));
        return;
      }

      setIsSearching(true);

      try {
        const fetchedStudents = await apiHooks.getStudentsByInstructorId(user.userid, token);

        const lower = term.toLowerCase();
        const found = fetchedStudents.filter(
          (s) =>
            (s.first_name &&
              s.last_name &&
              `${s.first_name} ${s.last_name}`.toLowerCase().includes(lower)) ||
            (s.email && s.email.toLowerCase().includes(lower)) ||
            (s.studentnumber && String(s.studentnumber).includes(lower)),
        );

        setMatchingStudents(found);
        setSearchStatus(found.length > 0 ? 'found' : 'notFound');
      } catch {
        toast.error(t('ui:errors.searchFailed'));
      } finally {
        setIsSearching(false);
      }
    },
    [t, user?.userid],
  );

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      runSearch(value);
    }, 300);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const selectStudent = (student: Student) => {
    setStudents([student]);
    toast.success(t('teacher:practicum.studentSelected'));
  };

  const removeSelected = () => setStudents([]);

  return (
    <div className="space-y-6">
      {/* Otsikko + ohje */}
      <div>
        <h2 className="text-xl font-heading text-gray-800">
          {t('teacher:practicum.findStudent')}
        </h2>

        <p className="text-sm text-gray-500 mt-2 leading-relaxed">
          {t('teacher:practicum.checkStudentGuide')}{' '}
          <Link
            to="/teacher/lateenrollment"
            className="text-metropolia-support-blue hover:text-metropolia-support-blue-dark underline"
          >
            {t('teacher:practicum.lateEnrollmentLink')}
          </Link>
        </p>
      </div>

      {/* Jos opiskelija on valittu -> näytä valittu kortti */}
      {students.length > 0 ? (
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700">
            {t('teacher:practicum.selectedStudent')}
          </div>

          <div className="border rounded-xl bg-white p-4 flex justify-between items-center">
            <div>
              <div className="font-medium text-gray-800">
                {students[0].first_name} {students[0].last_name}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                {students[0].studentnumber} • {students[0].email}
              </div>
            </div>

            <button
              type="button"
              onClick={removeSelected}
              className="text-metropolia-support-red p-2 hover:bg-gray-100 rounded-full"
              aria-label={t('ui:remove')}
            >
              ✕
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Haku */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              {t('teacher:practicum.searchStudentByName')}
            </label>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder={t('teacher:practicum.searchPlaceholder')}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-metropolia-main-orange focus:outline-none"
                disabled={isSearching}
              />

              <button
                type="button"
                onClick={() => runSearch(searchTerm)}
                disabled={isSearching || !searchTerm.trim()}
                className="w-full sm:w-32 p-2 text-white rounded-sm font-heading
                           bg-metropolia-main-orange hover:bg-metropolia-secondary-orange
                           focus:outline-none focus:ring-2 focus:ring-metropolia-main-orange
                           disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSearching ? (
                  <span className="inline-flex items-center justify-center">
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    {t('ui:checking')}
                  </span>
                ) : (
                  t('ui:check')
                )}
              </button>
            </div>
          </div>

          {/* Tulokset */}
          {searchStatus === 'found' && matchingStudents.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700">
                {t('teacher:practicum.matchingStudents')}
              </h3>

              <div className="space-y-3">
                {matchingStudents.map((student) => (
                  <button
                    key={student.userid ?? student.email}
                    type="button"
                    onClick={() => selectStudent(student)}
                    className="w-full p-4 border rounded-xl bg-white hover:bg-gray-50
                               flex justify-between items-center transition-colors text-left"
                  >
                    <div>
                      <div className="font-medium text-gray-800">
                        {student.first_name} {student.last_name}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {student.studentnumber} • {student.email}
                      </div>
                    </div>

                    <CheckCircleOutline className="text-metropolia-trend-green" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {searchStatus === 'notFound' && (
            <div className="mt-2">
              <div className="w-full p-4 border rounded-xl bg-metropolia-support-red text-white
                              flex justify-between items-center">
                <div className="text-sm font-medium">
                  {t('teacher:practicum.noStudentsFound')}
                </div>
                <Cancel />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PracticumStudentPicker;
