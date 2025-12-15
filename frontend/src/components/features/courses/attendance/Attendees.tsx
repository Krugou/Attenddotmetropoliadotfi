import React from 'react';
/**
 * Represents the properties of the Attendees component.
 */
interface AttendeesProps {
  arrayOfStudents: {
    first_name: string;
    last_name: string;
    userid: number;
    studentnumber: string;
  }[];
  socket: any;
  lectureid: string;
  widerNamesToggle: boolean;
}

/**
 * A component that displays the attendees of a lecture.
 */
const Attendees: React.FC<AttendeesProps> = ({
  arrayOfStudents,
  socket,
  lectureid,
  widerNamesToggle,
}) => {
  return (
    <div className='text-md max-w-full w-full 2xl:w-3/4 2xl:min-h-[20em] xl:max-h-[20em] max-h-[17em] sm:w-1/2 lg:w-full min-h-[15em] lg:min-h-[20em] overflow-auto  m-2 p-2 sm:text-xl mb-4  border-2 border-metropolia-trend-green'>
      <div className='flex flex-wrap justify-center'>
        {arrayOfStudents.map((student, index) => {
          /**
           * The formatted name of the student, which includes the first name and the first character of the last name.
           */
          const formattedName = widerNamesToggle
            ? `${student.first_name} ${student.last_name}`
            : `${student.first_name} ${student.last_name.charAt(0)}.`;
          return (
            <p
              key={index}
              className={`flex items-center cursor-pointer justify-center m-2 p-2 rounded shadow-md ${
                index % 4 === 0
                  ? 'bg-metropolia-support-red text-white'
                  : index % 4 === 1
                  ? 'bg-metropolia-support-yellow'
                  : index % 4 === 2
                  ? 'bg-metropolia-trend-light-blue text-white'
                  : 'bg-metropolia-main-orange text-white'
              }`}
              title={`${student.first_name} ${student.last_name}`}
              onClick={() => {
                if (socket) {
                  socket.emit(
                    'manualStudentRemove',
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
    </div>
  );
};

export default Attendees;
