import React, {useContext, useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {toast} from 'react-toastify';
import {UserContext} from '../../../../contexts/UserContext';
import apiHooks from '../../../../api';
import dayjs from 'dayjs';
import EditWorklogModal from '../../../../components/modals/EditWorklogModal';
import {ViewList, ViewModule, Search, Sort} from '@mui/icons-material';
import WorklogFilters from '../../../../components/worklog/WorklogFilters';
import WorklogCardView from '../../../../components/worklog/WorklogCardView';
import WorklogTableView from '../../../../components/worklog/WorklogTableView';
import type {WorkLogEntry} from '../../../../types/worklog';
import Loader from '../../../../utils/Loader';
import {calculateDuration} from '../../../../utils/timeUtils';

const StudentWorklogs: React.FC = () => {
  const {t} = useTranslation(['common']);
  const {user} = useContext(UserContext);
  const [entries, setEntries] = useState<WorkLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState<WorkLogEntry | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [uniqueCourses, setUniqueCourses] = useState<
    Array<{code: string; name: string}>
  >([]);
  const [showCalendar, setShowCalendar] = useState(false);
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<{
    key: 'date' | 'course' | 'duration' | 'description';
    direction: 'asc' | 'desc';
  }>({
    key: 'date',
    direction: 'desc',
  });

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const token = localStorage.getItem('userToken');
        if (!token || !user?.userid) {
          throw new Error('No token or user found');
        }

        const response = await apiHooks.getAllWorkLogEntries(
          user.userid,
          token,
        );
        if (response.entries) {
          setEntries(response.entries);
          const courses = new Map();
          response.entries.forEach((entry: WorkLogEntry) => {
            if (entry.course?.code && !courses.has(entry.course.code)) {
              courses.set(entry.course.code, {
                code: entry.course.code,
                name: entry.course.name,
              });
            }
          });
          setUniqueCourses(Array.from(courses.values()));
        }
      } catch (error) {
        console.error('Error fetching worklog entries:', error);
        toast.error(t('common:worklog.error.fetchFailed'));
      } finally {
        setLoading(false);
      }
    };

    fetchEntries();
  }, [user?.userid, t]);

  const handleSaveEdit = async (updatedData: Partial<WorkLogEntry>) => {
    if (!selectedEntry) return;

    try {
      const token = localStorage.getItem('userToken');
      if (!token) throw new Error('No token found');

      await apiHooks.updateWorkLogEntry(
        selectedEntry.entry_id,
        updatedData,
        token,
      );
      setEntries(
        entries.map((entry) =>
          entry.entry_id === selectedEntry.entry_id
            ? {...entry, ...updatedData}
            : entry,
        ),
      );

      toast.success(t('common:worklog.edit.success'));
    } catch (error) {
      console.error('Error updating entry:', error);
      toast.error(t('common:worklog.edit.error'));
    }
  };

  const handleSort = (key: 'date' | 'course' | 'duration' | 'description') => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc',
    }));
  };

  const sortEntries = (entriesToSort: WorkLogEntry[]) => {
    return [...entriesToSort].sort((a, b) => {
      const multiplier = sortConfig.direction === 'asc' ? 1 : -1;

      switch (sortConfig.key) {
        case 'date':
          return (
            (dayjs(a.start_time).valueOf() - dayjs(b.start_time).valueOf()) *
            multiplier
          );
        case 'course':
          return (
            (a.course?.name || '').localeCompare(b.course?.name || '') *
            multiplier
          );
        case 'duration':
          const durationA = calculateDuration(a.start_time, a.end_time);
          const durationB = calculateDuration(b.start_time, b.end_time);
          return durationA.localeCompare(durationB) * multiplier;
        case 'description':
          return a.description.localeCompare(b.description) * multiplier;
        default:
          return 0;
      }
    });
  };

  const filteredAndSortedEntries = React.useMemo(() => {
    let filtered = entries.filter((entry) => {
      const matchesCourse =
        selectedCourse === 'all' || entry.course?.code === selectedCourse;

      const entryDate = dayjs(entry.start_time);
      const compareDate = selectedDate ? dayjs(selectedDate) : null;

      const matchesDate =
        !selectedDate ||
        entryDate.format('YYYY-MM-DD') === compareDate?.format('YYYY-MM-DD');

      const matchesSearch =
        searchQuery === '' ||
        entry.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.course?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.course?.code.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCourse && matchesDate && matchesSearch;
    });

    return sortEntries(filtered);
  }, [entries, selectedCourse, selectedDate, searchQuery, sortConfig]);

  const worklogDates = [
    ...new Set(
      entries.map((entry) => dayjs(entry.start_time).format('YYYY-MM-DD')),
    ),
  ];

  if (loading) {
    return <Loader />;
  }

  return (
    <div className='container px-4 py-8 bg-metropolia-support-white rounded-xl mx-auto'>
      <div className='flex flex-col gap-4'>
        <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
          <h1 className='text-2xl font-heading text-metropolia-main-orange'>
            {t('common:worklog.entries.title')}
          </h1>
          <div className='flex items-center gap-2 bg-metropolia-support-white rounded-lg p-1 shadow-sm'>
            <button
              onClick={() => setViewMode('card')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'card'
                  ? 'bg-metropolia-main-orange text-white'
                  : 'text-metropolia-main-grey hover:bg-gray-100'
              }`}
              title={t('common:worklog.view.card')}>
              <ViewModule />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'table'
                  ? 'bg-metropolia-main-orange text-white'
                  : 'text-metropolia-main-grey hover:bg-gray-100'
              }`}
              title={t('common:worklog.view.table')}>
              <ViewList />
            </button>
          </div>
        </div>

        <div className='flex flex-col sm:flex-row gap-4 items-stretch'>
          <div className='flex-1'>
            <div className='relative'>
              <input
                type='text'
                placeholder={t('common:worklog.search.placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='w-full pl-10 pr-4 py-2 border-2 border-metropolia-main-grey/20 rounded-lg focus:border-metropolia-main-orange focus:ring-2 focus:ring-metropolia-main-orange/20'
              />
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-metropolia-main-grey/50' />
            </div>
          </div>

          <WorklogFilters
            selectedCourse={selectedCourse}
            setSelectedCourse={setSelectedCourse}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            showCalendar={showCalendar}
            setShowCalendar={setShowCalendar}
            uniqueCourses={uniqueCourses}
            worklogDates={worklogDates}
          />
        </div>

        <div className='flex gap-2 flex-wrap'>
          {(['date', 'course', 'duration', 'description'] as const).map(
            (key) => (
              <button
                key={key}
                onClick={() => handleSort(key)}
                className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
                  sortConfig.key === key
                    ? 'bg-metropolia-main-orange text-white'
                    : 'bg-gray-100 text-metropolia-main-grey hover:bg-gray-200'
                }`}>
                {t(`common:worklog.sort.${key}`)}
                {sortConfig.key === key && (
                  <Sort
                    className={`h-4 w-4 transform ${
                      sortConfig.direction === 'desc' ? 'rotate-180' : ''
                    }`}
                  />
                )}
              </button>
            ),
          )}
        </div>
      </div>

      {viewMode === 'card' ? (
        <WorklogCardView
          entries={filteredAndSortedEntries}
          setSelectedEntry={setSelectedEntry}
          setIsModalOpen={setIsModalOpen}
        />
      ) : (
        <WorklogTableView entries={filteredAndSortedEntries} />
      )}
      <EditWorklogModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        entry={selectedEntry}
        onSave={handleSaveEdit}
      />
    </div>
  );
};

export default StudentWorklogs;
