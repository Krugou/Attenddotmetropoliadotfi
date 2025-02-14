import React, {useContext, useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {toast} from 'react-toastify';
import {UserContext} from '../../../../contexts/UserContext';
import apiHooks from '../../../../api';
import dayjs from 'dayjs';
import {CircularProgress} from '@mui/material';
import EditWorklogModal from '../../../../components/modals/EditWorklogModal';
import {ViewList, ViewModule} from '@mui/icons-material';
import WorklogFilters from '../../../../components/worklog/WorklogFilters';
import WorklogCardView from '../../../../components/worklog/WorklogCardView';
import WorklogTableView from '../../../../components/worklog/WorklogTableView';
import type {WorkLogEntry} from '../../../../types/worklog';
import Loader from '../../../../utils/Loader';

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

  const filteredEntries = entries.filter((entry) => {
    const matchesCourse =
      selectedCourse === 'all' || entry.course?.code === selectedCourse;
    const matchesDate =
      !selectedDate ||
      dayjs(entry.start_time).format('YYYY-MM-DD') ===
        dayjs(selectedDate).format('YYYY-MM-DD');
    return matchesCourse && matchesDate;
  });

  const worklogDates = entries.map((entry) =>
    dayjs(entry.start_time).format('YYYY-MM-DD'),
  );

  if (loading) {
    return <Loader />;
  }

  return (
    <div className='container px-4 py-8 bg-metropolia-support-white rounded-xl mx-auto'>
      <div className='flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4'>
        <div className='flex flex-col sm:flex-row items-start sm:items-center gap-4'>
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
      {viewMode === 'card' ? (
        <WorklogCardView
          entries={filteredEntries}
          setSelectedEntry={setSelectedEntry}
          setIsModalOpen={setIsModalOpen}
        />
      ) : (
        <WorklogTableView entries={filteredEntries} />
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
