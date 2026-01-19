import React from 'react';
import { TFunction } from 'i18next';

interface StaffRoleSelectProps {
  roles: {
    name: string;
    roleid: number;
    role: string;
  }[];
  roleid: number;
  setRoleId: React.Dispatch<React.SetStateAction<number>>;
  t: TFunction<'admin'>;
}

const StaffRoleSelect: React.FC<StaffRoleSelectProps> = ({
                                                           roles,
                                                           roleid,
                                                           setRoleId,
                                                           t,
                                                         }) => {
  return (
    <div className='flex flex-col items-start justify-center mt-4'>
      <label
        htmlFor='staffRole'
        className='mb-1 mr-2 text-metropolia-main-grey font-heading'>
        {t('admin:newUser.staffRole')}
      </label>
      <select
        title={t('admin:newUser.staffRolTitle')}
        className='w-full px-4 py-2.5 mb-3 text-metropolia-main-grey border border-gray-300 shadow-sm appearance-none cursor-pointer rounded-lg focus:outline-none focus:ring-2 focus:ring-metropolia-main-orange focus:border-transparent'
        id='role'
        value={roleid}
        onChange={(e) => {
          setRoleId(parseInt(e.target.value));
        }}>
        <option value='' disabled>
          {t('admin:newUser.staffRolTitle')}
        </option>
        {roles.map((role) => (
          <option key={role.roleid} value={role.roleid}>
            {role.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default StaffRoleSelect;
