import React from 'react';
import dayjs from 'dayjs';
import {useTranslation} from 'react-i18next';
import {getRelativeTime} from '../../utils/timeUtils';

interface DateDisplayProps {
  /**
   * The date to display. Can be a Date object, an ISO string, or a timestamp
   */
  date: Date | string | number;

  /**
   * Format string for the date. Defaults to 'YYYY-MM-DD'
   * Uses dayjs formatting: https://day.js.org/docs/en/display/format
   */
  format?: string;

  /**
   * Show time alongside the date
   */
  showTime?: boolean;

  /**
   * Time format string. Defaults to 'HH:mm'
   */
  timeFormat?: string;

  /**
   * CSS class names
   */
  className?: string;

  /**
   * Show as relative time (e.g. '2 days ago')
   */
  relative?: boolean;

  /**
   * Display a tooltip with the full date-time on hover
   */
  showTooltip?: boolean;
}

/**
 * DateDisplay component - Displays a date in the user's local time zone
 * with several formatting options
 */
const DateDisplay: React.FC<DateDisplayProps> = ({
  date,
  format = 'YYYY-MM-DD',
  showTime = false,
  timeFormat = 'HH:mm',
  className = '',
  relative = false,
  showTooltip = true,
}) => {
  const {t} = useTranslation(['common']);

  // Handle null or undefined values
  if (!date) {
    return <span className={className}>{t('never')}</span>;
  }

  // Convert the input to a dayjs object
  const dayjsDate = dayjs(date);

  // Check if the date is invalid
  if (!dayjsDate.isValid()) {
    return <span className={className}>{t('dateDisplay.invalidDate')}</span>;
  }

  // Format the date according to the specified format
  const formattedDate = dayjsDate.format(format);

  // Format the time if requested
  const formattedTime = showTime ? dayjsDate.format(timeFormat) : null;

  // Full date-time string for tooltip
  const fullDateTime = dayjsDate.format('YYYY-MM-DD HH:mm:ss');

  // Determine what to display based on the props
  let displayValue: string;

  if (relative) {
    // Use the getRelativeTime function from timeUtils
    displayValue = getRelativeTime(date);
  } else {
    displayValue = showTime
      ? `${formattedDate} ${formattedTime}`
      : formattedDate;
  }

  // Return the formatted date with an optional tooltip
  return showTooltip ? (
    <span className={className} title={fullDateTime}>
      {displayValue}
    </span>
  ) : (
    <span className={className}>{displayValue}</span>
  );
};

export default DateDisplay;
