import React, {memo, useMemo, useState, useRef, useEffect} from 'react';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import CloseIcon from '@mui/icons-material/Close';

/**
 * Interface for IP tracking data object
 */
export interface IPTrackingData {
  ip?: string;
  timestamp?: string | number;
  studentId?: string;
  studentId2?: string;
  studentIds?: string[];
  duplicateFound?: boolean;
  userAgent?: string;
  [key: string]: any;
}

/**
 * Interface for Student type
 */
export interface Student {
  studentnumber: string | number;
  first_name: string;
  last_name: string;
  userid: number;
  [key: string]: any;
}

/**
 * Props for the IPWarningTooltip component
 */
interface IPWarningTooltipProps {
  ipTrackingData?:
    | IPTrackingData[]
    | IPTrackingData
    | Map<string, IPTrackingData>
    | null;
  iconClass?: string;
  tooltipClass?: string;
  heading?: string;
  position?: 'top' | 'bottom';
  attendees?: Student[];
  courseStudents?: Student[];
}

/**
 * A component that displays a warning icon with a tooltip showing IP tracking data.
 * The tooltip can be toggled by clicking the icon, and closed with a close button.
 *
 * @example
 * ```tsx
 * <IPWarningTooltip
 *   ipTrackingData={[{ip: '192.168.1.1', location: 'Finland', timestamp: '2023-05-01T12:00:00Z'}]}
 *   position="bottom"
 *   attendees={arrayOfStudents}
 *   courseStudents={courseStudents}
 * />
 * ```
 */
const IPWarningTooltip: React.FC<IPWarningTooltipProps> = ({
  ipTrackingData = [],
  iconClass = 'text-metropolia-support-yellow-dark',
  tooltipClass = 'bg-white text-black p-3 rounded shadow-lg max-w-xs z-50',
  heading = 'User Access Information',
  position = 'bottom',
  attendees = [],
  courseStudents = [],
}) => {
  // Remove console logs for production
  // console.log('🚀 ~ ipTrackingData:', ipTrackingData);
  // console.log('🚀 ~ attendees:', attendees);
  // console.log('🚀 ~ courseStudents:', courseStudents);

  // Add state to track if tooltip is open
  const [isOpen, setIsOpen] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Combine attendees and courseStudents for student lookup
  const allStudents = useMemo(() => {
    const uniqueStudents = new Map<string, Student>();

    // Add all attendees
    attendees.forEach((student) => {
      if (student && student.studentnumber) {
        // Convert studentnumber to string to ensure consistent key format
        uniqueStudents.set(String(student.studentnumber), student);
      }
    });

    // Add course students if not already added
    courseStudents.forEach((student) => {
      if (student && student.studentnumber) {
        // Convert studentnumber to string to ensure consistent key format
        uniqueStudents.set(String(student.studentnumber), student);
      }
    });

    return uniqueStudents;
  }, [attendees, courseStudents]);

  // Find student name by studentnumber
  const findStudentName = (
    studentId: string | number | undefined,
  ): string | undefined => {
    if (!studentId) return undefined;

    // Always convert to string for consistent lookup
    const studentIdStr = String(studentId);

    // Try direct lookup first
    let student = allStudents.get(studentIdStr);

    // If not found and the ID is numeric, try without leading zeros (44444 vs 044444)
    if (!student && !isNaN(Number(studentIdStr))) {
      // Remove leading zeros for numeric IDs
      const numericId = String(Number(studentIdStr));
      student = allStudents.get(numericId);

      // If still not found, search through all students for a potential match
      if (!student) {
        for (const [key, value] of allStudents.entries()) {
          if (String(Number(key)) === numericId) {
            student = value;
            break;
          }
        }
      }
    }

    if (student) {
      return `${student.first_name} ${student.last_name}`;
    }
    return undefined;
  };

  // Helper function to check if there are multiple student IDs
  const hasMultipleStudentIds = (data: IPTrackingData): boolean => {
    // Check studentIds array
    if (
      data.studentIds &&
      Array.isArray(data.studentIds) &&
      data.studentIds.length > 1
    ) {
      return true;
    }

    // Count individual student ID fields
    let count = 0;
    if (data.studentId) count++;
    if (data.studentId2) count++;
    if (data.studentnumber) count++;

    return count > 1;
  };

  const normalizedData = useMemo(() => {
    if (!ipTrackingData) return [];

    // Handle Map type
    if (ipTrackingData instanceof Map) {
      return Array.from(ipTrackingData.values()).sort((a, b) => {
        const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
        const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
        return timeB - timeA;
      });
    }

    if (Array.isArray(ipTrackingData)) {
      return [...ipTrackingData].sort((a, b) => {
        const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
        const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
        return timeB - timeA;
      });
    }

    if (typeof ipTrackingData === 'object' && ipTrackingData !== null) {
      if (Object.keys(ipTrackingData).length === 0) return [];
      return [ipTrackingData as IPTrackingData];
    }

    return [];
  }, [ipTrackingData]);

  // Filter data to only include entries with multiple student IDs
  const filteredData = useMemo(() => {
    return normalizedData.filter((data) => hasMultipleStudentIds(data));
  }, [normalizedData]);

  // Check for duplicate IP attempts
  const hasIssues = useMemo(() => {
    return filteredData.some((data) => data.duplicateFound === true);
  }, [filteredData]);

  // Close tooltip when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  if (filteredData.length === 0) {
    return null;
  }

  const formatTimestamp = (timestamp: string | number | undefined) => {
    if (!timestamp) return undefined;

    try {
      return new Date(timestamp).toLocaleString();
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return timestamp.toString();
    }
  };

  // Get position-specific classes
  const getPositionClasses = () => {
    return position === 'top' ? 'bottom-full mb-2' : 'top-full mt-2';
  };

  // Toggle tooltip visibility
  const toggleTooltip = () => {
    setIsOpen(!isOpen);
  };

  // Format student IDs from array or individual fields
  const renderStudentIds = (data: IPTrackingData) => {
    // Only show warning when duplicateFound is true AND there are multiple student IDs
    const showDuplicateWarning =
      data.duplicateFound === true && hasMultipleStudentIds(data);

    if (
      data.studentIds &&
      Array.isArray(data.studentIds) &&
      data.studentIds.length > 0
    ) {
      return (
        <div className='text-sm my-1'>
          {/* Only display warning when conditions are met */}
          {showDuplicateWarning && (
            <div className='bg-red-100 border-l-4 border-metropolia-support-red p-2 mb-2'>
              <span className='text-metropolia-support-red font-bold'>
                MULTIPLE STUDENTS - SAME IP DETECTED
              </span>
            </div>
          )}
          <span className='font-bold'>Student IDs:</span>
          <div className='ml-1'>
            {data.studentIds.map((id, index) => {
              const studentName = findStudentName(id);
              return (
                <div key={index} className='flex items-center'>
                  <span>{id}</span>
                  {studentName && (
                    <span className='ml-2 text-metropolia-support-blue'>
                      ({studentName})
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    // Check for individual studentId fields if studentIds array is not available
    const studentFields: (string | number | undefined)[] = [];
    if (data.studentId) studentFields.push(data.studentId);
    if (data.studentId2) studentFields.push(data.studentId2);
    if (data.studentnumber) studentFields.push(data.studentnumber);

    if (studentFields.length > 0) {
      return (
        <div className='text-sm my-1'>
          {/* Only display warning when conditions are met */}
          {showDuplicateWarning && (
            <div className='bg-red-100 border-l-4 border-metropolia-support-red p-2 mb-2'>
              <span className='text-metropolia-support-red font-bold'>
                MULTIPLE STUDENTS - SAME IP DETECTED
              </span>
            </div>
          )}
          <span className='font-bold'>
            {studentFields.length > 1 ? 'Student IDs:' : 'Student ID:'}
          </span>
          <div className='ml-1'>
            {studentFields.map((id, index) => {
              const studentName = findStudentName(id);
              return (
                <div key={index} className='flex items-center'>
                  <span>{id}</span>
                  {studentName && (
                    <span className='ml-2 text-metropolia-support-blue'>
                      ({studentName})
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className='relative inline-block ml-2' ref={tooltipRef}>
      <button
        className='flex items-center cursor-help focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-metropolia-main-orange rounded-full p-1'
        onClick={toggleTooltip}
        aria-expanded={isOpen}
        aria-label='Toggle IP tracking information'>
        {hasIssues ? (
          <ErrorIcon className='text-metropolia-support-red' />
        ) : (
          <WarningIcon className={iconClass} />
        )}
        <span
          className={`ml-1 text-xs font-bold ${
            hasIssues
              ? 'bg-metropolia-support-red'
              : 'bg-metropolia-support-yellow-dark'
          } text-white rounded-full px-2`}>
          {filteredData.length}
        </span>
      </button>

      {isOpen && (
        <div
          className={`absolute left-1/2 -translate-x-1/2 ${getPositionClasses()} ${tooltipClass}`}>
          <div className='flex justify-between items-center mb-2 border-b pb-1'>
            <h4 className='font-bold'>{heading}</h4>
            <button
              onClick={() => setIsOpen(false)}
              className='text-gray-500 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-metropolia-main-orange rounded-full p-0.5'
              aria-label='Close tooltip'>
              <CloseIcon fontSize='small' />
            </button>
          </div>
          <div className='max-h-60 overflow-y-auto'>
            {filteredData.length > 0 ? (
              filteredData.map((data, index) => {
                // Only consider it a duplicate issue when duplicateFound is true AND there are multiple student IDs
                const isDuplicateCase =
                  data.duplicateFound === true && hasMultipleStudentIds(data);

                return (
                  <div
                    key={index}
                    className={`mb-2 last:mb-0 ${
                      isDuplicateCase
                        ? 'bg-red-50 border-l-4 border-metropolia-support-red p-1'
                        : ''
                    }`}>
                    {/* Show only essential information in the simplified format */}
                    {data.ip && (
                      <p className='text-sm my-1 font-bold'>IP: {data.ip}</p>
                    )}

                    {renderStudentIds(data)}

                    {data.timestamp && (
                      <p className='text-sm my-1'>
                        <span className='font-bold'>Time:</span>{' '}
                        {formatTimestamp(data.timestamp)}
                      </p>
                    )}

                    {data.userAgent && (
                      <p className='text-sm my-1'>
                        <span className='font-bold'>Browser:</span>{' '}
                        {data.userAgent
                          .split(' ')
                          .slice(-1)[0]
                          .replace('/', ' ')}
                      </p>
                    )}

                    {index < filteredData.length - 1 && (
                      <hr className='my-2 border-gray-200' />
                    )}
                  </div>
                );
              })
            ) : (
              <p className='text-center text-gray-500'>
                No multiple student IDs detected.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(IPWarningTooltip);
