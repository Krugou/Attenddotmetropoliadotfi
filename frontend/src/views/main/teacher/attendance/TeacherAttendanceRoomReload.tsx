import React, {useEffect} from 'react';
import {useNavigate, useParams} from 'react-router-dom';

/**
 * `TeacherAttendanceRoomReload` is a React component that navigates to a new route
 * when it's loaded. The new route includes the `lectureid` from the current URL.
 *
 * @returns {null} This component does not render anything.
 */
const TeacherAttendanceRoomReload: React.FC = () => {
  /**
   * `lectureid` is a parameter from the current URL.
   */
  const {lectureid} = useParams<{lectureid: string}>();

  /**
   * `navigate` is a function from `react-router-dom` that allows navigation to different routes.
   */
  const navigate = useNavigate();

  /**
   * `useEffect` hook is used to perform side effects in function components.
   * In this case, it's used to navigate to a new route when the component is loaded.
   */
  useEffect(() => {
    navigate(`/teacher/attendance/${lectureid}`);
  }, [lectureid, navigate]);

  return null; // or return some JSX if needed
};

export default TeacherAttendanceRoomReload;
