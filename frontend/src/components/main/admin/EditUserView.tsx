import React, {useEffect, useState} from 'react';
import apihooks from '../../../hooks/ApiHooks';
/**
 * Represents a user in the system.
 */
interface User {
  userid: string;
  username: string | null;
  email: string;
  staff: number;
  first_name: string;
  last_name: string;
  created_at: string;
  studentnumber: number;
  studentgroupid: number;
  roleid: number;
  GDPR: number;
  role: string;
}
/**
 * Represents the props for the `EditUserView` component.
 */
interface EditUserViewProps {
  user: User;
  onSave: (user: User) => void;
}
/**
 * Represents a student group in the system.
 */
interface StudentGroup {
  studentgroupid: number;
  group_name: string;
  // include other properties if they exist
}
/**
 * Represents a role in the system.
 */
interface Role {
  roleid: number;
  name: string;
  // include other properties if they exist
}
/**
 * The EditUserView component allows the user to edit a user's details.
 * @param {EditUserViewProps} props - The props.
 */
const EditUserView: React.FC<EditUserViewProps> = ({user, onSave}) => {
  // State for the edited user, roles, student groups, and whether the student number is taken
  const [editedUser, setEditedUser] = useState(user);
  const [roles, setRoles] = useState<Role[]>([]);
  const [studentGroups, setStudentGroups] = useState<StudentGroup[]>([]);
  const [isStudentNumberTaken, setIsStudentNumberTaken] = useState(false);
  const [isStudentEmailTaken, setIsStudentEmailTaken] = useState(false);
  // State for the original student number and timeout ID
  const [originalStudentEmail] = useState(user.email);
  const [originalStudentNumber] = useState(user.studentnumber);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const [isSaveButtonDisabled, setSaveButtonDisabled] = useState(false);
  const [timeoutId2, setTimeoutId2] = useState<NodeJS.Timeout | null>(null);

  /**
   * Handles changes to the input fields.
   * @param {React.ChangeEvent<HTMLInputElement | HTMLSelectElement>} event - The change event.
   */
  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    let value = event.target.value;
    if (event.target.name === 'studentnumber') {
      value = isNaN(parseInt(value, 10)) ? '' : parseInt(value, 10).toString();
    }
    setEditedUser({
      ...editedUser,
      [event.target.name]: value,
    });
  };

  /**
   * Handles the click event of the save button.
   */
  const handleSaveClick = () => {
    onSave(editedUser);
  };
  // Fetch all roles when the component mounts
  useEffect(() => {
    const getRoles = async () => {
      // Get token from local storage
      const token: string | null = localStorage.getItem('userToken');
      if (!token) {
        throw new Error('No token available');
      }
      const fetchedRoles = await apihooks.fetchAllRoles(token);

      setRoles(fetchedRoles);
    };

    getRoles();
  }, []);

  useEffect(() => {
    setSaveButtonDisabled(isStudentNumberTaken || isStudentEmailTaken);
  }, [isStudentNumberTaken, isStudentEmailTaken]);

  // Check if the student number exists when it changes
  useEffect(() => {
    const checkStudentNumber = async () => {
      const token: string | null = localStorage.getItem('userToken');
      if (!token) {
        throw new Error('No token available');
      }
      if (editedUser.studentnumber !== originalStudentNumber) {
        const response = await apihooks.checkStudentNumberExists(
          editedUser.studentnumber.toString(),
          token,
        );

        setIsStudentNumberTaken(response.exists);
      } else {
        setIsStudentNumberTaken(false);
      }
    };

    if (editedUser.studentnumber) {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      const newTimeoutId = setTimeout(() => {
        checkStudentNumber();
      }, 500);

      setTimeoutId(newTimeoutId);
    }
  }, [editedUser.studentnumber, originalStudentNumber]);

  useEffect(() => {
    const checkStudentEmail = async () => {
      const token: string | null = localStorage.getItem('userToken');
      if (!token) {
        throw new Error('No token available');
      }
      if (editedUser.email !== originalStudentEmail) {
        const response = await apihooks.checkStudentEmailExists(
          editedUser.email,
          token,
        );

        setIsStudentEmailTaken(response.exists);
      } else {
        setIsStudentEmailTaken(false);
      }
    };

    if (editedUser.email) {
      if (timeoutId2) {
        clearTimeout(timeoutId2);
      }

      const newTimeoutId2 = setTimeout(() => {
        checkStudentEmail();
      }, 500);

      setTimeoutId2(newTimeoutId2);
    }
  }, [editedUser.email, originalStudentEmail]);

  // Fetch all student groups when the component mounts
  useEffect(() => {
    const getStudentGroups = async () => {
      // Get token from local storage
      const token: string | null = localStorage.getItem('userToken');
      if (!token) {
        throw new Error('No token available');
      }
      const fetchedStudentGroups = await apihooks.fetchStudentGroups(token);

      setStudentGroups(fetchedStudentGroups);
    };
    getStudentGroups();
  }, []);

  /**
   * Renders the component.
   */
  return (
    <div className='flex flex-col items-center justify-center w-fit'>
      <h1 className='p-3 mb-4 text-2xl font-bold bg-white rounded-lg'>
        Edit User {editedUser.userid}
      </h1>
      <div className='w-full p-5 bg-white rounded-lg'>
        {editedUser.created_at && (
          <div>
            <span className='font-bold text-gray-700'>Created At</span>
            <p className='w-full px-3 py-2 mb-3 leading-tight text-gray-700 border shadow appearance-none rounded-3xl focus:outline-none focus:shadow-outline'>
              {new Date(editedUser.created_at).toISOString().substring(0, 16)}
            </p>
          </div>
        )}
        {editedUser.last_name && (
          <label className='block mt-4'>
            <span className='font-bold text-gray-700'>Last Name</span>
            <input
              required={!!editedUser.last_name}
              type='text'
              name='last_name'
              value={editedUser.last_name}
              onChange={handleInputChange}
              className='w-full px-3 py-2 mb-3 leading-tight text-gray-700 border shadow appearance-none rounded-3xl focus:outline-none focus:shadow-outline'
            />
          </label>
        )}
        {editedUser.first_name && (
          <label className='block mt-4'>
            <span className='font-bold text-gray-700'>First Name</span>
            <input
              required={!!editedUser.first_name}
              type='text'
              name='first_name'
              value={editedUser.first_name}
              onChange={handleInputChange}
              className='w-full px-3 py-2 mb-3 leading-tight text-gray-700 border shadow appearance-none rounded-3xl focus:outline-none focus:shadow-outline'
            />
          </label>
        )}

        {editedUser.email !== undefined && editedUser.email !== null && (
          <label className='block mt-4'>
            <span className='font-bold text-gray-700'>Email</span>
            <input
              required={!!editedUser.email}
              type='email'
              name='email'
              value={editedUser.email}
              onChange={handleInputChange}
              className='w-full px-3 py-2 mb-3 leading-tight text-gray-700 border shadow appearance-none rounded-3xl focus:outline-none focus:shadow-outline'
            />
            {isStudentEmailTaken && (
              <span className='text-red-500'>Student email taken</span>
            )}
          </label>
        )}
        {editedUser.username && (
          <label className='block mt-4'>
            <span className='font-bold text-gray-700'>Username</span>
            <input
              required={!!editedUser.username}
              type='text'
              name='username'
              value={editedUser.username}
              onChange={handleInputChange}
              className='w-full px-3 py-2 mb-3 leading-tight text-gray-700 border shadow appearance-none rounded-3xl focus:outline-none focus:shadow-outline'
            />
          </label>
        )}
        {roles.length > 0 && (
          <label className='block mt-4'>
            <span className='font-bold text-gray-700'>Role</span>
            <select
              required={!!editedUser.roleid}
              name='roleid'
              value={editedUser.roleid}
              onChange={handleInputChange}
              className='w-full px-3 py-2 mb-3 leading-tight text-gray-700 border shadow appearance-none rounded-3xl focus:outline-none focus:shadow-outline'>
              {roles.map((role) => (
                <option key={role.roleid} value={role.roleid}>
                  {role.name}
                </option>
              ))}
            </select>
          </label>
        )}

        {editedUser.GDPR !== undefined && (
          <label className='block mt-4'>
            <span className='font-bold text-gray-700'>GDPR</span>
            <select
              required={editedUser.GDPR !== undefined}
              name='GDPR'
              value={editedUser.GDPR}
              onChange={handleInputChange}
              className='w-full px-3 py-2 mb-3 leading-tight text-gray-700 border shadow appearance-none rounded-3xl focus:outline-none focus:shadow-outline'>
              <option value={0}>Not Accepted</option>
              <option value={1}>Accepted</option>
            </select>
          </label>
        )}

        {editedUser.studentnumber !== undefined &&
          editedUser.studentnumber !== null && (
            <label className='block mt-4'>
              <span className='font-bold text-gray-700'>Student Number</span>
              <input
                type='number'
                name='studentnumber'
                value={editedUser.studentnumber}
                onChange={handleInputChange}
                className='w-full px-3 py-2 mb-3 leading-tight text-gray-700 border shadow appearance-none rounded-3xl focus:outline-none focus:shadow-outline'
              />
              {isStudentNumberTaken && (
                <span className='text-red-500'>Student number taken</span>
              )}
            </label>
          )}

        {editedUser.studentgroupid !== undefined &&
          editedUser.studentgroupid !== null && (
            <label className='block mt-4'>
              <span className='font-bold text-gray-700'>Student Group</span>
              <select
                required={!!editedUser.studentgroupid}
                name='studentgroupid'
                value={editedUser.studentgroupid}
                onChange={handleInputChange}
                className='w-full px-3 py-2 mb-3 leading-tight text-gray-700 border shadow appearance-none rounded-3xl focus:outline-none focus:shadow-outline'>
                {studentGroups.map((studentGroup) => (
                  <option
                    key={studentGroup.studentgroupid}
                    value={studentGroup.studentgroupid}>
                    {studentGroup.group_name}
                  </option>
                ))}
              </select>
            </label>
          )}
        <div className='text-center'>
          <button
            onClick={handleSaveClick}
            disabled={isSaveButtonDisabled}
            className={`mt-4 px-4 w-[10em] py-2 ${
              isSaveButtonDisabled
                ? 'bg-gray-500'
                : 'bg-metropoliaTrendGreen hover:bg-green-600 transition'
            } text-white rounded-md`}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditUserView;
