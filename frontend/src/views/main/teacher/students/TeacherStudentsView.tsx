import Autocomplete from '@mui/material/Autocomplete';
import {Pagination} from '@mui/material';
import TextField from '@mui/material/TextField';
import React, {useContext, useEffect, useState, useCallback} from 'react';
import {Link} from 'react-router-dom';
import {toast} from 'react-toastify';
//import GeneralLinkButton from '../../../../components/ui/buttons/GeneralLinkButton.tsx';
import {UserContext} from '../../../../contexts/UserContext';
import apiHooks from '../../../../api';
import {useCourses} from '../../../../hooks/courseHooks';
import {useTranslation} from 'react-i18next';
import Loader from '../../../../utils/Loader';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import Tooltip from '@mui/material/Tooltip';

/**
 * Student interface.
 * This interface defines the shape of a Student object.
 */
interface Student {
  first_name: string;
  last_name: string;
  email: string;
  username: string;
  studentnumber: number;
  roleid: number;
  studentgroupid: number;
  created_at: string;
  userid: number;
  group_name: string;
}

/**
 * SelectedCourse interface.
 * This interface defines the shape of a SelectedCourse object.
 */
interface SelectedCourse {
  name: string;
  code: string;
  courseid: string;
  start_date: string;
  end_date: string;
  studentgroup_name: string;
  topic_names: string;
  selected_topics: string;
  created_at: string;
}

/**
 * StudentFetchResult interface.
 * This interface defines the structure of data returned from student fetch operations.
 */
interface StudentFetchResult {
  students: Student[];
  totalPages: number;
}

/**
 * TeacherStudentsView component.
 * This component is responsible for rendering the view for a teacher to see their students.
 * It fetches the students taught by the teacher and allows the teacher to filter the students by course and search term.
 */
const TeacherStudentsView: React.FC = () => {
  const {user} = useContext(UserContext);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const {courses} = useCourses();
  const [selectedCourse, setSelectedCourse] = useState<SelectedCourse | null>(
    null,
  );
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [studentsPerPage] = useState(100);
  const {t} = useTranslation(['teacher']);
  type SearchMode = 'name' | 'course';
  const [searchMode, setSearchMode] = useState<SearchMode>('name');

  /**
   * Generic function to fetch students with error handling
   * @param fetchFn Function to fetch students
   * @returns StudentFetchResult or null on error
   */
  const fetchStudentsWithErrorHandling = useCallback(
    async <T extends any[]>(
      fetchFn: (token: string, ...args: T) => Promise<StudentFetchResult>,
      ...args: T
    ): Promise<StudentFetchResult | null> => {
      const token = localStorage.getItem('userToken');

      if (!token) {
        toast.error(t('ui:errors.noToken'));
        return null;
      }

      try {
        return await fetchFn(token, ...args);
      } catch (error) {
        console.error('Error fetching students:', error);
        toast.error(t('ui:errors.fetchStudentsFailed'));
        return null;
      }
    },
    [t],
  );

  /**
   * Fetch appropriate students based on user role
   */
  const fetchStudentsByRole = useCallback(async (): Promise<void> => {
    if (!user) return;

    let result: StudentFetchResult | null = null;

    try {
      if (user.role === 'teacher' && user.userid) {
        result = await fetchStudentsWithErrorHandling(
          async (token, userId, perPage, pageNum) =>
            apiHooks.fetchStudentsPaginationByInstructorId(
              userId,
              token,
              perPage,
              pageNum,
            ),
          user.userid,
          studentsPerPage,
          page,
        );
      } else if (['counselor', 'admin'].includes(user.role)) {
        result = await fetchStudentsWithErrorHandling(
          async (token, perPage, pageNum) =>
            apiHooks.fetchPaginatedStudents(token, perPage, pageNum),
          studentsPerPage,
          page,
        );
      }

      if (result) {
        setAllStudents(result.students);
        setTotalPages(result.totalPages);
      }
    } catch (error) {
      // Error already handled by fetchStudentsWithErrorHandling
    } finally {
      setLoading(false);
    }
  }, [user, page, studentsPerPage, fetchStudentsWithErrorHandling]);

  // Fetch all students on mount
  useEffect(() => {
    fetchStudentsByRole();
  }, [fetchStudentsByRole]);

  /**
   * Search students by text across all properties
   */
  const searchStudents = useCallback(
    async (searchQuery: string): Promise<void> => {
      setSearchTerm(searchQuery);

      if (!user?.userid) return;

      const token = localStorage.getItem('userToken');
      if (!token) {
        toast.error(t('ui:errors.noToken'));
        return;
      }

      try {
        if (searchQuery.trim() !== '') {
          // For searching, fetch all students first then filter client-side
          let fetchedStudents: Student[] = [];

          if (user.role === 'teacher') {
            fetchedStudents = await apiHooks.getStudentsByInstructorId(
              user.userid,
              token,
            );
          } else if (['counselor', 'admin'].includes(user.role)) {
            fetchedStudents = await apiHooks.fetchUsers(token);
          }

          const filtered = fetchedStudents.filter((student) =>
            Object.values(student).some(
              (value) =>
                typeof value === 'string' &&
                value.toLowerCase().includes(searchQuery.toLowerCase()) &&
                student.roleid === 1,
            ),
          );

          setAllStudents(filtered);
          setTotalPages(1);
        } else {
          // If search is cleared, return to pagination mode
          await fetchStudentsByRole();
        }
      } catch (error) {
        console.error('Error searching students:', error);
        toast.error(t('ui:errors.searchFailed'));
      }
    },
    [user, fetchStudentsByRole, t],
  );

  // If loading, show loading spinner
  if (loading) {
    return <Loader />;
  }

  // Filter students based on search term and selected course
  const filteredStudents = (selectedCourse ? students : allStudents).filter(
    (student) =>
      Object.values(student).some(
        (value) =>
          typeof value === 'string' &&
          value.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
  );

  // This function is called when a course is selected
  const handleCourseSelect = async (value: string) => {
    if (!courses) {
      toast.error(t('ui:errors.coursesNotLoaded'));
      return;
    }
    // Find the selected course from the courses array
    const selected = courses.find(
      (course: SelectedCourse) => `${course.name} ${course.code}` === value,
    ) as SelectedCourse | undefined;

    setSelectedCourse(selected || null);

    // If the selected course is found, fetch the course details
    if (selected) {
      try {
        const token: string | null = localStorage.getItem('userToken');
        if (!token) {
          toast.error(t('ui:errors.noToken'));
          return;
        }
        const students = await apiHooks.getStudentsByCourseId(
          selected.courseid,
          token,
        );
        setStudents(students);
        setTotalPages(1);
      } catch (error) {
        console.error('Error fetching course students:', error);
        toast.error(t('ui:errors.fetchCourseDetailsFailed'));
      }
    }
  };

  const handlePageChange = async (
    _event: React.ChangeEvent<unknown>,
    value: number,
  ) => {
    setPage(value);
  };


  const handleModeChange = (mode: SearchMode) => {
    setSearchMode(mode);

    if (mode === 'name') {
      // kurssi pois päältä -> takas nimihakuun
      setSelectedCourse(null);
      // searchStudents(searchTerm);
    } else {
      // nimi pois päältä -> kurssihakuun
      setSearchTerm('');
      // searchStudents('');
    }
  };

  return (
    <div className="w-full">
      <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6">
        <section className="bg-gray-50/70 rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6 md:p-8">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <Tooltip title={t('teacher:studentsView.buttons.backToMainview')} arrow>
                <Link
                  to={
                    user?.role === 'admin'
                      ? '/counselor/mainview'
                      : `/${user?.role}/mainview`
                  }
                  aria-label={t('teacher:studentsView.buttons.backToMainview')}
                  className="inline-flex items-center justify-center w-10 h-10 rounded-full text-metropolia-main-orange hover:bg-metropolia-main-orange/10 transition-colors shrink-0"
                >
                  <ArrowBackRoundedIcon fontSize="medium" />
                </Link>
              </Tooltip>

              <h1 className="text-2xl sm:text-3xl font-heading truncate">
                {t('teacher:studentsView.title')}
              </h1>
            </div>
            <div className="w-10 h-10 shrink-0" />
          </div>

          {/* Content card (scroll area) */}
          <div className="mt-5 rounded-2xl border border-gray-200 bg-white/70 shadow-sm">
            {/* Filters bar */}
            <div className="p-4 sm:p-5 border-b border-gray-200 ">
              <div className="grid gap-3 md:grid-cols-[1fr_260px] md:items-center">
                {/* Search input */}
                <div className="w-full min-w-0 ">
                  {searchMode === 'name' ? (
                    <TextField
                      value={searchTerm}
                      onChange={(e) => searchStudents(e.target.value)}
                      label={t('teacher:studentsView.search.byName')}
                      className="bg-white w-full"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          height: 56,
                          backgroundColor: '#fff',
                        },
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#e5e7eb',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#d1d5db',
                        },
                        '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#ff5a00',
                        },
                      }}
                    />
                  ) : (
                    <Autocomplete
                      className="w-full"
                      freeSolo
                      options={courses.map(
                        (course: SelectedCourse) => `${course.name} ${course.code}`,
                      )}
                      onChange={(_, value) => handleCourseSelect(value as string)}
                      value={selectedCourse ? `${selectedCourse.name} ${selectedCourse.code}` : null}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label={t('teacher:studentsView.search.byCourse')}
                          variant="outlined"
                          className="bg-white"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '12px',
                              height: 56,
                            },
                          }}
                        />
                      )}
                    />
                  )}
                </div>

                {/* Mode toggle (right side) */}
                <div className="flex md:justify-end">
                  <div className="inline-flex h-[56px] items-center rounded-xl border border-gray-200 bg-white p-1 w-full md:w-[260px]">
                    <button
                      type="button"
                      onClick={() => handleModeChange('name')}
                      className={[
                        'h-full flex-1 px-4 text-sm rounded-lg font-body transition-colors whitespace-nowrap',
                        searchMode === 'name'
                          ? 'bg-orange-50 text-metropolia-main-orange'
                          : 'text-gray-700 hover:bg-gray-50',
                      ].join(' ')}
                    >
                      {t('teacher:studentsView.search.modes.name')}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleModeChange('course')}
                      className={[
                        'h-full flex-1 px-4 text-sm rounded-lg font-body transition-colors whitespace-nowrap',
                        searchMode === 'course'
                          ? 'bg-orange-50 text-metropolia-main-orange'
                          : 'text-gray-700 hover:bg-gray-50',
                      ].join(' ')}
                    >
                      {t('teacher:studentsView.search.modes.course')}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Scrollable list area */}
            <div className="max-h-[40em] 2xl:max-h-[60em] overflow-y-auto p-4 sm:p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredStudents.map((student) => (
                  <Link
                    key={student.userid}
                    to={
                      user?.role === 'admin'
                        ? `/counselor/students/${student.userid}`
                        : `/${user?.role}/students/${student.userid}`
                    }
                    className={[
                      'group block rounded-2xl border border-gray-200 bg-white shadow-sm transition',
                      'hover:border-metropolia-main-orange/40 hover:shadow-md hover:-translate-y-[1px]',
                      'focus:outline-none focus:ring-2 focus:ring-metropolia-main-orange/30',
                    ].join(' ')}
                  >
                    <div className="p-4 sm:p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="text-lg font-heading text-gray-900 truncate">
                            {student.first_name} {student.last_name}
                          </h3>
                          <p className="mt-1 text-sm text-gray-600 break-words">
                            {student.email}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 space-y-2 text-sm text-gray-800 font-body">
                        {student.username && (
                          <div className="flex gap-2">
                          <span className="text-gray-500">
                            {t('teacher:studentsView.studentCard.username')}
                          </span>
                            <span className="font-medium break-words">
                            {student.username}
                          </span>
                          </div>
                        )}

                        {student.studentnumber && (
                          <div className="flex gap-2">
                          <span className="text-gray-500">
                            {t('teacher:studentsView.studentCard.studentNumber')}
                          </span>
                            <span className="font-medium">
                            {student.studentnumber}
                          </span>
                          </div>
                        )}

                        {student.group_name && (
                          <div className="flex gap-2">
                          <span className="text-gray-500">
                            {t('teacher:studentsView.studentCard.studentGroup')}
                          </span>
                            <span className="font-medium break-words">
                            {student.group_name}
                          </span>
                          </div>
                        )}
                      </div>

                      <div className="mt-5 flex items-center justify-between">
                      <span className="text-sm text-metropolia-main-orange font-body">
                        {t('teacher:studentsView.studentCard.clickDetails')}
                      </span>
                        <span className="text-gray-300 group-hover:text-metropolia-main-orange/40 transition">
                        →
                      </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center pt-6">
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={handlePageChange}
                    variant="outlined"
                    shape="rounded"
                  />
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default TeacherStudentsView;
