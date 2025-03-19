import React, { memo } from 'react';
import WarningIcon from '@mui/icons-material/Warning';

/**
 * Interface for IP tracking data object
 */
export interface IPTrackingData {
  ip?: string;
  location?: string;
  timestamp?: string | number;
  device?: string;
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
}

/**
 * A component that displays a warning icon with a tooltip showing IP tracking data.
 * Only renders if there is tracking data to display.
 *
 * @example
 * ```tsx
 * <IPWarningTooltip
 *   ipTrackingData={[{ip: '192.168.1.1', location: 'Finland', timestamp: '2023-05-01T12:00:00Z'}]}
 * />
 * ```
 */
const IPWarningTooltip: React.FC<IPWarningTooltipProps> = ({
  ipTrackingData = [],
  iconClass = 'text-metropolia-support-yellow-dark',
  tooltipClass = 'bg-white text-black p-3 rounded shadow-lg max-w-xs z-50',
  heading = 'User Access Information',
}) => {

  const normalizeData = (): IPTrackingData[] => {
    if (!ipTrackingData) return [];


    if (Array.isArray(ipTrackingData)) return ipTrackingData;

    if (typeof ipTrackingData === 'object' && ipTrackingData !== null) {

      if (Object.keys(ipTrackingData).length === 0) return [];

      return [ipTrackingData as IPTrackingData];
    }

    return [];
  };

  const normalizedData = normalizeData();

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

  return (
    <div className="relative inline-block group cursor-help ml-2">
      <WarningIcon className={iconClass} />
      <div className={`hidden group-hover:block absolute left-1/2 -translate-x-1/2 bottom-full mb-2 ${tooltipClass}`}>
        <h4 className="font-bold mb-2 border-b pb-1">{heading}</h4>
        {normalizedData.map((data, index) => (
          <div key={index} className="mb-2 last:mb-0">
            {data.ip && <p className="text-sm my-1"><span className="font-bold">IP:</span> {data.ip}</p>}
            {data.location && <p className="text-sm my-1"><span className="font-bold">Location:</span> {data.location}</p>}
            {data.timestamp && <p className="text-sm my-1"><span className="font-bold">Time:</span> {formatTimestamp(data.timestamp)}</p>}
            {data.device && <p className="text-sm my-1"><span className="font-bold">Device:</span> {data.device}</p>}

            {/* Display any additional properties */}
            {Object.entries(data)
              .filter(([key]) => !['ip', 'location', 'timestamp', 'device'].includes(key))
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
  );
};

export default memo(IPWarningTooltip);
