import React, {useEffect, useRef, useState} from 'react';
import {Socket} from 'socket.io-client';
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
  loading,
  scrollTabToggle,
  widerNamesToggle,
}) => {
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

  // Use an effect hook to handle countdown and lecture finish
  useEffect(() => {
    // Declare a variable to hold the ID of the timer
    let timerId;

    // If there are no students in the course and the remaining time is greater than 0
    if (coursestudents.length === 0 && remainingTime > 0) {
      // Start a timer that decreases the remaining time by 1 every second
      timerId = setInterval(() => {
        setRemainingTime((prevTime) => prevTime - 1);
      }, 1000);
    }
    // If the remaining time is 0
    else if (remainingTime === 0) {
      // If the socket is defined, emit a 'lecturefinishedwithbutton' event with the lecture ID
      if (socket) {
        socket.emit('lectureFinishedWithButton', lectureid);
      }
      // Reset the remaining time to 5
      setRemainingTime(5);
    }

    // Return a cleanup function that clears the timer when the component unmounts
    return () => {
      if (timerId) {
        clearInterval(timerId);
      }
    };
  }, [coursestudents, remainingTime, socket, lectureid]); // This effect depends on the coursestudents, remainingTime, socket, and lectureid variables

  // Function to handle the mouse down event
  const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Check if scrollContainerRef is defined
    if (scrollContainerRef.current) {
      // If the user presses the mouse button, set the isDragging state to true
      setIsDragging(true);

      // Calculate the initial X position of the mouse when the button is pressed
      // Subtract the left offset of the scroll container to get the position relative to the container
      setStartX(e.pageX - scrollContainerRef.current.offsetLeft);

      // Store the current scroll position of the scroll container
      setScrollLeft(scrollContainerRef.current.scrollLeft);
    }
  };

  // Function to handle the mouse end event
  const onMouseEnd = () => {
    // When the mouse button is released, set the isDragging state to false
    setIsDragging(false);
  };

  // Use an effect hook to handle bounce group changes
  useEffect(() => {
    // Set an interval to change the bounce group every 4 seconds
    const interval = window.setInterval(() => {
      // Update the bounce group state
      // If the previous group is not null, increment it by 1 and take the remainder when divided by 2
      // This ensures that the bounce group alternates between 0 and 1
      // If the previous group is null, set it to 0
      setBounceGroup((prevGroup) =>
        prevGroup !== null ? (prevGroup + 1) % 2 : 0,
      );
    }, 4000); // Change every 4 seconds

    // Return a cleanup function that clears the interval when the component unmounts
    return () => clearInterval(interval);
  }, []); // Empty dependency array means this effect runs once on mount and cleanup on unmount

  // Function to handle mouse move event
  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    // If not dragging or scrollContainerRef is not set, exit the function
    if (!isDragging || !scrollContainerRef.current) return;

    // Prevent the default event behavior
    e.preventDefault();

    // Calculate the new x position of the mouse
    const x = e.pageX - scrollContainerRef.current.offsetLeft;

    // Calculate the distance the mouse has moved (walk)
    // Multiply by 3 to increase the speed of the scroll (scroll-fast)
    const walk = (x - startX) * 3;

    // Update the scroll position of the scroll container
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  // Function to make the scroll container scroll slowly
  const scrollSlowly = () => {
    if (isAnimationStopped) return;
    const element = scrollContainerRef.current;
    if (!element) return;
    // Set an interval to continuously scroll the container
    scrollInterval.current = window.setInterval(() => {
      // If we've reached the right end of the container, change direction to left
      if (
        scrollPositionRef.current >=
        element.scrollWidth - element.clientWidth
      ) {
        scrollDirectionRef.current = -1;
      }
      // If we've reached the left end of the container, change direction to right
      else if (scrollPositionRef.current <= 0) {
        scrollDirectionRef.current = 1;
      }
      // Update the scroll position
      scrollPositionRef.current += scrollDirectionRef.current;
      // Apply the new scroll position to the container
      element.scrollLeft = scrollPositionRef.current;
    }, 90);
  };

  // Effect hook to start the slow scroll when the component mounts
  useEffect(() => {
    if (!isAnimationStopped) {
      scrollSlowly();
    }
    // Cleanup function to clear the interval when the component unmounts
    return () => {
      if (scrollInterval.current !== null) {
        clearInterval(scrollInterval.current);
      }
    };
  }, [coursestudents]);

  useEffect(() => {
    if (!loading) {
      if (coursestudents.length < 1) {
        setLectureSuccess(true);
      } else {
        setLectureSuccess(false);
      }
    }
  }, [coursestudents]);
  return (
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
      {coursestudents.length === 0 ? (
        <p className=''>
          {remainingTime > 0
            ? `All students are here. Auto finishing in ${remainingTime} seconds`
            : 'Finishing lecture...'}
        </p>
      ) : (
        <div className={`   whitespace-nowrap `}>
          {coursestudents.map((student, index) => {
            const formattedName = widerNamesToggle
              ? `${student.first_name} ${student.last_name}`
              : `${student.first_name} ${student.last_name.charAt(0)}.`;

            const isBouncing = !isAnimationStopped && index % 2 === bounceGroup;
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
              : 'rounded-none';
            return (
              <p
                ref={isFirst ? firstItemRef : isLast ? lastItemRef : null}
                key={student.userid}
                className={`inline-block cursor-pointer p-2 m-2 text-white text-xs sm:text-sm md:text-md lg:text-lg xl:text-xl 2xl:text-2xl font-semibold ${bgColorClass} ${shapeClass} ${
                  isBouncing ? 'motion-safe:animate-bounce' : ''
                }`}
                title={`${student.first_name} ${student.last_name}`}
                onClick={() => {
                  if (socket) {
                    socket.emit(
                      'manualStudentInsert',
                      student.studentnumber,
                      lectureid,
                    );
                  }
                }}>
                {formattedName}
              </p>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CourseStudents;
