import React, {useContext, useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {toast} from 'react-toastify';
import {UserContext} from '../../../contexts/UserContext.tsx';
import apiHooks from '../../../api';
import AddTeachers from './createcourse/AddTeachers';
import CourseDetails from './createcourse/CourseDetails';
import CreateCourseProgress from './createcourse/CreateCourseProgress.tsx';
import StepButtons from './createcourse/StepButtons';
import StudentList from './createcourse/StudentList';
import TopicGroupAndTopicsSelector from './createcourse/TopicsGroupAndTopics';
/**
 * CreateCourseCustom component.
 * This component is responsible for displaying a form that allows teachers to create a course.
 * It uses the useState hook from React to manage the state of the current step, course name, course code, student group, start date, instructor email, instructors, student list, end date, topics form data, and course exists.
 * The component also uses the useContext hook from React to access the user context, and the useNavigate hook from React Router to navigate between pages.
 * The validateFields function is used to validate the fields of the form based on the current step.
 * The getFormClassName function is used to get the class name for the form based on the current step.
 * The incrementStep function is used to increment the current step if the fields are valid and the course does not exist.
 * The handleSubmit function is used to submit the form and create the course.
 * The handleSubmitWrapper function is used to wrap the handleSubmit function.
 * The useEffect hook is used to set the instructor email and instructors when the component mounts or the instructor email or user changes.
 *
 * @returns {JSX.Element} The rendered CreateCourseCustom component.
 */
const CreateCourseCustom: React.FC = () => {
  const {user} = useContext(UserContext);
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [courseName, setCourseName] = useState('');
  /**
   * Instructor interface represents the structure of an instructor.
   * It includes properties for the instructor's email and a boolean to check if the instructor exists.
   */
  type Instructor = {
    email: string;
    exists?: boolean;
  };
  const [courseCode, setCourseCode] = useState('');
  const [studentGroup, setStudentGroup] = useState('');
  const [startDate, setStartDate] = useState('');

  const [instructorEmail, setInstructorEmail] = useState('');
  const [instructors, setInstructors] = useState<Instructor[]>([{email: ''}]);
  const [isCustomGroup, setIsCustomGroup] = useState(false);
  const [studentList, setStudentList] = useState<string[]>([]);
  const [endDate, setEndDate] = useState('');
  const [topicsFormData, setTopicsFormData] = useState<any>([]);
  const [courseExists, setCourseExists] = useState(false);
  /**
   * validateFields function.
   * This function is used to validate the fields of the form based on the current step.
   * It checks if the course code, course name, student group, start date, and end date are empty.
   * It also checks if the student list is empty.
   * It also checks if all instructors exist.
   * It also checks if the topic group and topics are empty.
   *
   * @returns {boolean} A boolean that represents whether all the fields are valid.
   */
  const validateFields = () => {
    switch (currentStep) {
      case 1:
        return courseCode && courseName && studentGroup && startDate && endDate;
      case 2:
        return studentList && studentList.length > 0;
      case 3:
        return (
          instructors &&
          instructors.length > 0 &&
          instructors.every((instructor) => instructor.email)
        );

      case 4:
        return (
          topicsFormData &&
          topicsFormData.topicgroup &&
          topicsFormData.topics &&
          topicsFormData.topics.length > 0
        );
      default:
        return false;
    }
  };
  /**
   * getFormClassName function.
   * This function is used to get the class name for the form based on the current step.
   *
   * @returns {string} The class name for the form.
   */
  const getFormClassName = () => {
    switch (currentStep) {
      case 1:
        return 'w-full md:w-2/3 lg:w-1/2 xl:w-1/3 2xl:w-1/5 mx-auto bg-white p-4 rounded-sm shadow-md';
      case 2:
        return 'w-full 2xl:w-2/3 mx-auto bg-white p-4 rounded-sm shadow-md';
      case 3:
        return 'w-full md:w-2/3 lg:w-1/2 xl:w-1/3 2xl:w-1/3 mx-auto bg-white p-4 rounded-sm shadow-md';
      case 4:
        return 'w-full md:w-2/3 lg:w-1/2 xl:w-1/3 2xl:w-1/3 mx-auto bg-white p-4 rounded-sm shadow-md';
      default:
        return 'w-full md:w-2/3 lg:w-1/2 xl:w-1/3 2xl:w-1/3 mx-auto bg-white p-4 rounded-sm shadow-md';
    }
  };
  /**
   * incrementStep function.
   * This function is used to increment the current step if the fields are valid and the course does not exist.
   * It also displays an alert if the course exists or if one or more instructors do not exist.
   */
  const incrementStep = () => {
    if (currentStep === 1 && courseExists) {
      alert('A course with this code already exists.');
    } else if (
      currentStep === 3 &&
      !instructors.every((instructor) => instructor.exists)
    ) {
      alert('One or more instructors do not exist in the database.');
    } else if (validateFields()) {
      setCurrentStep((prevStep) => prevStep + 1);
    } else {
      alert('Please fill all required fields.');
    }
  };
  /**
   * handleSubmit function.
   * This function is used to submit the form and create the course.
   * It uses the createCourse function from the apiHooks file to create the course.
   * It also uses the toast.success and toast.error functions from the react-toastify library to display a success or error message.
   * It also uses the navigate function from the React Router useNavigate hook to navigate to the course page.
   * It also uses the useEffect hook from React to update the instructor email and instructors when the component mounts or the instructor email or user changes.
   *
   * @param {React.FormEvent} event The form event.
   * @returns {Promise<void>} A promise that resolves when the course is created.
   */
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    let email = '';
    if (user) {
      email = user.email;
    }
    const courseData = {
      courseName: courseName,
      courseCode: courseCode,
      studentGroup: studentGroup,
      startDate: startDate,
      endDate: endDate,
      instructors: instructors,
      studentList: studentList,
      topicGroup: topicsFormData.topicgroup,
      topics: topicsFormData.topics,
      instructorEmail: email, // get email from userContext
    };
    const token: string | null = localStorage.getItem('userToken');
    if (!token) {
      throw new Error('No token available');
    }
    const response = await apiHooks.createCourse(courseData, token);

    if (response) {
      toast.success('Course created');
      navigate(`/teacher/courses/${response.courseId}`);
      console.log('Course created');
    } else {
      toast.error('Course creation failed');
      console.error('Course creation failed');
    }
  };
  /**
   * handleSubmitWrapper function.
   * This function is used to wrap the handleSubmit function.
   *
   * @returns {Promise<void>} A promise that resolves when the handleSubmit function is called.
   */
  const handleSubmitWrapper = async () => {
    await handleSubmit({} as React.FormEvent);
  };
  /**
   * useEffect hook.
   * This hook is used to set the instructor email and instructors when the component mounts or the instructor email or user changes.
   */
  useEffect(() => {
    let email = '';
    if (user) {
      email = user.email;
    }
    setInstructorEmail(email); // get email from userContext
    if (instructorEmail) {
      setInstructors([{email: instructorEmail, exists: true}]);
    }
  }, [instructorEmail, user]);

  return (
    <div className='w-full '>
      {currentStep && (
        <CreateCourseProgress
          currentStep={currentStep}
          createCourseMode='custom'
        />
      )}
      <form
        onSubmit={(event) => handleSubmit(event)}
        className={getFormClassName()}>
        {currentStep === 1 && (
          <CourseDetails
            courseCode={courseCode}
            setCourseCode={setCourseCode}
            courseName={courseName}
            setCourseName={setCourseName}
            studentGroup={studentGroup}
            setStudentGroup={setStudentGroup}
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
            courseExists={courseExists}
            setCourseExists={setCourseExists}
          />
        )}

        {currentStep === 2 && (
          <StudentList
            studentList={studentList}
            setStudentList={setStudentList}
          />
        )}
        {currentStep === 3 && (
          <AddTeachers
            instructors={instructors}
            setInstructors={setInstructors}
            instructorEmail={instructorEmail}
          />
        )}
        {currentStep === 4 && (
          <TopicGroupAndTopicsSelector
            setTopicsFormData={setTopicsFormData}
            isCustomGroup={isCustomGroup}
            setIsCustomGroup={setIsCustomGroup}
          />
        )}
        <StepButtons
          currentStep={currentStep}
          onPrevClick={() => setCurrentStep((prevStep) => prevStep - 1)}
          onNextClick={incrementStep}
          onSubmitClick={handleSubmitWrapper}
          extrastep={false}
          isCustomGroup={isCustomGroup}
        />
      </form>
    </div>
  );
};

export default CreateCourseCustom;
