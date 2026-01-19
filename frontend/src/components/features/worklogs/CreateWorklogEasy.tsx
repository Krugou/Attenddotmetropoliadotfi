import React, {useContext, useEffect, useMemo, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {toast} from 'react-toastify';
import {UserContext} from '../../../contexts/UserContext.tsx';
import apiHooks from '../../../api';
import AddTeachers from '../courses/create/AddTeachers.tsx';
import ProgressRibbon from '../../ui/ProgressRibbon.tsx';
import WorklogDetailsStep from './WorklogDetailsStep.tsx';
import StepButtons from '../courses/create/StepButtons.tsx';
import StudentList from '../courses/create/StudentList.tsx';
import {useTranslation} from 'react-i18next';

type Instructor = {
  email: string;
  exists?: boolean;
};

const CreateCourseEasy: React.FC = () => {
  const {user} = useContext(UserContext);
  const navigate = useNavigate();
  const {t, i18n} = useTranslation('teacher');

  const [currentStep, setCurrentStep] = useState(1);
  const [courseName, setCourseName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [courseCode, setCourseCode] = useState('');
  const [startDate, setStartDate] = useState('');
  const [instructorEmail, setInstructorEmail] = useState('');
  const [instructors, setInstructors] = useState<Instructor[]>([{email: ''}]);
  const [studentList, setStudentList] = useState<any[]>([]);
  const [endDate, setEndDate] = useState('');
  const [courseExists, setCourseExists] = useState(false);
  const [requiredHours, setRequiredHours] = useState(0);
  const [description, setDescription] = useState('');
  const [shouldCheckDetails, setShouldCheckDetails] = useState(true);

  const [isCustomGroup, setIsCustomGroup] = useState(false);

  const changeDateToBetterFormat = (date: string) => {
    const dateObj = new Date(date);
    return `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(
      2,
      '0',
    )}-${String(dateObj.getDate()).padStart(2, '0')}T${String(
      dateObj.getHours(),
    ).padStart(2, '0')}:${String(dateObj.getMinutes()).padStart(2, '0')}`;
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0] ?? null;
    setFile(nextFile);
  };

  // ✅ Renderissä laskettavat labelit -> eivät jää “jumiin” enkuksi
  const uploadLabel = useMemo(() => {
    return file
      ? t('worklog.createEasy.fileUpload.fileSelectedChange')
      : t('worklog.createEasy.fileUpload.clickToUpload');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file, i18n.language]);

  const selectedFileLabel = useMemo(() => {
    return file ? file.name : t('worklog.createEasy.fileUpload.noFileSelected');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file, i18n.language]);

  const handleExcelInput = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!file) return;

    const token = localStorage.getItem('userToken');
    if (!token) {
      toast.error(t('toasts.error.tokenMissing'));
      return;
    }

    if (!user) {
      toast.error(t('attendance.errors.noUser'));
      return;
    }

    const formDataFile = new FormData();
    formDataFile.append('file', file);
    formDataFile.append('instructorEmail', user.email);
    formDataFile.append('checkCourseDetails', shouldCheckDetails.toString());

    try {
      const response = await apiHooks.excelInput({formDataFile}, token);

      if (!response) {
        toast.error(t('worklog.createEasy.toasts.excelUploadFailed'));
        return;
      }

      toast.success(t('worklog.createEasy.toasts.excelUploaded'));

      setCourseName(response.courseName);
      setCourseCode(response.courseCode);
      setStartDate(changeDateToBetterFormat(response.startDate));
      setEndDate(changeDateToBetterFormat(response.endDate));
      setInstructorEmail(response.instructorEmail);

      const rawStudents = Array.isArray(response.studentList) ? response.studentList : [];

      const cleanedStudents = rawStudents.filter((row: any) => {
        if (!row) return false;

        // Jos backend palauttaa objekteja
        if (typeof row === 'object') {
          return Object.values(row).some(
            (v) => v !== null && v !== '' && v !== undefined,
          );
        }

        // Jos backend palauttaakin joskus pelkkiä stringejä
        if (typeof row === 'string') {
          return row.trim().length > 0;
        }

        return false;
      });

      setStudentList(cleanedStudents);

      setCurrentStep((prev) => prev + 1);
    } catch (err) {
      toast.error(t('worklog.createEasy.toasts.excelUploadFailedCheckFile'));
      console.error(err);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      const token = localStorage.getItem('userToken');
      if (!token) throw new Error('No token available');

      const email = user?.email ?? '';

      const courseData = {
        name: courseName,
        code: courseCode,
        startDate,
        endDate,
        description,
        studentList,
        requiredHours,
        instructors,
        instructorEmail: email,
      };

      const response = await apiHooks.createWorkLogCourse(courseData, token);

      if (response?.insertId) {
        toast.success(t('worklog.createEasy.toasts.worklogCreated'));
        navigate(`/teacher/worklog/${response.insertId}`);
      } else {
        toast.error(t('worklog.createEasy.toasts.worklogCreateNoId'));
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      toast.error(message);
    }
  };

  const handleSubmitWrapper = async () => {
    await handleSubmit({} as React.FormEvent);
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
        return studentList.length > 0;
      case 4:
        return instructors.length > 0 && instructors.every((i) => i.email);
      default:
        return false;
    }
  };

  const getFormClassName = () => {
    if (currentStep === 3) {
      return `w-full max-w-[900px] mx-auto bg-white p-6 rounded-xl shadow-md`;
    }
    return `w-full max-w-[600px] mx-auto bg-white p-6 rounded-xl shadow-md`;
  };

  const incrementStep = () => {
    if (currentStep === 2 && courseExists) {
      alert(t('worklog.error.codeExists'));
      return;
    }
    if (currentStep === 4 && !instructors.every((i) => i.exists)) {
      alert(t('worklog.errors.groupNotFound')); // vaihda jos tää ei ole oikea teksti tähän
      return;
    }
    if (!validateFields()) {
      alert(t('practicum.fillRequiredFields')); // tai tee worklogille oma avain
      return;
    }
    setCurrentStep((prev) => prev + 1);
  };

  useEffect(() => {
    if (instructorEmail) {
      setInstructors([{email: instructorEmail, exists: true}]);
    }
  }, [instructorEmail]);

  return (
    <div className="w-full">
      {currentStep && <ProgressRibbon currentStep={currentStep} totalSteps={4} />}

      <form onSubmit={handleSubmit} className={getFormClassName()}>
        {currentStep === 1 && (
          <fieldset>
            <legend className="mb-3 text-xl">
              {t('worklog.createEasy.title')}
            </legend>

            <label className="flex flex-col items-center w-full px-4 py-6 mb-2 tracking-wide uppercase transition-colors duration-300 ease-in-out bg-white border rounded-lg shadow-lg cursor-pointer text-blue border-blue hover:bg-blue hover:text-white">
              <svg className="w-8 h-8 fill-current" viewBox="0 0 20 20">
                <path d="M10 4a2 2 0 00-2 2v4a2 2 0 104 0V6a2 2 0 00-2-2zm0 12a6 6 0 100-12 6 6 0 000 12z" />
              </svg>

              <span className="mt-2 text-base font-medium leading-normal">
                {uploadLabel}
              </span>

              <input
                type="file"
                accept=".xlsx, .xls"
                className="hidden"
                onChange={handleFileChange}
              />

              <div className="w-full p-2 mt-2 text-gray-500 bg-gray-100 rounded-lg">
                {selectedFileLabel}
              </div>
            </label>

            <label className="flex items-center mt-2 mb-3 space-x-3">
              <input
                type="checkbox"
                checked={shouldCheckDetails}
                onChange={() => setShouldCheckDetails((prev) => !prev)}
                className="w-5 h-5 text-blue-600 form-checkbox"
              />
              <span className="font-medium text-gray-900">
                {t('worklog.createEasy.fileUpload.checkDetails')}
              </span>
            </label>

            <div className="flex justify-end">
              <button
                type="button"
                className="w-40 p-2 mt-2 text-white rounded-sm font-heading bg-metropolia-main-orange hover:bg-metropolia-secondary-orange focus:outline-hidden focus:ring-2 focus:ring-metropolia-main-orange"
                onClick={handleExcelInput}
              >
                {t('worklog.createEasy.buttons.next')}
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
            courseExists={courseExists}
            setCourseExists={setCourseExists}
          />
        )}

        {currentStep === 3 && (
          <StudentList studentList={studentList} setStudentList={setStudentList} />
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
            onPrevClick={() => setCurrentStep((prev) => prev - 1)}
            onNextClick={incrementStep}
            onSubmitClick={handleSubmitWrapper}
            extrastep={true}
            isCustomGroup={isCustomGroup}
            setIsCustomGroup={setIsCustomGroup}
            isWorklog={true}
          />
        )}
      </form>
    </div>
  );
};

export default CreateCourseEasy;
