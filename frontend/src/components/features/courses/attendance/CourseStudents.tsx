import React, { useEffect, useRef, useState } from 'react';
import { Socket } from 'socket.io-client';
import { useTranslation } from 'react-i18next';
import SkeletonLoader from '../../../ui/SkeletonLoader.tsx';
import ConfirmDialog from '../../../ui/modals/ConfirmDialog.tsx';

// Define the props for the CourseStudents component
interface Props {
  coursestudents: {
    first_name: string;
    last_name: string;
    userid: number;
    studentnumber: string;
  }[];
  socket: Socket | null;
  lectureid: string;
  isAnimationStopped: boolean;
  setLectureSuccess: React.Dispatch<React.SetStateAction<boolean>>;
  lectureSuccess: boolean;
  loading: boolean;
  scrollTabToggle: boolean;
  widerNamesToggle: boolean;
}

/**
 * CourseStudents component.
 *
 * @param {Object} props - The props for the component.
 * @param {Array} props.coursestudents - The students in the course.
 * @param {Socket | null} props.socket - The socket connection.
 * @param {string} props.lectureid - The ID of the lecture.
 * @returns {React.FC<Props>} The CourseStudents component.
 */
const CourseStudents: React.FC<Props> = ({
                                           coursestudents,
                                           socket,
                                           lectureid,
                                           isAnimationStopped,
                                           setLectureSuccess,
                                           lectureSuccess,
                                           loading,
                                           scrollTabToggle,
                                           widerNamesToggle,
                                         }) => {
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  // Define state and refs const
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const scrollPositionRef = useRef<number>(0);
  const [bounceGroup, setBounceGroup] = useState<number | null>(0);
  const lastItemRef = useRef<HTMLParagraphElement | null>(null);
  const firstItemRef = useRef<HTMLParagraphElement | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [startX, setStartX] = useState<number>(0);
  const [scrollLeft, setScrollLeft] = useState<number>(0);
  const [remainingTime, setRemainingTime] = useState<number>(60);
  const scrollInterval = useRef<number | null>(null);
  const scrollDirectionRef = useRef(1);
  const { t } = useTranslation('teacher');

  // New: menu choosing status
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<{
    first_name: string;
    last_name: string;
    userid: number;
    studentnumber: string;
  } | null>(null);

  // Key fix: only trigger success when coursestudents transitions from >0 to 0
  const prevLenRef = useRef<number | null>(null);

  // Reset UI + guards when lecture changes
  useEffect(() => {
    prevLenRef.current = null;
    setLectureSuccess(false);
    setShowSuccessModal(false);
    setShowStatusMenu(false);
    setSelectedStudent(null);
    setRemainingTime(60);
  }, [lectureid, setLectureSuccess]);

  // Use an effect hook to handle countdown and lecture finish
  useEffect(() => {
    let timerId: number | undefined;

    if (!loading && coursestudents.length === 0 && lectureSuccess && remainingTime > 0) {
      timerId = window.setInterval(() => {
        setRemainingTime((prevTime) => prevTime - 1);
      }, 1000);
    } else if (!loading && coursestudents.length === 0 && lectureSuccess && remainingTime === 0) {
      if (socket) {
        socket.emit('lectureFinishedWithButton', lectureid);
      }
      setRemainingTime(5);
    }

    return () => {
      if (timerId) {
        clearInterval(timerId);
      }
    };
  }, [coursestudents, remainingTime, socket, lectureid, loading, lectureSuccess]);

  // Function to handle the mouse down event
  const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (scrollContainerRef.current) {
      setIsDragging(true);
      setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
      setScrollLeft(scrollContainerRef.current.scrollLeft);
    }
  };

  // Function to handle the mouse end event
  const onMouseEnd = () => {
    setIsDragging(false);
  };

  // Use an effect hook to handle bounce group changes
  useEffect(() => {
    const interval = window.setInterval(() => {
      setBounceGroup((prevGroup) =>
        prevGroup !== null ? (prevGroup + 1) % 2 : 0,
      );
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Function to handle mouse move event
  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !scrollContainerRef.current) return;

    e.preventDefault();

    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  // Function to make the scroll container scroll slowly
  const scrollSlowly = () => {
    if (isAnimationStopped) return;
    const element = scrollContainerRef.current;
    if (!element) return;

    scrollInterval.current = window.setInterval(() => {
      if (
        scrollPositionRef.current >=
        element.scrollWidth - element.clientWidth
      ) {
        scrollDirectionRef.current = -1;
      } else if (scrollPositionRef.current <= 0) {
        scrollDirectionRef.current = 1;
      }
      scrollPositionRef.current += scrollDirectionRef.current;
      element.scrollLeft = scrollPositionRef.current;
    }, 90);
  };

  // Effect hook to start the slow scroll when the component mounts
  useEffect(() => {
    if (!isAnimationStopped) {
      scrollSlowly();
    }
    return () => {
      if (scrollInterval.current !== null) {
        clearInterval(scrollInterval.current);
      }
    };
  }, [coursestudents, isAnimationStopped]);

  // Success logic: trigger ONLY on transition from >0 to 0 (prevents initial empty flash)
  useEffect(() => {
    if (loading) return;

    const currentLen = coursestudents.length;

    // initialize prevLen on first non-loading run
    if (prevLenRef.current === null) {
      prevLenRef.current = currentLen;

      // Also keep UI consistent on initial load
      if (currentLen > 0) {
        setLectureSuccess(false);
        setShowSuccessModal(false);
      }
      return;
    }

    const prevLen = prevLenRef.current;
    prevLenRef.current = currentLen;


    if (prevLen > 0 && currentLen === 0) {
      setLectureSuccess(true);
      setShowSuccessModal(true);
      return;
    }

    if (currentLen > 0) {
      setLectureSuccess(false);
      setShowSuccessModal(false);
    }
  }, [coursestudents, loading, setLectureSuccess]);

  const handleFinishNow = () => {
    if (socket) {
      socket.emit('lectureFinishedWithButton', lectureid);
    }
    setShowSuccessModal(false);
  };

  //Clicking student's name opens menu with options to mark student as present or excused.
  const handleStudentClick = (student: {
    first_name: string;
    last_name: string;
    userid: number;
    studentnumber: string;
  }) => {
    setSelectedStudent(student);
    setShowStatusMenu(true);
  };

  // sends socket status (1=present, 2=excused)
  const handleSetStatus = (status: number) => {
    if (socket && selectedStudent) {
      console.log('emit manualStudentInsert', {
        lectureid,
        asNumber: Number(lectureid),
        studentnumber: selectedStudent.studentnumber,
        status,
      });
      socket.emit(
        'manualStudentInsert',
        selectedStudent.studentnumber,
        Number(lectureid),
        status,
      );
      console.log('emitistä poistuttu');
    }
    setShowStatusMenu(false);
    setSelectedStudent(null);
  };

  return (
    <>
      <div
        ref={scrollContainerRef}
        onScroll={() => {
          if (scrollContainerRef.current) {
            scrollPositionRef.current = scrollContainerRef.current.scrollLeft;
          }
        }}
        onMouseDown={onMouseDown}
        onMouseLeave={() => {
          onMouseEnd();
          setBounceGroup((prevGroup) =>
            prevGroup !== null ? (prevGroup + 1) % 2 : 0,
          );
        }}
        onMouseUp={onMouseEnd}
        onMouseMove={onMouseMove}
        onMouseEnter={() => {
          if (scrollInterval.current !== null) {
            clearInterval(scrollInterval.current);
          }
          if (scrollContainerRef.current) {
            scrollPositionRef.current = scrollContainerRef.current.scrollLeft;
          }
          setBounceGroup(null);
        }}
        className={`noSelect ${
          scrollTabToggle ? '' : 'hideScrollbar'
        }  flex  border-2 border-metropolia-support-red ${
          coursestudents.length > 10 ? 'justify-start' : 'justify-center'
        } bg-white p-3 rounded-lg shadow-md w-full mt-4 overflow-hidden overflow-x-auto`}>
        {loading ? (
          <div className='flex gap-2 w-full'>
            <SkeletonLoader
              count={5}
              className='mx-2'
              width='120px'
              height='40px'
            />
          </div>
        ) : coursestudents.length === 0 && lectureSuccess ? (
          <p className=''>
            {remainingTime > 0
              ? t('teacher:courseStudents.allStudentsHere', {
                seconds: remainingTime,
              })
              : t('teacher:courseStudents.finishingLecture')}
          </p>
        ) : (
          <div className='whitespace-nowrap'>
            {coursestudents.map((student, index) => {
              const formattedName = widerNamesToggle
                ? `${student.first_name} ${student.last_name}`
                : `${student.first_name} ${student.last_name.charAt(0)}.`;

              const isBouncing =
                !isAnimationStopped && index % 2 === bounceGroup;
              const isFirst = index === 0;
              const isLast = index === coursestudents.length - 1;
              const bgColorClass = isFirst
                ? 'bg-metropolia-support-red'
                : isLast
                  ? 'bg-metropolia-trend-green'
                  : index % 2 === 0
                    ? 'bg-metropolia-main-orange'
                    : 'bg-metropolia-main-grey';
              const shapeClass = isFirst
                ? 'rounded-l-lg rounded-r-none'
                : isLast
                  ? 'rounded-r-lg rounded-l-none'
                  : 'rounded';
              return (
                <p
                  ref={isFirst ? firstItemRef : isLast ? lastItemRef : null}
                  key={student.userid}
                  className={`inline-block cursor-pointer p-2 m-2 text-white text-xs sm:text-sm md:text-md lg:text-lg xl:text-xl 2xl:text-2xl font-semibold ${bgColorClass} ${shapeClass} ${
                    isBouncing ? 'motion-safe:animate-bounce' : ''
                  }`}
                  title={`${student.first_name} ${student.last_name}`}
                  onClick={() => handleStudentClick(student)}>
                  {formattedName}
                </p>
              );
            })}
          </div>
        )}
      </div>

      {}
      {showStatusMenu && selectedStudent && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40'>
          <div className='bg-white rounded-lg shadow-xl p-4 max-w-sm w-full'>
            <h3 className='text-lg font-semibold mb-2'>
              {t(
                'teacher:courseStudents.chooseStatus',
                'Valitse tila opiskelijalle',
              )}
            </h3>
            <p className='mb-4'>
              {selectedStudent.first_name} {selectedStudent.last_name}
            </p>
            <div className='flex flex-col gap-2 sm:flex-row'>
              <button
                className='flex-1 px-3 py-2 rounded-md bg-metropolia-trend-green text-white font-semibold hover:bg-green-600 transition'
                onClick={() => handleSetStatus(1)}>
                {t('teacher:courseStudents.markPresent', 'Merkitse paikalla')}
              </button>
              <button
                className='flex-1 px-3 py-2 rounded-md bg-metropolia-support-blue text-white font-semibold hover:bg-blue-600 transition'
                onClick={() => handleSetStatus(2)}>
                {t(
                  'teacher:courseStudents.markExcused',
                  'Hyväksytty poissaolo',
                )}
              </button>
            </div>
            <button
              className='mt-3 w-full px-3 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 transition text-sm'
              onClick={() => {
                setShowStatusMenu(false);
                setSelectedStudent(null);
              }}>
              {t('teacher:courseStudents.cancel', 'Peruuta')}
            </button>
          </div>
        </div>
      )}

      <ConfirmDialog
        title={t('teacher:attendance.dialogs.success.title')}
        open={showSuccessModal}
        setOpen={setShowSuccessModal}
        onConfirm={handleFinishNow}
        confirmText={t('teacher:attendance.buttons.finishNow')}
        cancelText={t('teacher:attendance.buttons.waitForTimer')}>
        <div className='text-center'>
          <p className='mb-4 text-xl text-metropolia-trend-green font-semibold'>
            {t('teacher:attendance.dialogs.success.allPresent')}
          </p>
          <p>
            {remainingTime > 0
              ? t('teacher:attendance.dialogs.success.options', {
                seconds: remainingTime,
              })
              : t('teacher:attendance.dialogs.success.finishing')}
          </p>
        </div>
      </ConfirmDialog>
    </>
  );
};

export default CourseStudents;
