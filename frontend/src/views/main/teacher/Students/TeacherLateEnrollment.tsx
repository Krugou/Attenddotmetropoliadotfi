import React, {useState, useContext, useEffect} from 'react';
import NewStudentUser from '../../../../components/main/NewStudentUser';
import {UserContext} from '../../../../contexts/UserContext';
import apiHooks from '../../../../api';
import {toast} from 'react-toastify';
import {useTranslation} from 'react-i18next';
import TextField from '@mui/material/TextField';
import Loader from '../../../../utils/Loader';
import {Link, useNavigate} from 'react-router-dom';
import {Modal, Autocomplete} from '@mui/material';
import {useCourses} from '../../../../hooks/courseHooks';

/**
 * Student interface.
 * Defines the shape of a Student object.
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
 * Course interface represents the structure of a course.
 */
interface Course {
  courseid: number;
  course_name: string;
  startDate: string;
  endDate: string;
  code: string;
  student_group: number | null;
  topic_names: string;
  selected_topics: string;
  instructor_name: string;
  usercourseid: number;
}

/**
 * SelectedCourse interface.
 * Defines the shape of a course that can be selected for enrollment.
 */
interface SelectedCourse {
  name: string;
  code: string;
  courseid: number;
  start_date: string;
  end_date: string;
  studentgroup_name: string;
  topic_names: string;
  selected_topics: string;
  created_at: string;
}

/**
 * TeacherLateEnrollment component.
 * This component provides options to either add a completely new student
 * or find and enroll an existing student from the database.
 */
const TeacherLateEnrollment: React.FC = () => {
  const {t} = useTranslation(['common', 'teacher']);
  const navigate = useNavigate();
  const [enrollmentMode, setEnrollmentMode] = useState<
    'new' | 'existing' | null
  >(null);
  const {user} = useContext(UserContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [editCourseOpen, setEditCourseOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<SelectedCourse | null>(
    null,
  );
  const [studentCourses, setStudentCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<SelectedCourse[]>([]);

  // Use useCourses hook to get courses based on user role
  const {courses: editCourses} =
    user?.role !== 'student' ? useCourses() : {courses: []};

  // Effect to fetch student's existing courses when a student is selected
  useEffect(() => {
    if (selectedStudent) {
      fetchStudentCourses(selectedStudent.userid);
    }
  }, [selectedStudent]);

  // Effect to filter out courses the student is already enrolled in
  useEffect(() => {
    if (editCourses && studentCourses.length > 0) {
      const filtered = editCourses.filter(
        (course) =>
          !studentCourses.some(
            // @ts-expect-error
            (studentCourse) => studentCourse.courseid === course.courseid,
          ),
      );
      setFilteredCourses(filtered);
    } else {
      setFilteredCourses(editCourses || []);
    }
  }, [editCourses, studentCourses]);

  // Fetch student's existing courses
  const fetchStudentCourses = async (studentId: number) => {
    const token = localStorage.getItem('userToken');
    if (!token) {
      toast.error(t('common:errors.noToken'));
      return;
    }

    try {
      const response = await apiHooks.getUserInfoByUserid(
        token,
        studentId.toString(),
      );
      setStudentCourses(response.courses || []);
    } catch (error) {
      console.error('Error fetching student courses:', error);
      toast.error(t('common:errors.fetchFailed'));
    }
  };

  // Handle opening and closing the course selection modal
  const handleOpenEditCourse = (student: Student) => {
    setSelectedStudent(student);
    setEditCourseOpen(true);
  };

  const handleCloseEditCourse = () => {
    setEditCourseOpen(false);
    setSelectedCourse(null);
  };

  // Handle course selection from autocomplete
  const handleCourseSelect = (value: string | null) => {
    if (!value) {
      setSelectedCourse(null);
      return;
    }

    const selected = filteredCourses.find(
      (course) => `${course.name} ${course.code}` === value,
    );
    setSelectedCourse(selected || null);
  };

  // Add student to selected course
  const handleAddStudentToCourse = async () => {
    if (!selectedStudent || !selectedCourse) {
      toast.error(t('common:errors.selectionRequired'));
      return;
    }

    const token = localStorage.getItem('userToken');
    if (!token) {
      toast.error(t('common:errors.noToken'));
      return;
    }

    try {
      await apiHooks.updateStudentCourses(
        token,
        selectedStudent.userid,
        selectedCourse.courseid,
      );

      toast.success(t('common:lateEnrollment.studentAddedToCourse'));
      handleCloseEditCourse();

      // Navigate to student detail page after adding to course
      navigate(`/teacher/students/${selectedStudent.userid}`);
    } catch (error) {
      console.error('Error adding student to course:', error);
      toast.error(t('common:errors.enrollmentFailed'));
    }
  };

  // Search for existing students in the database
  const searchStudents = async (searchQuery: string): Promise<void> => {
    setSearchTerm(searchQuery);
    if (!user?.userid) return;

    const token = localStorage.getItem('userToken');
    if (!token) {
      toast.error(t('common:errors.noToken'));
      return;
    }

    if (searchQuery.trim() === '') {
      setStudents([]);
      return;
    }

    setLoading(true);
    try {
      let fetchedStudents: Student[] = [];

      // Use role-based student fetching as provided
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

      setStudents(filtered);
    } catch (error) {
      console.error('Error searching students:', error);
      toast.error(t('common:errors.searchFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='w-full mx-auto 2xl:w-9/12'>
      {/* Enrollment mode selection */}
      {!enrollmentMode ? (
        <div className='flex flex-col items-center justify-center gap-6 p-8 bg-white rounded-lg shadow-md'>
          <h1 className='p-3 mb-5 ml-auto mr-auto text-2xl text-center bg-white rounded-lg font-heading w-fit'>
            {t('common:newStudent.title')}
          </h1>
          <h2 className='text-xl font-heading text-metropolia-main-grey'>
            {t('common:lateEnrollment.selectMode')}
          </h2>

          <div className='flex flex-col gap-4 sm:flex-row sm:gap-8'>
            <button
              onClick={() => setEnrollmentMode('new')}
              className='px-6 py-3 text-lg font-bold text-white transition-colors duration-200 rounded-lg shadow-md font-body bg-metropolia-main-orange hover:bg-metropolia-main-orange-dark'>
              {t('common:lateEnrollment.newStudent')}
            </button>

            <button
              onClick={() => setEnrollmentMode('existing')}
              className='px-6 py-3 text-lg font-bold transition-colors duration-200 rounded-lg shadow-md font-body text-metropolia-main-grey bg-metropolia-trend-light-blue hover:bg-metropolia-trend-light-blue-dark'>
              {t('common:lateEnrollment.existingStudent')}
            </button>
          </div>
        </div>
      ) : enrollmentMode === 'new' ? (
        /* New student enrollment form */
        <div>
          <button
            onClick={() => setEnrollmentMode(null)}
            className='px-4 py-2 mb-4 font-medium transition-colors duration-200 rounded-lg font-body text-metropolia-support-white bg-metropolia-support-blue hover:bg-metropolia-support-blue-dark'>
            {t('common:lateEnrollment.backToOptions')}
          </button>
          <NewStudentUser />
        </div>
      ) : (
        /* Existing student search and enrollment */
        <div className='p-6 bg-white rounded-lg shadow-md'>
          <h1 className='p-3 mb-5 ml-auto mr-auto text-2xl text-center bg-white rounded-lg font-heading w-fit'>
            {t('common:newStudent.title')}
          </h1>
          <button
            onClick={() => setEnrollmentMode(null)}
            className='px-4 py-2 mb-6 font-medium transition-colors duration-200 rounded-lg font-body text-metropolia-support-white bg-metropolia-support-blue hover:bg-metropolia-support-blue-dark'>
            {t('common:lateEnrollment.backToOptions')}
          </button>

          <h2 className='mb-6 text-xl font-heading text-metropolia-main-grey'>
            {t('common:lateEnrollment.findExistingStudent')}
          </h2>

          {/* Search input */}
          <div className='mb-6'>
            <TextField
              value={searchTerm}
              onChange={(e) => searchStudents(e.target.value)}
              label={t('teacher:studentsView.search.byName')}
              className='w-full bg-white'
              fullWidth
              variant='outlined'
              placeholder={t('common:lateEnrollment.searchPlaceholder')}
            />
          </div>

          {/* Loading indicator */}
          {loading && <Loader />}

          {/* Search results */}
          <div className='mt-4'>
            {!loading && searchTerm && students.length === 0 ? (
              <p className='text-metropolia-support-red'>
                {t('common:lateEnrollment.noStudentsFound')}
              </p>
            ) : (
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
                {students.map((student) => (
                  <div
                    key={student.userid}
                    className='p-4 transition-all duration-300 bg-white border rounded-lg shadow-sm border-metropolia-main-orange hover:shadow-lg hover:bg-gray-50'>
                    <div className='flex flex-col gap-2'>
                      <h3 className='text-lg font-semibold font-heading text-metropolia-main-grey'>
                        {student.first_name} {student.last_name}
                      </h3>
                      <p className='text-sm break-all text-metropolia-main-grey'>
                        {student.email}
                      </p>
                      <p className='text-sm text-metropolia-main-grey'>
                        {t('teacher:studentsView.studentCard.studentNumber')}{' '}
                        {student.studentnumber}
                      </p>
                      <p className='text-sm text-metropolia-main-grey'>
                        {t('teacher:studentsView.studentCard.studentGroup')}{' '}
                        {student.group_name}
                      </p>
                      <div className='flex flex-wrap mt-3 gap-2'>
                        <button
                          onClick={() => handleOpenEditCourse(student)}
                          className='px-3 py-1.5 text-sm font-medium transition-colors duration-200 text-white rounded-md bg-metropolia-main-orange hover:bg-metropolia-main-orange-dark'>
                          {t('common:lateEnrollment.addToCourse')}
                        </button>

                        <Link
                          to={`/teacher/students/${student.userid}`}
                          className='px-3 py-1.5 text-sm font-medium transition-colors duration-200 rounded-md text-metropolia-support-white bg-metropolia-support-blue hover:bg-metropolia-support-blue-dark'>
                          {t('common:lateEnrollment.viewDetails')}
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Course selection modal */}
          <Modal open={editCourseOpen} onClose={handleCloseEditCourse}>
            <div className='flex items-center justify-center'>
              <div className='absolute max-w-xl p-8 m-4 mx-auto transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg top-1/2 left-1/2'>
                <h3 className='mb-4 text-xl font-heading text-metropolia-main-grey'>
                  {t('common:lateEnrollment.selectCourse')} -{' '}
                  {selectedStudent?.first_name} {selectedStudent?.last_name}
                </h3>

                <div>
                  {filteredCourses.length > 0 ? (
                    <>
                      <Autocomplete
                        className='sm:w-[20em] w-full'
                        freeSolo
                        options={filteredCourses.map(
                          (course) => `${course.name} ${course.code}`,
                        )}
                        onChange={(_, value) => handleCourseSelect(value)}
                        value={
                          selectedCourse
                            ? `${selectedCourse.name} ${selectedCourse.code}`
                            : null
                        }
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label={t(
                              'teacher:studentCourse.labels.searchCourses',
                            )}
                            margin='normal'
                            variant='outlined'
                          />
                        )}
                      />
                      {selectedCourse && (
                        <div className='mt-4 p-4 bg-gray-50 rounded-md'>
                          <h4 className='font-medium text-metropolia-main-grey'>
                            {selectedCourse?.name} {selectedCourse?.code}
                          </h4>
                          <p className='mt-2 text-sm'>
                            <span className='font-medium'>
                              {t('teacher:studentCourse.labels.topics')}:
                            </span>{' '}
                            {selectedCourse?.topic_names
                              ? Array.from(
                                  new Set(
                                    selectedCourse.topic_names
                                      .split(',')
                                      .map((topic) => topic.trim()),
                                  ),
                                )
                                  .filter(Boolean)
                                  .join(', ')
                              : ''}
                          </p>
                          <p className='mt-2 text-sm'>
                            <span className='font-medium'>
                              {t('teacher:studentCourse.labels.startDate')}:
                            </span>{' '}
                            {new Date(
                              selectedCourse?.start_date,
                            ).toLocaleDateString()}
                          </p>
                          <p className='mt-2 text-sm'>
                            <span className='font-medium'>
                              {t('teacher:studentCourse.labels.endDate')}:
                            </span>{' '}
                            {new Date(
                              selectedCourse?.end_date,
                            ).toLocaleDateString()}
                          </p>
                          <p className='mt-2 text-sm'>
                            <span className='font-medium'>
                              {t('teacher:studentCourse.labels.studentGroup')}:
                            </span>{' '}
                            {selectedCourse?.studentgroup_name}
                          </p>
                        </div>
                      )}
                      <div className='flex justify-between mt-6'>
                        <button
                          className='px-4 py-2 font-medium transition-colors duration-200 rounded-md text-metropolia-main-grey bg-gray-200 hover:bg-gray-300'
                          onClick={handleCloseEditCourse}>
                          {t('common:cancel')}
                        </button>
                        <button
                          className='px-4 py-2 font-medium text-white transition-colors duration-200 rounded-md bg-metropolia-main-orange hover:bg-metropolia-main-orange-dark'
                          onClick={handleAddStudentToCourse}
                          disabled={!selectedCourse}>
                          {t('teacher:studentCourse.buttons.addToCourse')}
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className='p-4 text-center bg-gray-50 rounded-md'>
                      <p className='text-metropolia-support-red'>
                        {t('common:lateEnrollment.noAvailableCourses')}
                      </p>
                      <button
                        className='px-4 py-2 mt-4 font-medium transition-colors duration-200 rounded-md text-metropolia-main-grey bg-gray-200 hover:bg-gray-300'
                        onClick={handleCloseEditCourse}>
                        {t('common:close')}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Modal>
        </div>
      )}
    </div>
  );
};

export default TeacherLateEnrollment;
