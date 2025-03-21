import React from 'react';
import {useTranslation} from 'react-i18next';
interface StudentGroup {
  studentgroupid: number;
  group_name: string;
  // include other properties if they exist
}
interface StudentGroupSelectProps {
  studentGroups: StudentGroup[];
  selectedGroup: number | null;
  onChange: (value: number) => void;
}

const StudentGroupSelect: React.FC<StudentGroupSelectProps> = ({
  studentGroups,
  selectedGroup,
  onChange,
}) => {
  const {t} = useTranslation(['common']);

  return (
    <label className='block mt-4'>
      <span className='font-heading text-gray-700'>
        {t('common:studentGroupSelect.label')}
      </span>
      <select
        required
        value={selectedGroup || ''}
        onChange={(e) => onChange(Number(e.target.value))}
        className='w-full px-3 py-2 mt-1 mb-3 leading-tight text-gray-700 border shadow-sm appearance-none cursor-pointer rounded-3xl focus:outline-hidden focus:shadow-outline'>
        <option value='null'>
          {t('common:studentGroupSelect.notInSystem')}
        </option>
        {studentGroups.map((studentGroup) => (
          <option
            key={studentGroup.studentgroupid}
            value={studentGroup.studentgroupid}>
            {studentGroup.group_name}
          </option>
        ))}
      </select>
    </label>
  );
};

export default StudentGroupSelect;
