import React, {useContext, useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import {toast} from 'react-toastify';
import {UserContext} from '../../../contexts/UserContext';
import {createPracticumCourse, assignStudentToPracticum} from '../../../api/practicum';
import PracticumDetailsStep from './PracticumDetailsStep';
import AddStudent, {Student} from './AddStudent';
import AddTeachers from '../course/createcourse/AddTeachers';
import {useTranslation} from 'react-i18next';
import PracticumStepButtons from './PracticumStepButtons';
import CheckStudentStep from './CheckStudentStep';

type Instructor = {
  email: string;
  exists?: boolean;
};

const CreatePracticum: React.FC = () => {
  const {user} = useContext(UserContext);
  const navigate = useNavigate();
  const {t} = useTranslation(['teacher']);
  const [currentStep, setCurrentStep] = useState(1);
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [description, setDescription] = useState('');
  const [requiredHours, setRequiredHours] = useState(0);
  const [instructors, setInstructors] = useState<Instructor[]>([{email: ''}]);
  const [instructorEmail, setInstructorEmail] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  useEffect(() => {
    if (user) {
      setInstructorEmail(user.email);
      setInstructors([{email: user.email, exists: true}]);
    }
  }, [user]);


  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const practicumData = {
        name,
        startDate,
        endDate,
        description,
        requiredHours,
        instructors,
        students,
      };

      const token = localStorage.getItem('userToken');
      if (!token) throw new Error('No token available');

      const response = await createPracticumCourse(practicumData, token);
      if (response && students.length > 0 && students[0].userid) {
        try {
          await assignStudentToPracticum(response.insertId, students[0].userid, token);
          toast.success(t('teacher:practicum.studentAssigned'));
        } catch (assignError) {
          toast.warning(t('teacher:practicum.studentAssignmentFailed'));
        }
      }

      if (response) {
        toast.success(t('teacher:practicum.createdSuccessfully'));
        navigate(`/teacher/practicum/${response.insertId}`);
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

  const validateFields = () => {
    switch (currentStep) {
      case 1:
        return selectedStudent !== null;
      case 2:
        if (!name || !startDate || !endDate || !description || requiredHours <= 0) {
          toast.error(t('teacher:practicum.fillRequiredFields'));
          return false;
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        if (end <= start) {
          toast.error(t('teacher:practicum.endDateMustBeAfterStartDate'));
          return false;
        }

        return true;
      case 3:
        return students && students.length > 0;
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

  const incrementStep = () => {
    if (validateFields()) {
      setCurrentStep((prevStep) => prevStep + 1);
    } else {
      toast.error(t('teacher:practicum.fillRequiredFields'));
    }
  };

  return (
    <div className='w-full'>
      <form
        onSubmit={handleSubmit}
        className='w-full md:w-2/3 lg:w-1/2 xl:w-1/3 2xl:w-1/3 mx-auto bg-white p-4 rounded-sm shadow-md'>
        {currentStep === 1 && (
          <CheckStudentStep
            student={selectedStudent}
            setStudent={setSelectedStudent}
          />
        )}
        {currentStep === 2 && (
          <PracticumDetailsStep
            name={name}
            setName={setName}
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
          <AddStudent
            students={students}
            setStudents={setStudents}
          />
        )}
        {currentStep === 4 && (
          <AddTeachers
            instructors={instructors}
            setInstructors={setInstructors}
            instructorEmail={instructorEmail}
          />
        )}
        <PracticumStepButtons
          currentStep={currentStep}
          onPrevClick={() => setCurrentStep((prevStep) => prevStep - 1)}
          onNextClick={incrementStep}
          onSubmitClick={handleSubmitWrapper}
          totalSteps={4}
        />
      </form>
    </div>
  );
};

export default CreatePracticum;
