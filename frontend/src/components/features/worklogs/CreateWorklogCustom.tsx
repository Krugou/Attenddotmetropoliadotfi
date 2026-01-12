import React, {useContext, useEffect, useMemo, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {toast} from 'react-toastify';
import {UserContext} from '../../../contexts/UserContext.tsx';
import apiHooks from '../../../api';
import AddTeachers from '../courses/create/AddTeachers.tsx';
import ProgressRibbon from '../../ui/ProgressRibbon.tsx';
import StepButtons from '../courses/create/StepButtons.tsx';
import StudentList from '../courses/create/StudentList.tsx';
import WorklogDetailsStep from './WorklogDetailsStep.tsx';
import {useTranslation} from 'react-i18next';

type Instructor = {
  email: string;
  exists?: boolean;
};

const CreateWorklogCustom: React.FC = () => {
  const {user} = useContext(UserContext);
  const navigate = useNavigate();
  const {t} = useTranslation('teacher');

  const [currentStep, setCurrentStep] = useState(1);

  const [courseName, setCourseName] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [description, setDescription] = useState('');
  const [requiredHours, setRequiredHours] = useState(0);

  const [instructorEmail, setInstructorEmail] = useState('');
  const [instructors, setInstructors] = useState<Instructor[]>([{email: ''}]);

  const [studentList, setStudentList] = useState<string[]>([]);
  const [courseExists, setCourseExists] = useState(false);

  // (Worklogissa ei käytetä group-topics -juttuja, mutta StepButtons vaatii nämä propsit)
  const [isCustomGroup, setIsCustomGroup] = useState(false);

  const hasDateOrderError = useMemo(() => {
    if (!startDate || !endDate) return false;
    const s = new Date(startDate);
    const e = new Date(endDate);
    if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return false;
    return e <= s;
  }, [startDate, endDate]);

  const validateStep1 = (showToasts: boolean) => {
    // pakolliset (näistä osalle löytyy omat käännökset)
    if (!courseName) {
      if (showToasts) toast.error(t('worklog.form.nameRequired'));
      return false;
    }
    if (!description) {
      if (showToasts) toast.error(t('worklog.form.descriptionRequired'));
      return false;
    }
    if (!startDate) {
      if (showToasts) toast.error(t('worklog.form.startDateRequired'));
      return false;
    }
    if (!endDate) {
      if (showToasts) toast.error(t('worklog.form.endDateRequired'));
      return false;
    }

    // kurssikoodi (tähän ei ole erillistä "required" -avainta teacherissä,
    // joten pidetään tämä vain pakollisuutena ilman omaa viestiä)
    if (!courseCode) {
      if (showToasts) toast.error(t('practicum.fillRequiredFields'));
      return false;
    }

    // lisäehdot
    if (courseExists) {
      if (showToasts) toast.error(t('worklog.form.errors.codeExists'));
      return false;
    }
    if (hasDateOrderError) {
      if (showToasts) toast.error(t('worklog.form.endDateError'));
      return false;
    }
    if (requiredHours <= 0) {
      if (showToasts) toast.error(t('worklog.form.requiredHoursError'));
      return false;
    }

    return true;
  };

  const validateFields = () => {
    switch (currentStep) {
      case 1:
        // step1-validointi hoidetaan validateStep1:ssä
        return validateStep1(false);
      case 2:
        return studentList.length > 0;
      case 3:
        return (
          instructors.length > 0 &&
          instructors.every((instructor) => instructor.email)
        );
      default:
        return false;
    }
  };

  const incrementStep = () => {
    if (currentStep === 1) {
      // näytetään virheet käyttäjälle
      const ok = validateStep1(true);
      if (!ok) return;
      setCurrentStep((prev) => prev + 1);
      return;
    }

    if (
      currentStep === 3 &&
      !instructors.every((instructor) => instructor.exists)
    ) {
      // tälle ei näkynyt valmista avainta teacherissä -> käytetään geneeristä
      toast.error(t('worklog.errors.createFailed'));
      return;
    }

    if (!validateFields()) {
      toast.error(t('practicum.fillRequiredFields'));
      return;
    }

    setCurrentStep((prev) => prev + 1);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // varmistus: jos submit painetaan suoraan step1:stä (tai joku kiertää napit)
    if (!validateStep1(true)) return;

    try {
      const email = user?.email ?? '';

      const worklogCourse = {
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

      const token = localStorage.getItem('userToken');
      if (!token) {
        toast.error(t('toasts.error.tokenMissing'));
        return;
      }

      const response = await apiHooks.createWorkLogCourse(worklogCourse, token);

      if (response?.insertId) {
        toast.success(t('worklog.success.courseCreated'));
        navigate(`/teacher/worklog/${response.insertId}`);
      } else {
        toast.error(t('worklog.errors.createFailed'));
      }
    } catch (error) {
      toast.error(t('worklog.errors.createFailed'));
      console.error(error);
    }
  };

  const handleSubmitWrapper = async () => {
    await handleSubmit({} as React.FormEvent);
  };

  useEffect(() => {
    const email = user?.email ?? '';
    setInstructorEmail(email);

    if (email) {
      setInstructors([{email, exists: true}]);
    }
  }, [user]);

  return (
    <div className="w-full">
      <ProgressRibbon currentStep={currentStep} totalSteps={3} />

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-[900px] mx-auto bg-white p-6 rounded-xl shadow-md"
      >
        {currentStep === 1 && (
          <div className="mb-4">
            <h2 className="text-lg font-heading text-gray-800">
              {t('worklog.custom.header.title')}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {t('worklog.custom.header.subtitle')}
            </p>
          </div>
        )}

        {currentStep === 1 && (
          <div className="w-full max-w-[600px] mx-auto">
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
          </div>
        )}

        {currentStep === 2 && (
          <StudentList
            studentList={studentList}
            setStudentList={setStudentList}
          />
        )}

        {currentStep === 3 && (
          <div className="w-full max-w-[600px] mx-auto">
            <AddTeachers
              instructors={instructors}
              setInstructors={setInstructors}
              instructorEmail={instructorEmail}
            />
          </div>
        )}

        <StepButtons
          currentStep={currentStep}
          onPrevClick={() => setCurrentStep((prev) => prev - 1)}
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
