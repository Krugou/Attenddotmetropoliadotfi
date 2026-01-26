import React from 'react';
import SortIcon from '@mui/icons-material/Sort';
import { useNavigate } from 'react-router-dom';
import { User } from '../../../../types/user.ts';

interface UserTableProps {
  filteredUsers: User[];
  sortUsers: (key: keyof User) => void;
  highlightMatch: (text: string | number | undefined, searchTerm: string) => React.ReactNode;
  debouncedSearchTerm: string;
}

/**
 * Displays a sortable table of users.
 * Allows clicking on a row to navigate to user modification view.
 */
const UserTable: React.FC<UserTableProps> = ({
                                               filteredUsers,
                                               sortUsers,
                                               highlightMatch,
                                               debouncedSearchTerm,
                                             }) => {
  const navigate = useNavigate();

  const columns: (keyof User)[] = [
    'first_name',
    'last_name',
    'email',
    'username',
    'role',
    'student_number',
    'created_at',
    'activeStatus',
  ];

  return (
    <div className='relative bg-gradient-to-b from-gray-50 to-gray-100 rounded-lg overflow-hidden shadow-inner border border-gray-200'>
      <div className='relative overflow-y-scroll max-h-96 h-96 scrollbar-thin scrollbar-thumb-metropolia-main-orange scrollbar-track-gray-100'>
        <table className='w-full table-auto'>
          <thead className='sticky top-0 z-10 bg-gradient-to-r from-metropolia-main-orange/90 to-metropolia-secondary-orange/90 text-white shadow-md'>
          <tr>
            {columns.map((key) => (
              <th
                key={key}
                className='px-4 py-3 font-semibold text-left transition-colors'>
                {key}
                <button
                  aria-label={`Sort by ${key}`}
                  className='p-1 ml-2 text-sm rounded-full bg-white/20 hover:bg-white/40 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50 active:scale-95'
                  onClick={() => sortUsers(key)}>
                  <SortIcon className='w-4 h-4' />
                </button>
              </th>
            ))}
          </tr>
          </thead>
          <tbody>
          {filteredUsers.map((user) => (
            <tr
              key={user.userid}
              onClick={() => navigate(`/admin/users/${user.userid}/modify`)}
              className={`hover:bg-gray-200 cursor-pointer transition-colors duration-200 ${
                user.activeStatus === 0
                  ? 'bg-gray-100 text-metropolia-main-grey/70'
                  : ''
              }`}>
              {columns.map((key) => (
                <td key={key} className='px-2 py-2 border'>
                  {key === 'activeStatus' ? (
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user[key] === 1
                          ? 'bg-metropolia-trend-green/20 text-metropolia-trend-green'
                          : 'bg-metropolia-support-red/20 text-metropolia-support-red'
                      }`}>
                        {user[key] === 1 ? 'Active' : 'Inactive'}
                      </span>
                  ) : (
                    highlightMatch(user[key], debouncedSearchTerm)
                  )}
                </td>
              ))}
            </tr>
          ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserTable;
