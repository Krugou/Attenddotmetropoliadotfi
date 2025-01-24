import React, {useContext, useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {toast} from 'react-toastify';
import {UserContext} from '../../../contexts/UserContext.tsx';
import apiHooks from '../../../hooks/ApiHooks';
import AddTeachers from './createcourse/AddTeachers';
import CreateWorklogProgress from './createcourse/CreateWorklogProgress.tsx';
import WorklogDetailsStep from '../worklog/WorklogDetailsStep';
import StepButtons from './createcourse/StepButtons';
import StudentList from './createcourse/StudentList';

import {useTranslation} from 'react-i18next';

/**
 * CreateCourseEasy component.
 * This component is responsible for displaying a form that allows teachers to create a course.
 * It uses the useState hook from React to manage the state of the current step, course name, file, course code, student group, start date, selected file, upload file, instructor email, instructors, student list, end date, topics form data, and course exists.
 * The component also uses the useContext hook from React to access the user context, and the useNavigate hook from React Router to navigate between pages.
 * The handleFileChange function is used to handle the change event of the file input.
 * The changeDateToBetterFormat function is used to format the date string to a more readable format.
 * The handleExcelInput function is used to handle the submission of the excel file.
 * The handleSubmit function is used to submit the form and create the course.
 * The handleSubmitWrapper function is used to wrap the handleSubmit function.
 * The validateFields function is used to validate the fields of the form based on the current step.
 * The getFormClassName function is used to get the class name for the form based on the current step.
 * The incrementStep function is used to increment the current step if the fields are valid and the course does not exist.
 * The useEffect hook is used to set the instructors when the instructor email changes.
 *
 * @returns {JSX.Element} The rendered CreateCourseEasy component.
 */
const CreateCourseEasy: React.FC = () => {
  const {user} = useContext(UserContext);
  const navigate = useNavigate();
  const {t} = useTranslation();
  const [currentStep, setCurrentStep] = useState(1);
  const [courseName, setCourseName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [courseCode, setCourseCode] = useState('');
/*   const [studentGroup, setStudentGroup] = useState(''); */
  const [startDate, setStartDate] = useState('');
  const [selectedFile, setSelectedFile] = useState<string>('No file selected');
  const [uploadFile, setUploadFile] = useState<string>(
    'Click here to upload a file',
  );
  const [isCustomGroup, setIsCustomGroup] = useState(false);

  /**
   * Instructor interface represents the structure of an instructor.
   * It includes properties for the instructor's email and a boolean to check if the instructor exists.
   */
  type Instructor = {
    email: string;
    exists?: boolean;
  };
  const [instructorEmail, setInstructorEmail] = useState('');
  const [instructors, setInstructors] = useState<Instructor[]>([{email: ''}]);

  const [studentList, setStudentList] = useState<string[]>([]);
  const [endDate, setEndDate] = useState('');
  const [courseExists, setCourseExists] = useState(false);
  const [requiredHours, setRequiredHours] = useState(0);
  const [description, setDescription] = useState('');
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setUploadFile('File Selected Click again to change');
      setSelectedFile(selectedFile.name);
    } else {
      setUploadFile('Upload a excel file');
      setSelectedFile('No file selected');
    }
  };

  const [shouldCheckDetails, setShouldCheckDetails] = useState(true);
  const changeDateToBetterFormat = (date: string) => {
    const dateObj = new Date(date);
    return `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(
      2,
      '0',
    )}-${String(dateObj.getDate()).padStart(2, '0')}T${String(
      dateObj.getHours(),
    ).padStart(2, '0')}:${String(dateObj.getMinutes()).padStart(2, '0')}`;
  };
  const handleExcelInput = async (event: React.FormEvent) => {
    event.preventDefault();

    if (file) {
      const formDataFile = new FormData();
      formDataFile.append('file', file);
      if (user) {
        formDataFile.append('instructorEmail', user.email); // get email from userContext
      }
      formDataFile.append('checkCourseDetails', shouldCheckDetails.toString());
      const token: string | null = localStorage.getItem('userToken');
      if (!token) {
        throw new Error('No token available');
      }
      try {
        const response = await apiHooks.excelInput({formDataFile}, token);

        if (response) {
          toast.success('Excel file uploaded');
          setCourseName(response.courseName);
/*           setStudentGroup(response.studentGroup); */
          setCourseCode(response.courseCode);

          setStartDate(changeDateToBetterFormat(response.startDate));
          setEndDate(changeDateToBetterFormat(response.endDate));
          setInstructorEmail(response.instructorEmail);
          setStudentList(response.studentList);

          setCurrentStep((prevStep) => prevStep + 1);
        } else {
          toast.error('Excel file upload failed');
          console.error('Excel file upload failed');
        }
      } catch (error) {
        if (error instanceof Error) {
          toast.error('Excel file upload failed, check your file');
        }
      }
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      let email = '';
      if (user) {
        email = user.email;
      }
      const courseData = {
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
      const token: string | null = localStorage.getItem('userToken');
      if (!token) {
        throw new Error('No token available');
      }
      const response = await apiHooks.createWorkLogCourse(courseData, token);

      if (response) {
        toast.success('Course created');
        navigate(`/teacher/worklog/${response.id}`);
        console.log('Course created');
      } else {
        toast.error('Course creation failed');
        console.error('Course creation failed');
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };

  const handleSubmitWrapper = async () => {
    const syntheticEvent = { preventDefault: () => {} } as React.FormEvent;
    handleSubmit(syntheticEvent);
  };

  const validateFields = () => {
    switch (currentStep) {
      case 2:
        return (
          courseCode &&
          courseName &&
          startDate &&
          endDate &&
          description &&
          requiredHours > 0
        );

      case 3:
        return studentList && studentList.length > 0;
      case 4:
        return (
          instructors &&
          instructors.length > 0 &&
          instructors.every((instructor) => instructor.email)
        );
      default:
        return false;
    }
  };

  const getFormClassName = () => {
    switch (currentStep) {
      case 1:
        return 'w-full md:w-2/3 lg:w-1/2 xl:w-1/3 2xl:w-1/5 mx-auto bg-white p-4 rounded shadow-md';
      case 2:
        return 'w-full md:w-2/3 lg:w-1/2 xl:w-1/3 2xl:w-1/3 mx-auto bg-white p-4 rounded shadow-md';
      case 3:
        return 'w-full 2xl:w-2/3 mx-auto bg-white p-4 rounded shadow-md';
      case 4:
        return 'w-full md:w-2/3 lg:w-1/2 xl:w-1/3 2xl:w-1/3 mx-auto bg-white p-4 rounded shadow-md';
      default:
        return 'w-full md:w-2/3 lg:w-1/2 xl:w-1/3 2xl:w-1/3 mx-auto bg-white p-4 rounded shadow-md';
    }
  };

  const incrementStep = () => {
    if (currentStep === 2 && courseExists) {
      alert('A course with this code already exists.');
    } else if (
      currentStep === 4 &&
      !instructors.every((instructor) => instructor.exists)
    ) {
      alert('One or more instructors do not exist in the database.');
    } else if (validateFields()) {
      setCurrentStep((prevStep) => prevStep + 1);
    } else {
      alert('Please fill all required fields.');
    }
  };

  useEffect(() => {
    if (instructorEmail) {
      setInstructors([{email: instructorEmail, exists: true}]);
    }
  }, [instructorEmail]);
  return (
    <div className='w-full'>
      {currentStep && (
        <CreateWorklogProgress
          currentStep={currentStep}
          createCourseMode='easy'
        />
      )}

      <form onSubmit={handleSubmit} className={getFormClassName()}>
        {currentStep === 1 && (
          <fieldset>
            <legend className='mb-3 text-xl'>
              {t('teacher.createCourseEasy.title')}
            </legend>
            <label className='flex flex-col items-center w-full px-4 py-6 mb-2 tracking-wide uppercase transition-colors duration-300 ease-in-out bg-white border rounded-lg shadow-lg cursor-pointer text-blue border-blue hover:bg-blue hover:text-white'>
              <svg className='w-8 h-8 fill-current' viewBox='0 0 20 20'>
                <path d='M10 4a2 2 0 00-2 2v4a2 2 0 104 0V6a2 2 0 00-2-2zm0 12a6 6 0 100-12 6 6 0 000 12z' />
              </svg>
              <span className='mt-2 text-base font-medium leading-normal'>
                {uploadFile}
              </span>
              <input
                type='file'
                accept='.xlsx, .xls'
                className='hidden'
                onChange={handleFileChange}
              />
              <div className='w-full p-2 mt-2 text-gray-500 bg-gray-100 rounded-lg'>
                {selectedFile}
              </div>
            </label>
            <label className='flex items-center mt-2 mb-3 space-x-3'>
              <input
                type='checkbox'
                checked={shouldCheckDetails}
                onChange={() => setShouldCheckDetails((prev) => !prev)}
                className='w-5 h-5 text-blue-600 form-checkbox'
              />
              <span className='font-medium text-gray-900'>
                {t('teacher.createCourseEasy.fileUpload.checkDetails')}
              </span>
            </label>
            <div className='flex justify-end'>
              <button
                type='button'
                className='w-40 p-2 mt-2 font-heading text-white rounded bg-metropoliaMainOrange hover:bg-metropoliaSecondaryOrange focus:outline-none focus:ring-2 focus:ring-metropoliaMainOrange'
                onClick={handleExcelInput}>
                {t('teacher.createCourseEasy.buttons.next')}
              </button>
            </div>
          </fieldset>
        )}
        {currentStep === 2 && (
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
          />
        )}

        {currentStep === 3 && (
          <StudentList
            studentList={studentList}
            setStudentList={setStudentList}
          />
        )}
        {currentStep === 4 && (
          <AddTeachers
            instructors={instructors}
            setInstructors={setInstructors}
            instructorEmail={instructorEmail}
          />
        )}
        {currentStep >= 2 && (
          <StepButtons
            currentStep={currentStep}
            onPrevClick={() => setCurrentStep((prevStep) => prevStep - 1)}
            onNextClick={incrementStep}
            onSubmitClick={handleSubmitWrapper} // Use the wrapper function here
            extrastep={true}
            isCustomGroup={isCustomGroup}
            isWorklog={true}
          />
        )}
      </form>
    </div>
  );
};

export default CreateCourseEasy;
