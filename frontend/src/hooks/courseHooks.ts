import {useEffect, useState} from 'react';
import apiHooks from '../api';
/**
 * useCourses hook.
 * This hook is responsible for fetching and managing the state of courses and attendance threshold.
 * It uses the useState and useEffect hooks from React to accomplish this.
 * The courses and threshold are stored in state variables, and are updated when the hook fetches the data from the API.
 * The hook returns an object containing the courses and threshold.
 *
 * @returns {Object} The courses and threshold.
 */
export const useCourses = () => {
  const [courses, setCourses] = useState([]);
  const [threshold, setThreshold] = useState<number | null>(null); // Add this line

  useEffect(() => {
    /**
     * Fetches all courses from the API and updates the courses state variable.
     */
    const fetchCourses = async () => {
      try {
        const token: string | null = localStorage.getItem('userToken');
        if (!token) {
          throw new Error('No token available');
        }
        const response = await apiHooks.getAllCourses(token);
        setCourses(response);
      } catch (error) {
        console.error('Error fetching courses');
      }
    };
    /**
     * Fetches the attendance threshold from the API and updates the threshold state variable.
     */
    const getThreshold = async () => {
      try {
        const token: string | null = localStorage.getItem('userToken');
        if (!token) {
          throw new Error('No token available');
        }
        const response = await apiHooks.getAttendanceThreshold(token);
        console.log(response, 'thresholdresponse');
        setThreshold(response.attendancethreshold);
      } catch (error) {
        console.log(error);
      }
    };
    getThreshold();
    fetchCourses();
  }, []);

  return {courses, threshold}; // Return threshold along with courses
};
