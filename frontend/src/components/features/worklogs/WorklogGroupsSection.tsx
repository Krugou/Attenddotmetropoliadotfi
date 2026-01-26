import React, {useCallback, useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {toast} from 'react-toastify';
import apiHooks from '../../../api';

import WorklogGroupPanel from './WorklogGroupPanel.tsx';
import WorklogGroupStatsPanel from './WorklogGroupStatsPanel.tsx';

import PeopleAltIcon from '@mui/icons-material/PeopleAlt';

interface WorkLogGroup {
  group_id: number;
  group_name: string;
  work_log_course_id?: number;
  member_count: number;
}

interface WorkLogStudent {
  userid: number;
  email: string;
  first_name: string;
  last_name: string;
  studentnumber: string;
  existingGroup?: {group_id: number; group_name: string} | null;
}

type Props = {
  courseId: number;
};

const WorklogGroupsSection: React.FC<Props> = ({courseId}) => {
  const {t} = useTranslation(['teacher', 'common']);

  const [groups, setGroups] = useState<WorkLogGroup[]>([]);
  const [students, setStudents] = useState<WorkLogStudent[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [showStats, setShowStats] = useState(false);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [charCount, setCharCount] = useState(0);

  const handleGroupNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewGroupName(e.target.value);
    setCharCount(e.target.value.length);
  };

  const refreshData = useCallback(async () => {
    try {
      const token = localStorage.getItem('userToken');
      if (!token) throw new Error('No token available');

      const [updatedGroups, studentsResponse] = await Promise.all([
        apiHooks.getWorkLogGroupsByCourse(String(courseId), token),
        apiHooks.getWorkLogStudentsByCourse(String(courseId), token),
      ]);

      const studentsWithGroupCheck = await Promise.all(
        studentsResponse.students.map(async (student: WorkLogStudent) => {
          const existingGroup = await apiHooks.checkStudentExistingGroup(
            student.userid,
            Number(courseId),
            token,
          );
          return {...student, existingGroup};
        }),
      );

      const availableStudents = studentsWithGroupCheck.filter(
        (student) => !student.existingGroup,
      );

      setGroups(updatedGroups || []);
      setStudents(availableStudents);
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    }
  }, [courseId]);

  useEffect(() => {
    const fetchInitial = async () => {
      try {
        setLoading(true);
        await refreshData();
      } finally {
        setLoading(false);
      }
    };
    fetchInitial();
  }, [refreshData]);

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newGroupName.trim()) {
      toast.error(t('teacher:worklog.groups.errors.nameRequired'));
      return;
    }

    try {
      setIsCreatingGroup(true);
      const token = localStorage.getItem('userToken');
      if (!token) throw new Error('No token available');

      const response = await apiHooks.createWorkLogGroup(
        String(courseId),
        newGroupName.trim(),
        token,
      );

      if (!response?.groupId) {
        throw new Error('No group ID returned from creation');
      }

      if (selectedStudents.length > 0) {
        try {
          await apiHooks.addStudentsToWorkLogGroup(
            response.groupId,
            selectedStudents,
            token,
          );
        } catch {
          toast.warning(t('teacher:worklog.groups.warnings.studentsNotAdded'));
        }
      }

      await refreshData();

      setNewGroupName('');
      setSelectedStudents([]);
      setShowCreateForm(false);

      // UX: valitse luotu ryhmä automaattisesti
      setSelectedGroupId(response.groupId);
      setShowStats(false);

      toast.success(t('teacher:worklog.groups.createSuccess'));
    } catch (error) {
      if (error instanceof Error) {
        toast.error(
          t('teacher:worklog.groups.errors.createFailed', {message: error.message}),
        );
      } else {
        toast.error(t('teacher:worklog.groups.errors.unknown'));
      }
    } finally {
      setIsCreatingGroup(false);
    }
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-xl font-body">{t('loading')}</div>
      </div>
    );
  }

  return (
    <div className="min-w-0">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-2xl font-heading text-gray-900">
            {t('teacher:worklog.groups.title')}
          </h2>
          <p className="text-sm text-gray-600 font-body">
            {t('teacher:worklog.groups.subtitle')}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateForm(v => !v)}
          className="px-4 py-2 text-white rounded-lg bg-metropolia-main-orange hover:bg-metropolia-secondary-orange transition-colors duration-200 w-fit"
        >
          {showCreateForm ? t('cancel') : t('teacher:worklog.groups.createGroup')}
        </button>
      </div>

      {/* Create form */}
      {showCreateForm && (
        <div className="p-6 mt-5 bg-gray-50 rounded-2xl border border-gray-200">
          <h3 className="mb-4 text-xl font-heading">
            {t('teacher:worklog.groups.createNew')}
          </h3>

          <form onSubmit={handleCreateGroup} className="space-y-6">
            <div>
              <label htmlFor="groupName" className="block mb-1 text-sm text-gray-700 font-body">
                {t('teacher:worklog.groups.groupName')}
              </label>
              <input
                id="groupName"
                type="text"
                value={newGroupName}
                onChange={handleGroupNameChange}
                className="w-full p-2 border rounded-sm font-body"
                maxLength={100}
                required
              />
              <p className="mt-1 text-sm text-gray-500 text-right font-body">
                {charCount}/100 {t('characters')}
              </p>
            </div>

            <div>
              <h4 className="mb-2 text-lg font-heading">
                {t('teacher:worklog.groups.selectStudents')}
              </h4>

              <div className="p-4 overflow-y-auto border rounded-sm max-h-80 bg-white">
                {students.length === 0 ? (
                  <div className="flex items-center justify-center p-6 text-gray-500 font-body">
                    <p>{t('teacher:worklog.groups.allStudentsAssigned')}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {students.map(student => (
                      <div
                        key={student.userid}
                        className={[
                          'relative p-4 border rounded-lg cursor-pointer transition-all duration-200',
                          selectedStudents.includes(student.userid)
                            ? 'border-metropolia-main-orange bg-orange-50'
                            : 'border-gray-200 hover:border-metropolia-main-orange/50',
                        ].join(' ')}
                        onClick={() => {
                          setSelectedStudents(prev =>
                            prev.includes(student.userid)
                              ? prev.filter(id => id !== student.userid)
                              : [...prev, student.userid],
                          );
                        }}
                      >
                        <div className="pr-2">
                          <div className="font-medium font-body">
                            {student.first_name} {student.last_name}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 border rounded-sm font-body hover:bg-gray-50"
              >
                {t('cancel')}
              </button>

              <button
                type="submit"
                disabled={isCreatingGroup || !newGroupName.trim()}
                className={[
                  'px-4 py-2 rounded font-body',
                  isCreatingGroup || !newGroupName.trim()
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-metropolia-main-orange text-white hover:opacity-90',
                ].join(' ')}
              >
                {isCreatingGroup ? t('creating') : t('create')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Groups list */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {groups.length === 0 ? (
          <div className="p-6 bg-gray-50 rounded-2xl border border-gray-200">
            <p className="text-center text-gray-600 font-body">
              {t('teacher:worklog.groups.noGroups')}
            </p>
          </div>
        ) : (
          groups.map(group => {
            const isSelected = group.group_id === selectedGroupId;

            return (
              <button
                type="button"
                key={group.group_id}
                onClick={() => {
                  setSelectedGroupId(group.group_id);
                  setShowStats(false);
                }}
                className={[
                  'text-left p-4 rounded-2xl border transition-shadow duration-200 bg-white',
                  isSelected
                    ? 'border-metropolia-main-orange shadow-sm'
                    : 'border-gray-200 hover:shadow-sm',
                ].join(' ')}
              >
                <div className="flex items-start justify-between gap-3 min-h-20">
                  <h3 className="text-lg font-heading min-w-0 break-words line-clamp-2">
                    {group.group_name}
                  </h3>
                  <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs font-body text-gray-700">
                    <PeopleAltIcon fontSize="inherit" />
                    {group.member_count}
                  </span>
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Selected group panel */}
      {selectedGroupId && (
        <div className="mt-8">

          <div className="mt-4">
            {!showStats ? (
              <WorklogGroupPanel
                courseId={courseId}
                groupId={selectedGroupId}
                showStats={showStats}
                onShowGroup={() => setShowStats(false)}
                onShowStats={() => setShowStats(true)}
                onGroupUpdated={refreshData}
              />
            ) : (
              <WorklogGroupStatsPanel
                courseId={courseId}
                groupId={selectedGroupId}
                showStats={showStats}
                onShowGroup={() => setShowStats(false)}
                onShowStats={() => setShowStats(true)}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WorklogGroupsSection;
