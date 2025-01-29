import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useParams} from 'react-router-dom';
import {toast} from 'react-toastify';
import apiHooks from '../../../../../hooks/ApiHooks';

interface WorkLogGroup {
  group_id: number;
  group_name: string;
}

interface WorkLogStudent {
  userid: number;
  email: string;
  first_name: string;
  last_name: string;
  studentnumber: string;
}

const TeacherWorklogCourseGroups: React.FC = () => {
  const {t} = useTranslation();
  const {courseid} = useParams<{courseid: string}>();
  const [groups, setGroups] = useState<WorkLogGroup[]>([]);
  const [students, setStudents] = useState<WorkLogStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('userToken');
        if (!token || !courseid) {
          throw new Error('No token or course id found');
        }

        setLoading(true);
        const [groupsResponse, studentsResponse] = await Promise.all([
          apiHooks.getWorkLogGroupsByCourse(courseid, token),
          apiHooks.getWorkLogStudentsByCourse(courseid, token),
        ]);

        setGroups(groupsResponse || []);
        setStudents(studentsResponse.students || []);
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseid]);

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsCreatingGroup(true);
      const token = localStorage.getItem('userToken');
      if (!token || !courseid) {
        throw new Error('No token or course id found');
      }
      const newGroup = await apiHooks.createWorkLogGroup(
        courseid,
        newGroupName,
        token,
      );

      if (newGroup && newGroup.group_id && selectedStudents.length > 0) {
        await apiHooks.addStudentsToWorkLogGroup(
          newGroup.group_id,
          selectedStudents,
          token,
        );
      }

      const updatedGroups = await apiHooks.getWorkLogGroupsByCourse(
        courseid,
        token,
      );
      setGroups(updatedGroups || []);

      setNewGroupName('');
      setSelectedStudents([]);
      setShowCreateForm(false);
      toast.success(t('teacher.worklog.groups.createSuccess'));
    } catch (error) {
      console.error('Error creating group:', error);
      if (error instanceof Error) {
        toast.error(`Failed to create group: ${error.message}`);
      } else {
        toast.error('An unexpected error occurred while creating the group');
      }
    } finally {
      setIsCreatingGroup(false);
    }
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center p-8'>
        <div className='text-xl font-body'>Loading...</div>
      </div>
    );
  }

  return (
    <div className='container px-4 py-8 mx-auto'>
      <div className='flex items-center justify-between mb-6'>
        <h1 className='text-3xl font-heading'>
          {t('teacher.worklog.groups.title')}
        </h1>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className='px-4 py-2 text-white rounded bg-metropoliaMainOrange hover:bg-opacity-90 font-body'>
          {showCreateForm
            ? t('common.cancel')
            : t('teacher.worklog.groups.createGroup')}
        </button>
      </div>

      {showCreateForm && (
        <div className='p-6 mb-8 bg-white rounded-lg shadow'>
          <h2 className='mb-4 text-2xl font-heading'>
            {t('teacher.worklog.groups.createNew')}
          </h2>
          <form onSubmit={handleCreateGroup} className='space-y-6'>
            <div>
              <label
                htmlFor='groupName'
                className='block mb-1 text-sm text-gray-700 font-body'>
                {t('teacher.worklog.groups.groupName')}
              </label>
              <input
                id='groupName'
                type='text'
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                className='w-full p-2 border rounded font-body'
                required
              />
            </div>

            <div>
              <h3 className='mb-2 text-lg font-heading'>
                {t('teacher.worklog.groups.selectStudents')}
              </h3>
              <div className='p-4 overflow-y-auto border rounded max-h-96'>
                <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
                  {students.map((student) => (
                    <div
                      key={student.userid}
                      className={`relative p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                        selectedStudents.includes(student.userid)
                          ? 'border-metropoliaMainOrange bg-orange-50'
                          : 'border-gray-200 hover:border-metropoliaMainOrange/50'
                      }`}
                      onClick={() => {
                        if (selectedStudents.includes(student.userid)) {
                          setSelectedStudents(
                            selectedStudents.filter(
                              (id) => id !== student.userid,
                            ),
                          );
                        } else {
                          setSelectedStudents([
                            ...selectedStudents,
                            student.userid,
                          ]);
                        }
                      }}>
                      <div className='pr-8'>
                        <div className='font-medium font-body'>
                          {`${student.first_name} ${student.last_name}`}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className='flex justify-end gap-4'>
              <button
                type='button'
                onClick={() => setShowCreateForm(false)}
                className='px-4 py-2 border rounded font-body hover:bg-gray-50'>
                {t('common.cancel')}
              </button>
              <button
                type='submit'
                disabled={isCreatingGroup || !newGroupName.trim()}
                className={`px-4 py-2 rounded font-body ${
                  isCreatingGroup || !newGroupName.trim()
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-metropoliaMainOrange text-white hover:bg-opacity-90'
                }`}>
                {isCreatingGroup ? t('common.creating') : t('common.create')}
              </button>
            </div>
          </form>
        </div>
      )}

      <h2 className='mb-6 text-2xl font-heading'>
        {t('teacher.worklog.groups.groupsTitle')}
      </h2>
      {groups?.length === 0 ? (
        <div className='p-6 bg-white rounded-lg shadow'>
          <p className='text-center text-gray-600 font-body'>
            {t('teacher.worklog.groups.noGroups')}
          </p>
        </div>
      ) : (
        <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {groups?.map((group) => (
            <div
              key={group.group_id}
              className='p-6 bg-white rounded-lg shadow'>
              <h3 className='mb-4 text-xl font-heading'>{group.group_name}</h3>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeacherWorklogCourseGroups;
