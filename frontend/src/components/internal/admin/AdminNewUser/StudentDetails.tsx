import React from 'react';
import FormInput from '../../../ui/inputs/FormInput.tsx';
import StudentGroupSelect from '../../../ui/inputs/StudentGroupSelect.tsx';
import { TFunction } from 'i18next';

interface StudentGroup {
  studentgroupid: number;
  group_name: string;
}

interface StudentDetailsProps {
  studentNumber: string;
  setStudentNumber: (value: string) => void;
  isStudentNumberTaken: boolean;
  studentGroups: StudentGroup[];
  studentGroupId: number | null;
  setStudentGroupId: (id: number | null) => void;
  t: TFunction<['admin']>;
}

const StudentDetails: React.FC<StudentDetailsProps> = ({
                                                         studentNumber,
                                                         setStudentNumber,
                                                         isStudentNumberTaken,
                                                         studentGroups,
                                                         studentGroupId,
                                                         setStudentGroupId,
                                                         t,
                                                       }) => {
  return (
    <>
      <FormInput
        label={t('admin:ui.studentNumber')}
        placeholder='123456'
        value={studentNumber}
        onChange={setStudentNumber}
      />
      {isStudentNumberTaken && (
        <h2 className='text-metropolia-support-red mb-2'>
          {t('admin:newUser.studentNumberTaken')}
        </h2>
      )}
      <StudentGroupSelect
        studentGroups={studentGroups}
        selectedGroup={studentGroupId}
        onChange={setStudentGroupId}
      />
    </>
  );
};

export default StudentDetails;
