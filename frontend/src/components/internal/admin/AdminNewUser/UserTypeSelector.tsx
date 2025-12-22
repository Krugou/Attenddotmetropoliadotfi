import React from 'react';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';

interface UserTypeSelectorProps {
  userType: 'staff' | 'student';
  setUserType: (type: 'staff' | 'student') => void;
  t: TFunction<'admin'>;
}

const UserTypeSelector: React.FC<UserTypeSelectorProps> = ({ userType, setUserType }) => {
  const { t } = useTranslation(['admin']);

  return (
    <div className='flex flex-col items-start justify-center mt-4 mb-6 p-4 bg-gray-50 rounded-lg border border-gray-100'>
      <h3 className='mb-2 text-lg font-heading text-metropolia-main-grey'>
        {t('admin:newUser.userType')}
      </h3>
      <p className='mb-4 text-gray-600 text-sm'>
        {t(
          'admin:newUser.selectUserTypeInstruction',
          'Please select whether you want to create a new student or staff member...'
        )}
      </p>
      <div className='w-full flex gap-4 mt-2'>
        <button
          type='button'
          onClick={() => setUserType('student')}
          className={`flex-1 py-3 px-4 rounded-lg transition-all text-center font-medium ${
            userType === 'student'
              ? 'bg-metropolia-main-orange text-white shadow-md'
              : 'bg-gray-100 text-metropolia-main-grey hover:bg-gray-200'
          }`}>
          {t('admin:newUser.optionStudent')}
        </button>
        <button
          type='button'
          onClick={() => setUserType('staff')}
          className={`flex-1 py-3 px-4 rounded-lg transition-all text-center font-medium ${
            userType === 'staff'
              ? 'bg-metropolia-main-orange text-white shadow-md'
              : 'bg-gray-100 text-metropolia-main-grey hover:bg-gray-200'
          }`}>
          {t('admin:newUser.optionTeacher')}
        </button>
      </div>
    </div>
  );
};

export default UserTypeSelector;
