import React from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';

import { useCourseModifyData } from '../../../../hooks/useCourseModifyData';
import AddTeachers from '../../../../components/features/courses/create/AddTeachers';
import CourseDetails from '../../../../components/features/courses/create/CourseDetails';
import EditTopicsModal from '../../../../components/features/courses/EditTopicsModal.tsx';

/**
 * AdminCourseModify View
 *
 * This component provides an admin interface for modifying course details.
 * It includes form fields for updating course metadata, instructors, and topics.
 * State and logic are abstracted via the `useCourseModifyData` custom hook.
 *
 * @returns JSX.Element
 */

const AdminCourseModify: React.FC = () => {
  const {
    t,
    isLoading,
    courseName,
    setCourseName,
    courseCode,
    setCourseCode,
    studentGroup,
    setStudentGroup,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    instructors,
    setInstructors,
    instructorEmail,
    courseTopics,
    setCourseTopics,
    modifiedTopics,
    handleTopicChange,
    handleDeleteTopic,
    resetData,
    handleSubmit,
    open,
    setOpen,
    newTopic,
    setNewTopic,
    courseExists,
    setCourseExists,
  } = useCourseModifyData();

  if (isLoading) return <div>{t('admin:ui.loading')}</div>;

  return (
    <div className='w-full'>
      <h2 className='mb-6 font-semibold text-center text-gray-800 text-md sm:text-2xl'>
        {t('admin:courses.modify.mainTitle')}
      </h2>

      <form
        onSubmit={(e) => e.preventDefault()}
        className='w-full px-8 pt-6 pb-8 mx-auto mb-4 bg-white shadow-md md:w-2/4 xl:w-1/4 sm:w-2/3 rounded-xl'>
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
          modify={true}
          courseExists={courseExists}
          setCourseExists={setCourseExists}
        />

        <Accordion className='mt-4 mb-4' onClick={(e) => e.stopPropagation()}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            {t('admin:courses.modify.modifyTeachers')}
          </AccordionSummary>
          <AccordionDetails>
            <AddTeachers
              instructors={instructors}
              setInstructors={setInstructors}
              instructorEmail={instructorEmail}
              modify={true}
            />
          </AccordionDetails>
        </Accordion>

        <button
          className='w-full p-4 mt-4 mb-4 text-left bg-white rounded-md shadow-sm focus:outline-hidden focus:shadow-outline'
          onClick={() => setOpen(true)}>
          {t('admin:courses.modify.modifyTopics')}
        </button>

        <EditTopicsModal
          open={open}
          setOpen={setOpen}
          courseName={courseName}
          newTopic={newTopic}
          setNewTopic={setNewTopic}
          courseTopics={courseTopics}
          setCourseTopics={setCourseTopics}
          modifiedTopics={modifiedTopics}
          handleTopicChange={handleTopicChange}
          handleDeleteTopic={handleDeleteTopic}
          resetData={resetData}
        />

        <div className='flex justify-center w-full'>
          <button
            className='w-1/2 px-4 py-2 text-white font-heading bg-metropolia-trend-green hover:bg-green-600 rounded-xl focus:outline-hidden focus:shadow-outline'
            type='button'
            onClick={handleSubmit}>
            {t('admin:courses.finish')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminCourseModify;
