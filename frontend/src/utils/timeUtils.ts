import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
dayjs.extend(duration);

export const calculateDuration = (start: string, end: string) => {
  const startTime = dayjs(start);
  const endTime = dayjs(end);
  const diff = endTime.diff(startTime);
  const duration = dayjs.duration(diff);
  return `${Math.floor(duration.asHours())}h ${duration.minutes()}min`;
};
