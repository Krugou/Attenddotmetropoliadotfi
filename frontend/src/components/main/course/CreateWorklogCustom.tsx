import React, {useContext, useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {toast} from 'react-toastify';
import {UserContext} from '../../../contexts/UserContext.tsx';
import apiHooks from '../../../api';
import AddTeachers from './createcourse/AddTeachers';
import CreateWorklogProgress from './createcourse/CreateWorklogProgress.tsx';
import StepButtons from './createcourse/StepButtons';
import StudentList from './createcourse/StudentList';
import WorklogDetailsStep from '../worklog/WorklogDetailsStep';

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

const CreateWorklogCustom: React.FC = () => {
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
  const [startDate, setStartDate] = useState('');
  const [instructorEmail, setInstructorEmail] = useState('');
  const [instructors, setInstructors] = useState<Instructor[]>([{email: ''}]);
  const [isCustomGroup, setIsCustomGroup] = useState(false);
  const [studentList, setStudentList] = useState<string[]>([]);
  const [endDate, setEndDate] = useState('');
  const [courseExists, setCourseExists] = useState(false);
  const [description, setDescription] = useState('');
  const [requiredHours, setRequiredHours] = useState(0);
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
        return (
          courseCode &&
          courseName &&
          startDate &&
          endDate &&
          description &&
          requiredHours > 0
        );
      case 2:
        return studentList && studentList.length > 0;
      case 3:
        return (
          instructors &&
          instructors.length > 0 &&
          instructors.every((instructor) => instructor.email)
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
   * skipStep function.
   * This function is used to skip one step forward if the fields are valid.
   */
  const skipStep = () => {
    if (validateFields()) {
      setCurrentStep((prevStep) => prevStep + 2);
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
    try {
      let email = '';
      if (user) {
        email = user.email;
      }

      const worklogCourse = {
        name: courseName,
        code: courseCode,
        startDate: startDate,
        endDate: endDate,
        description: description,
        studentList: studentList,
        requiredHours: requiredHours,
        instructors: instructors,
        instructorEmail: email,
      };

      const token = localStorage.getItem('userToken');
      if (!token) throw new Error('No token available');

      const response = await apiHooks.createWorkLogCourse(worklogCourse, token);
      if (response && response.insertId) {
        toast.success('Worklog course created');
        navigate(`/teacher/worklog/${response.insertId}`); //
      } else {
        toast.error('Worklog course creation failed - no ID returned');
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };

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
    <div className='w-full'>
      {currentStep && (
        <CreateWorklogProgress
          currentStep={currentStep}
          createCourseMode='custom'
        />
      )}

      <form
        onSubmit={(e) => handleSubmit(e)} // Direct event handling
        className={getFormClassName()}>
        {currentStep === 1 && (
          <>
            <StepButtons
              currentStep={currentStep}
              onPrevClick={() => setCurrentStep((prevStep) => prevStep - 1)}
              onNextClick={skipStep}
              onSubmitClick={handleSubmitWrapper}
              extrastep={false}
              isCustomGroup={isCustomGroup}
              customNextLabel='Skip'
              isWorklog={true}
            />
            <WorklogDetailsStep
              name={courseName}
              setName={setCourseName}
              code={courseCode}
              setCode={setCourseCode}
              startDate={startDate}
              setStartDate={setStartDate}
              endDate={endDate}
              setEndDate={setEndDate}
              description={description}
              setDescription={setDescription}
              requiredHours={requiredHours}
              setRequiredHours={setRequiredHours}
              courseExists={courseExists}
              setCourseExists={setCourseExists}
            />
          </>
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
        <StepButtons
          currentStep={currentStep}
          onPrevClick={() => setCurrentStep((prevStep) => prevStep - 1)}
          onNextClick={incrementStep}
          onSubmitClick={handleSubmitWrapper}
          extrastep={false}
          isCustomGroup={isCustomGroup}
          setIsCustomGroup={setIsCustomGroup}
          isWorklog={true}
        />
      </form>
    </div>
  );
};

export default CreateWorklogCustom;
