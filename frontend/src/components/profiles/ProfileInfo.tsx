import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {toast} from 'react-toastify';
import apiHooks from '../../hooks/ApiHooks'; // Replace with the correct path to your ApiHooks file
/**
 * ProfileInfoPros interface represents the structure of the ProfileInfo props.
 * It includes a property for the user's information.
 */
interface ProfileInfoPros {
  user: {
    username: string;
    email: string;
    role: string;
    created_at: string;
    first_name: string;
    last_name: string;
  };
}

/**
 * Role interface represents the structure of a role object.
 * It includes properties for the role's ID and name.
 */
interface Role {
  roleid: string;
  name: string;
}
/**
 * ProfileInfo component.
 * This component is responsible for displaying the user's profile information and allowing the user to change their role.
 * It uses the useState and useEffect hooks from React to manage state and side effects.
 * The user's information is passed in as a prop.
 * The component fetches the roles from the API when it is mounted and stores them in a state variable.
 * The user can open a modal to change their role, and the component will call the API to make the change.
 *
 * @param {ProfileInfoPros} props The props that define the user's information.
 * @returns {JSX.Element} The rendered ProfileInfo component.
 */
const ProfileInfo: React.FC<ProfileInfoPros> = ({user}) => {
  // Define navigate
  const Navigate = useNavigate();
  // Define state variables for the modal
  const [open, setOpen] = useState(false);
  // Define state variables for the roles
  const [roles, setRoles] = useState<Role[]>([]);
  // Define state variable for the selected role
  const [selectedRole, setSelectedRole] = useState('');

  // Fetch the roles when the component is mounted
  useEffect(() => {
    const token: string | null = localStorage.getItem('userToken');
    if (!token) {
      throw new Error('No token available');
    }
    const fetchRoles = async () => {
      const roles = await apiHooks.fetchAllRolesSpecial(token);
      setRoles(roles);
      setSelectedRole(roles[0]?.roleid || '');
    };
    fetchRoles();
  }, []);

  const handleOpen = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = () => {
    setOpen(false);
  };

  // Handle the role change
  const handleRoleChange = async () => {
    const token: string | null = localStorage.getItem('userToken');
    if (!token) {
      throw new Error('No token available');
    }
    try {
      // Call the API to change the role
      const response = await apiHooks.changeRoleId(
        user.email,
        selectedRole,
        token,
      );
      if (!response.ok) {
        toast.error(response.error);
      }

      toast.success(response.message + ' please log in again');
      Navigate('/logout');
      handleClose();
    } catch (error) {
      toast.error((error as Error).toString());
      console.error('Failed to change role:', error);
      // handle the error appropriately, e.g., show a message to the user
    }
  };

  return (
    <div className='space-y-5'>
      <p className='flex items-center gap-2'>
        <strong>Name:</strong>{' '}
        <span className='profileStat'>
          {user.first_name + ' ' + user.last_name}
        </span>
      </p>
      <p className='flex items-center gap-2'>
        <strong>Username:</strong>{' '}
        <span className='profileStat'>{user.username}</span>
      </p>
      <p className='flex flex-wrap items-center gap-1 items-base'>
        <strong>Email:</strong>{' '}
        <span className='profileStat w-fit'>{user.email}</span>
      </p>
      <p className='flex items-center gap-2 mt-5'>
        <strong>Account created:</strong>{' '}
        <span className='profileStat'>
          {new Date(user.created_at).toLocaleDateString()}
        </span>
      </p>
      <p className='flex items-center gap-2'>
        <strong>Role:</strong> <span className='profileStat'>{user.role}</span>
        {['counselor', 'teacher'].includes(user.role) && (
          <button
            className='px-2 py-1 font-bold text-white transition rounded bg-metropoliaMainGrey hover:bg-metropoliaTrendLightBlue focus:outline-none focus:shadow-outline'
            onClick={handleOpen}>
            Change
          </button>
        )}
      </p>

      {open && ['counselor', 'teacher'].includes(user.role) && (
        <div className='pb-10 mt-5 border-y-4 border-metropoliaMainOrange pt-7'>
          <h2 className='mb-3 text-lg font-bold sm:text-2xl'>Change Role</h2>
          <select
            title='Role Selection' // Add title attribute here
            className='block w-full px-4 py-3 pr-8 leading-tight text-gray-700 bg-white border border-gray-200 rounded appearance-none cursor-pointer focus:outline-none focus:bg-white focus:border-gray-500'
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}>
            {roles.map((role) => (
              <option value={role.roleid}>{role.name}</option>
            ))}
          </select>
          <div className='flex justify-between gap-10 mt-5'>
            <button
              type='button' // Add type attribute here
              className='px-2 py-1 text-sm font-bold text-white transition bg-red-500 rounded hover:bg-red-700 sm:text-lg sm:py-2 sm:px-4'
              onClick={handleClose}>
              Cancel
            </button>
            <button
              type='button' // Add type attribute here
              className='px-2 py-1 text-sm font-bold text-white transition bg-green-500 rounded hover:bg-green-700 sm:text-lg sm:py-2 sm:px-4'
              onClick={handleRoleChange}>
              Change Role
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileInfo;
