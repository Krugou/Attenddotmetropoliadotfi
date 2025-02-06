import {CircularProgress} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import React, {useContext, useEffect, useRef, useState} from 'react';
import QRCode from 'react-qr-code';
import {useNavigate, useParams} from 'react-router-dom';
import {toast} from 'react-toastify';
import io, {Socket} from 'socket.io-client';
import Attendees from '../../../../components/main/course/attendance/Attendees';
import CourseStudents from '../../../../components/main/course/attendance/CourseStudents';
import AttendanceSettings from '../../../../components/main/modals/AttendanceSettings';
import ConfirmDialog from '../../../../components/main/modals/ConfirmDialog';
import {UserContext} from '../../../../contexts/UserContext';
import apiHooks from '../../../../api';
import {API_CONFIG} from '../../../../config';

const baseUrl = API_CONFIG.baseUrl;
/**
 * AttendanceRoom component.
 * This component is responsible for managing the attendance room for a lecture.
 * It handles the socket connections, fetches the lecture info, and manages the countdown for the lecture.
 * It also displays the QR code for the lecture, the list of attendees, and the list of students in the course.
 * @component
 */
interface Student {
  studentnumber: string;
  first_name: string;
  last_name: string;
  userid: number;
}
const AttendanceRoom: React.FC = () => {
  const navigate = useNavigate();
  const {user} = useContext(UserContext);
  const {lectureid} = useParams<{lectureid: string}>();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [arrayOfStudents, setArrayOfStudents] = useState<Student[]>([]);
  const [courseStudents, setCourseStudents] = useState<Student[]>([]);
  const [countdown, setCountdown] = useState<null | number>(null);
  const [courseName, setCourseName] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [topicname, setTopicname] = useState('');
  const [loading, setLoading] = useState(true);
  const [hashValue, setHashValue] = useState('');
  const [courseId, setCourseId] = useState('');
  const [dataLoaded, setDataLoaded] = useState(false);
  const [hashDataReceived, setHashDataReceived] = useState(false);
  const toastDisplayed = useRef(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isAnimationStopped, setIsAnimationStopped] = useState(true);
  const [latency, setLatency] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [lectureSuccess, setLectureSuccess] = useState(false);
  const [scrollTabToggle, setScrollTabToggle] = useState(false);
  const [widerNamesToggle, setWiderNamesToggle] = useState(false);
  const [hideQR, setHideQR] = useState(false);
  /**
   * useEffect hook for fetching lecture info.
   * This hook is run when the component mounts and whenever the lectureid changes.
   * It fetches the lecture info from the API and sets the course code, course name, and topic name.
   * It also handles any errors that may occur during the fetch.
   */
  useEffect(() => {
    // Check if user information is available
    if (!user) {
      // If not, display an error message and exit the function
      toast.error('No user information available');
      navigate('/');
      return;
    }

    // Check if a lecture ID is provided
    if (!lectureid) {
      // If not, display an error message and exit the function
      toast.error('No lecture ID provided');
      return;
    }

    // Retrieve the user token from local storage
    const token: string | null = localStorage.getItem('userToken');

    // Check if the token is available
    if (!token) {
      // If not, display an error message and exit the function
      toast.error('No token available');
      return;
    }

    // Call the API to get the lecture info
    apiHooks
      .getLectureInfo(lectureid, token)
      .then((info) => {
        setCourseId(info.courseid);
        // Check if the lecture is already closed
        if (info.state === 'closed') {
          // If so, display an error message, navigate to the main view, and exit the function
          toast.error('Lecture is already closed');
          navigate('/teacher/mainview');
          return;
        }
        // Set the course code, course name, and topic name from the lecture info
        setCourseCode(info.code);
        setCourseName(info.name);
        setTopicname(info.topicname);
        // Display a success message
        if (!toastDisplayed.current) {
          toast.success('Lecture info retrieved successfully');
          toastDisplayed.current = true;
        }

        // Set loading to false when the data fetch is done
        setDataLoaded(true);
      })
      .catch((error) => {
        // Log the error and display an error message
        console.error('Error getting lecture info:', error);
        toast.error('Error getting lecture info');

        // Set loading to false even if there was an error
        setLoading(false);
      });
    if (!socket) {
      // Determine the socket URL and path based on the environment

      const socketURL =
        import.meta.env.MODE === 'development' ? 'http://localhost:3002' : '/';
      const socketPath =
        import.meta.env.MODE === 'development' ? '' : '/api/socket.io';
      const token: string | null = localStorage.getItem('userToken');
      if (!token) {
        throw new Error('No token available');
      }
      const newSocket = io(socketURL, {
        path: socketPath,
        transports: ['websocket'],
        auth: {
          token: `${token}`,
          userId: `${user.userid}`,
        },
      });
      // Set the socket state
      setSocket(newSocket);
      // Log when the socket is connected
      newSocket.on('connect', () => {
        console.log('Socket connected');
      });
      // Emit a 'createAttendanceCollection' event with the lectureid
      newSocket.emit('createAttendanceCollection', lectureid, () => {
        console.log('createAttendanceCollection');
      });
      // When the lecture starts, set the countdown
      newSocket.on('lectureStarted', (checklectureid, timeout) => {
        if (checklectureid === lectureid) {
          setCountdown(timeout / 1000); // convert milliseconds to seconds
          setLoading(false);
        }
      });

      // When receiving the list of all students in the lecture, update the state
      newSocket.on('getAllStudentsInLecture', (courseStudents) => {
        setCourseStudents(courseStudents);
      });
      // When the list of students in the course is updated, update the state
      newSocket.on('updateCourseStudents', (courseStudents) => {
        setCourseStudents(courseStudents);
      });
      newSocket.on('updateAttendees', (arrayOfStudents) => {
        setArrayOfStudents(arrayOfStudents);
      });
      // When the attendance collection data is updated, update the state
      newSocket.on(
        'updateAttendanceCollectionData',
        (hash, lectureid, arrayOfStudents, courseStudents) => {
          const newBaseUrl = baseUrl.replace('/api/', '/');
          setHashDataReceived(true);
          setHashValue(newBaseUrl + '#' + hash + '#' + lectureid);
          setArrayOfStudents(arrayOfStudents);
          setCourseStudents(courseStudents);
        },
      );
      // When a student is inserted manually, display a success message
      newSocket.on('manualStudentInsertSuccess', (receivedLectureId) => {
        if (receivedLectureId === lectureid) {
          toast.success('Student inserted successfully');
        }
      });
      // When a student is inserted manually, display an error message
      newSocket.on('manualStudentInsertError', (receivedLectureId) => {
        if (receivedLectureId === lectureid) {
          toast.error('Error inserting student');
        }
      });
      // When a student is inserted manually, display an error message if the student number is empty
      newSocket.on('manualStudentInsertFailedEmpty', (receivedLectureId) => {
        if (receivedLectureId === lectureid) {
          toast.error('Student number is empty');
        }
      });
      newSocket.on('manualStudentRemoveFailedEmpty', (receivedLectureId) => {
        if (receivedLectureId === lectureid) {
          toast.error('Student number is empty');
        }
      });
      newSocket.on('manualStudentRemoveSuccess', (receivedLectureId) => {
        if (receivedLectureId === lectureid) {
          toast.success('Student removed successfully');
        }
      });
      newSocket.on('manualStudentRemoveError', (receivedLectureId) => {
        if (receivedLectureId === lectureid) {
          toast.error('Error removing student');
        }
      });
      newSocket.on('pingEvent', (lectureid) => {
        newSocket.emit('pongEvent', lectureid, Date.now());
      });
      newSocket.on('pongEvent', (receivedLectureId, latency) => {
        if (receivedLectureId === lectureid) {
          latency = Date.now() - latency;
          setLatency(latency);
        }
      });
      // When a student is inserted manually, display an error message if the student number is invalid
      newSocket.on('disconnect', () => {
        console.log('Disconnected from the server');
      });
      // When the lecture is canceled, display a success message and navigate to the main view
      newSocket.on('lectureCanceledSuccess', (receivedLectureId) => {
        if (lectureid === receivedLectureId) {
          toast.success('Lecture canceled successfully');
          navigate('/teacher/mainview');
        }
      });
    }
  }, [lectureid, user]);

  /**
   * useEffect hook for disconnecting the socket when the component unmounts.
   * This hook is run when the component mounts and whenever the socket changes.
   * It returns a cleanup function that disconnects the socket when the component unmounts.
   */
  useEffect(() => {
    // Return a cleanup function
    return () => {
      // If the socket is defined
      if (socket) {
        // Disconnect the socket when the component unmounts
        socket.disconnect();
      }
    };
  }, [socket]); // This effect depends on the socket variable

  useEffect(() => {
    if (dataLoaded) {
      // Only start listening for the event if data has been loaded
      if (socket) {
        // When the lecture is finished, display a success message and navigate to the attendance view
        socket.on('lectureFinished', (checklectureid) => {
          console.log('lectureFinished');
          if (checklectureid === lectureid) {
            toast.success('Lecture finished');
            if (courseId) {
              navigate(`/teacher/courses/attendances/${courseId}`);
            } else {
              console.error('courseId is not set');
            }
          }
        });
      }
    }
  }, [dataLoaded]);
  /**
   * Function to handle the 'Finish Lecture' button click.
   * This function emits a 'lecturefinishedwithbutton' event with the lectureid.
   */
  const handleLectureFinished = () => {
    // Check if the socket is connected
    if (!socket) {
      // If the socket is not connected, display an error message and exit the function
      toast.error('Socket is not connected');
      return;
    }

    // If the socket is connected, emit a 'lecturefinishedwithbutton' event with the lectureid
    socket.emit('lectureFinishedWithButton', lectureid);
  };

  /**
   *  Function to handle the 'Cancel Lecture' button click.
   * This function emits a 'lecturecanceled' event with the lectureid.
   */

  const handleLectureCanceled = () => {
    setConfirmOpen(false);

    if (!socket) {
      // If the socket is not connected, display an error message and exit the function
      toast.error('Socket is not connected');
      return;
    }

    socket.emit('lectureCanceled', lectureid);
  };

  /**
   * useEffect hook for managing the countdown.
   * This hook is run when the component mounts and whenever the countdown changes.
   * It starts a timer that decreases the countdown by 1 every second if the countdown is greater than 0.
   * It returns a cleanup function that clears the timer when the component unmounts.
   */
  useEffect(() => {
    // Declare a variable to hold the ID of the timer
    let intervalId;

    // If countdown is not null and is greater than 0
    if (countdown !== null && countdown > 0) {
      // Start a timer that decreases the countdown by 1 every second
      intervalId = setInterval(() => {
        setCountdown(countdown - 1);
      }, 1000);
    }

    // Return a cleanup function that clears the timer when the component unmounts
    return () => {
      // If the timer ID is defined, clear the timer
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [countdown]); // This effect depends on the countdown variable

  return (
    <div className='w-full'>
      {loading ? (
        <CircularProgress />
      ) : (
        <div
          className={`flex flex-col m-auto w-full xl:w-full 2xl:w-3/4 h-full p-5 bg-gray-100 ${
            lectureSuccess ? 'border-metropoliaTrendGreen border-2' : ''
          }`}>
          <div className='flex flex-col items-center justify-between sm:flex-row'>
            <h1 className='text-2xl font-heading'>
              {courseName} | {courseCode} | {topicname} |
              {lectureSuccess
                ? ' All students are here! '
                : countdown !== null
                ? ` Auto finishing in ${Math.floor(countdown / 60)} minutes ${
                    countdown % 60
                  } seconds `
                : 'Loading...'}
            </h1>
            <div className='flex flex-row justify-end'>
              <button
                className='bg-metropoliaSupportRed sm:w-fit h-[4em] transition  p-2 m-2 text-md w-full hover:bg-red-500 text-white rounded'
                onClick={() => {
                  navigate(`/teacher/attendance/reload/${lectureid}`);
                }}
                title={'Reset timer'}>
                Reset timer
              </button>
              {latency !== null && latency !== undefined && (
                <button
                  className={`flex items-center justify-center p-2 m-2 text-white rounded transition-colors h-[4em] w-[4em] ${
                    latency < 100
                      ? 'bg-metropoliaTrendGreen hover:bg-green-600'
                      : latency < 300
                      ? 'bg-yellow-500 hover:bg-yellow-600'
                      : 'bg-metropoliaSupportRed hover:bg-red-600'
                  }`}
                  title={`Connection latency: ${latency}ms`}
                  onClick={() => setDialogOpen(true)}>
                  <SettingsIcon />
                </button>
              )}
            </div>
          </div>
          <div className='flex flex-col-reverse items-start justify-between sm:flex-row'>
            <div className='flex flex-col-reverse items-center w-full sm:flex-row'>
              {!hideQR && (
                <div className='relative w-full'>
                  {!hashDataReceived ? (
                    <div className='flex items-center justify-center w-full h-full'>
                      <CircularProgress />
                    </div>
                  ) : (
                    <QRCode
                      size={256}
                      value={hashValue}
                      viewBox={`0 0 256 256`}
                      className='w-full 2xl:w-[50em] sm:w-[20em] lg:w-full border-8 border-white h-full'
                      level='L'
                    />
                  )}
                </div>
              )}
              <Attendees
                arrayOfStudents={arrayOfStudents}
                socket={socket}
                lectureid={lectureid || ''}
                widerNamesToggle={widerNamesToggle}
              />
            </div>
            <h2
              className='p-2 ml-2 text-2xl border-4 shadow-xl border-metropoliaMainOrange rounded-xl'
              title={`${arrayOfStudents.length} Attended, ${
                courseStudents.length
              } Not attended, Total: ${
                arrayOfStudents.length + courseStudents.length
              }`}>
              <label className='text-metropoliaTrendGreen'>
                {arrayOfStudents.length}
              </label>
              /
              <label className='text-metropoliaSupportRed'>
                {courseStudents.length}
              </label>{' '}
            </h2>
          </div>
          <div className='flex flex-col items-center justify-end gap-5 sm:flex-row-reverse'>
            <button
              className='w-full p-2 mt-4 text-sm text-white transition rounded font-heading bg-metropoliaSupportRed sm:w-fit h-fit hover:bg-red-500'
              onClick={() => setConfirmOpen(true)}
              title='Delete this lecture'>
              Cancel Lecture
            </button>
            <button
              onClick={handleLectureFinished}
              className='w-full p-2 mt-4 text-sm text-white transition rounded font-heading bg-metropoliaMainOrange sm:w-fit h-fit hover:bg-metropoliaSecondaryOrange'
              title='Finish Lecture and set rest of bottom list of students to not attended'>
              Finish Lecture
            </button>
            <ConfirmDialog
              title='Cancel Lecture'
              open={confirmOpen}
              setOpen={setConfirmOpen}
              onConfirm={handleLectureCanceled}>
              Are you sure you want to cancel the lecture? This will delete the
              lecture from the database. This action cannot be undone.
            </ConfirmDialog>
            {lectureid && (
              <CourseStudents
                coursestudents={courseStudents}
                socket={socket}
                lectureid={lectureid}
                isAnimationStopped={isAnimationStopped}
                setLectureSuccess={setLectureSuccess}
                loading={loading}
                scrollTabToggle={scrollTabToggle}
                widerNamesToggle={widerNamesToggle}
              />
            )}
            {dialogOpen && (
              <AttendanceSettings
                dialogOpen={dialogOpen}
                setDialogOpen={setDialogOpen}
                setIsAnimationStopped={setIsAnimationStopped}
                setScrollTabToggle={setScrollTabToggle}
                setWiderNamesToggle={setWiderNamesToggle}
                setHideQR={setHideQR}
                latency={latency}
                stopAnimation={isAnimationStopped}
                enableScroll={scrollTabToggle}
                widerNames={widerNamesToggle}
                hideQR={hideQR}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceRoom;
