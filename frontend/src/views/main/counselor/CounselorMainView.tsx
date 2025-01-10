import React from 'react';
import Card from '../../../components/main/cards/Card';
import FeedbackCard from '../../../components/main/cards/FeedbackCard';
import MainViewTitle from '../../../components/main/titles/MainViewTitle';
import {
  People,
  Help,
  Assessment,
  PersonAdd,
} from '@mui/icons-material';

/**
 * CounselorMainView component.
 * This component is responsible for rendering the main view for counselors.
 * It renders a MainViewTitle component and a grid of Card components.
 * Each Card component represents a different functionality available to counselors.
 *
 * @returns {JSX.Element} The rendered CounselorMainView component.
 */
const CounselorMainView: React.FC = () => {
  return (
    <>
      <MainViewTitle role={'Counselor'} />
      <div className='grid grid-cols-1 gap-4 p-5 ml-auto mr-auto sm:grid-cols-2 lg:grid-cols-3 w-fit'>
        <Card
          path='/counselor/students'
          title='Students'
          description='Manage any student'
          icon={People}
        />

        <Card
          path='/counselor/helpvideos'
          title='Instructions'
          description='See instructions for all available tasks'
          icon={Help}
        />
        <Card
          path='/counselor/courses/stats'
          title='Attendance statistics'
          description='See attendance statistics for all courses'
          icon={Assessment}
        />
        <Card
          path='/counselor/lateenrollment'
          title='Late Enrollment'
          description='Enroll students in courses'
          icon={PersonAdd}
        />
        <FeedbackCard role='counselor' />
      </div>
    </>
  );
};

export default CounselorMainView;
