import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(duration);
dayjs.extend(relativeTime);

export const calculateDuration = (start: string, end: string) => {
  const startTime = dayjs(start);
  const endTime = dayjs(end);
  const diff = endTime.diff(startTime);
  const duration = dayjs.duration(diff);
  return `${Math.floor(duration.asHours())}h ${duration.minutes()}min`;
};

/**
 * Format a date to browser's local time
 * @param date Date to format
 * @param format Format string (dayjs format)
 * @returns Formatted date string
 */
export const formatLocalDate = (
  date: Date | string | number,
  format = 'YYYY-MM-DD',
): string => {
  return dayjs(date).format(format);
};

/**
 * Get relative time from now
 * @param date Date to compare
 * @returns Relative time string (e.g. "2 hours ago")
 */
export const getRelativeTime = (date: Date | string | number): string => {
  return dayjs(date).fromNow();
};
