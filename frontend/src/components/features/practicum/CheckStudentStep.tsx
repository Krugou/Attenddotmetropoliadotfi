import React, {useState, useContext} from 'react';
import {useTranslation} from 'react-i18next';
import {toast} from 'react-toastify';
import apiHooks from '../../../api';
import {Student} from './AddStudent.tsx';
import {UserContext} from '../../../contexts/UserContext.tsx';
import {CheckCircleOutline, Cancel} from '@mui/icons-material';
import {Link} from 'react-router-dom';

type Props = {
  student: Student | null;
  setStudent: (student: Student | null) => void;
};

const CheckStudentStep: React.FC<Props> = ({setStudent}) => {
  const {t} = useTranslation(['teacher', 'common']);
  const {user} = useContext(UserContext);

  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchStatus, setSearchStatus] = useState<
    'initial' | 'found' | 'notFound'
  >('initial');
  const [matchingStudents, setMatchingStudents] = useState<Student[]>([]);

  const checkStudent = async () => {
    if (!searchTerm.trim() || !user?.userid) return;

    setIsSearching(true);
    setSearchStatus('initial');

    const token = localStorage.getItem('userToken');
    if (!token) {
      setIsSearching(false);
      toast.error(t('errors.noToken'));
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
            `${s.first_name} ${s.last_name}`.toLowerCase().includes(searchLower)) ||
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
    } catch (error) {
      toast.error(t('errors.searchFailed'));
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      checkStudent();
    }
  };

  return (
    <div className="space-y-6">
      {/* Otsikko */}
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

      {/* Haku */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          {t('teacher:practicum.searchStudentByName')}
        </label>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              if (searchStatus !== 'initial') setSearchStatus('initial');
            }}
            onKeyDown={handleKeyDown}
            placeholder={t('teacher:practicum.searchPlaceholder')}
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-metropolia-main-orange focus:outline-none"
            disabled={isSearching}
          />

          <button
            type="button"
            onClick={checkStudent}
            disabled={isSearching || !searchTerm.trim()}
            className="w-full sm:w-32 p-2 text-white rounded-sm font-heading
                     bg-metropolia-main-orange hover:bg-metropolia-secondary-orange
                     focus:outline-none focus:ring-2 focus:ring-metropolia-main-orange
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSearching ? (
              <span className="inline-flex items-center justify-center">
              <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                {t('checking')}
            </span>
            ) : (
              t('check')
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
              <div
                key={student.userid}
                className="w-full p-4 border rounded-xl bg-white hover:bg-gray-50
                         flex justify-between items-center transition-colors"
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
              </div>
            ))}
          </div>
        </div>
      )}

      {searchStatus === 'notFound' && (
        <div className="mt-2">
          <div className="w-full p-4 border rounded-xl bg-metropolia-support-red text-white
                        flex justify-between items-center"
          >
            <div className="text-sm font-medium">
              {t('teacher:practicum.noStudentsFound')}
            </div>
            <Cancel />
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckStudentStep;
