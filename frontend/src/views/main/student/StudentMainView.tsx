import React from 'react';
import Card from '../../../components/main/cards/Card';
import FeedbackCard from '../../../components/main/cards/FeedbackCard';
import MainViewTitle from '../../../components/main/titles/MainViewTitle';
import {
  QrCode,
  Person,
  School,
  Help,
  PhotoCamera,
} from '@mui/icons-material';

/**
 * MainView component.
 *
 * This component is responsible for rendering the main view for a student. It performs the following operations:
 *
 * 1. Renders a title for the main view using the MainViewTitle component.
 * 2. Renders a grid of cards using the Card component. Each card represents a different feature available to the student:
 *    - Attendance QR Scanner: Allows the student to scan a QR code to mark attendance.
 *    - Your Profile: Allows the student to view their own profile.
 *    - Your Courses: Allows the student to view their own courses.
 *
 * Each card includes a path to the corresponding feature, a title, and a description.
 *
 * @returns A JSX element representing the main view component.
 */
const MainView: React.FC = () => {
  return (
    <div className='w-full'>
      <MainViewTitle role={'Student'} />
      <div className='grid items-center justify-center grid-cols-1 gap-4 p-5 m-auto sm:grid-cols-2 lg:grid-cols-3 w-fit'>
        <Card
          path='/student/qr'
          title='Attendance QR Scanner'
          description='Scan QR to mark attendance'
          icon={QrCode}
        />
        <Card
          path='/student/profile'
          title='Your Profile'
          description='View your own profile'
          icon={Person}
        />
        <Card
          path='/student/courses'
          title='Your Courses'
          description='View your own courses'
          icon={School}
        />
        <Card
          path='/student/helpvideos'
          title='Instructions'
          description='See instructions for all available tasks'
          icon={Help}
        />
        <Card
          path='/student/aqr'
          title='Attendance QR Scanner with Camera Selection'
          description='Scan QR to mark attendance with camera selection'
          icon={PhotoCamera}
        />

        <FeedbackCard role='student' />
      </div>
    </div>
  );
};

export default MainView;
