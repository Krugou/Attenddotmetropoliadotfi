import React, { memo, useMemo } from 'react';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';

/**
 * Interface for IP tracking data object
 */
export interface IPTrackingData {
  ip?: string;
  location?: string;
  timestamp?: string | number;
  device?: string;
  studentnumber?: string | number;
  duplicate?: boolean;
  suspicious?: boolean;
  [key: string]: any;
}

/**
 * Props for the IPWarningTooltip component
 */
interface IPWarningTooltipProps {
  ipTrackingData?: IPTrackingData[] | IPTrackingData | null;
  iconClass?: string;
  tooltipClass?: string;
  heading?: string;
  position?: 'top' | 'bottom';
}

/**
 * A component that displays a warning icon with a tooltip showing IP tracking data.
 * Only renders if there is tracking data to display.
 *
 * @example
 * ```tsx
 * <IPWarningTooltip
 *   ipTrackingData={[{ip: '192.168.1.1', location: 'Finland', timestamp: '2023-05-01T12:00:00Z'}]}
 *   position="bottom"
 * />
 * ```
 */
const IPWarningTooltip: React.FC<IPWarningTooltipProps> = ({
  ipTrackingData = [],
  iconClass = 'text-metropolia-support-yellow-dark',
  tooltipClass = 'bg-white text-black p-3 rounded shadow-lg max-w-xs z-50',
  heading = 'User Access Information',
  position = 'bottom',  // Set default position to bottom
}) => {

  console.log('ipTrackingData:', ipTrackingData);

  const normalizedData = useMemo(() => {
    if (!ipTrackingData) return [];

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

  // Check for suspicious or duplicate IP attempts
  const hasIssues = useMemo(() => {
    return normalizedData.some(data =>
      data.duplicate === true || data.suspicious === true
    );
  }, [normalizedData]);

  if (normalizedData.length === 0) {
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
    return position === 'top'
      ? 'bottom-full mb-2'
      : 'top-full mt-2';
  };

  return (
    <div className="relative inline-block group cursor-help ml-2">
      <div className="flex items-center">
        {hasIssues ? (
          <ErrorIcon className="text-metropolia-support-red" />
        ) : (
          <WarningIcon className={iconClass} />
        )}
        <span className={`ml-1 text-xs font-bold ${hasIssues ? 'bg-metropolia-support-red' : 'bg-metropolia-support-yellow-dark'} text-white rounded-full px-2`}>
          {normalizedData.length}
        </span>
      </div>

      <div className={`hidden group-hover:block absolute left-1/2 -translate-x-1/2 ${getPositionClasses()} ${tooltipClass}`}>
        <h4 className="font-bold mb-2 border-b pb-1">{heading}</h4>
        <div className="max-h-60 overflow-y-auto">
          {normalizedData.map((data, index) => (
            <div
              key={index}
              className={`mb-2 last:mb-0 ${data.duplicate || data.suspicious ? 'bg-red-50 border-l-4 border-metropolia-support-red p-1' : ''}`}
            >
              {data.ip && (
                <p className="text-sm my-1">
                  <span className="font-bold">IP:</span> {data.ip}
                  {data.duplicate && (
                    <span className="ml-2 text-xs text-metropolia-support-red font-bold">
                      DUPLICATE ATTEMPT
                    </span>
                  )}
                  {data.suspicious && (
                    <span className="ml-2 text-xs text-metropolia-support-red font-bold">
                      SUSPICIOUS ACTIVITY
                    </span>
                  )}
                </p>
              )}
              {data.studentnumber && (
                <p className="text-sm my-1">
                  <span className="font-bold">Student:</span> {data.studentnumber}
                </p>
              )}
              {data.timestamp && <p className="text-sm my-1"><span className="font-bold">Time:</span> {formatTimestamp(data.timestamp)}</p>}
              {data.location && <p className="text-sm my-1"><span className="font-bold">Location:</span> {data.location}</p>}
              {data.device && <p className="text-sm my-1"><span className="font-bold">Device:</span> {data.device}</p>}

              {Object.entries(data)
                .filter(([key]) => !['ip', 'location', 'timestamp', 'device', 'studentnumber'].includes(key))
                .map(([key, value]) => (
                  <p key={key} className="text-sm my-1">
                    <span className="font-bold">{key.charAt(0).toUpperCase() + key.slice(1)}:</span> {String(value)}
                  </p>
                ))}

              {index < normalizedData.length - 1 && <hr className="my-2 border-gray-200" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default memo(IPWarningTooltip);
