import React, {useContext, useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';
import {toast} from 'react-toastify';
import EditUserView from '../../../../components/main/admin/EditUserView';
import {UserContext} from '../../../../contexts/UserContext';
import apiHooks from '../../../../hooks/ApiHooks';
/**
 * User interface.
 * This interface defines the structure of a user object.
 *
 * @interface
 * @property {string} userid - The ID of the user.
 * @property {string | null} username - The username of the user.
 * @property {string} email - The email of the user.
 * @property {number} staff - The staff status of the user.
 * @property {string} first_name - The first name of the user.
 * @property {string} last_name - The last name of the user.
 * @property {string} created_at - The creation date of the user.
 * @property {number} studentnumber - The student number of the user.
 * @property {number} studentgroupid - The student group ID of the user.
 * @property {number} roleid - The role ID of the user.
 * @property {number} GDPR - The GDPR consent status of the user.
 * @property {string} role - The role of the user.
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
 * AdminUserModify component.
 * This component is responsible for rendering the user modification view for an admin.
 * It fetches the user data from the API, and allows the admin to edit and save it.
 * If the data is loading, it renders a loading spinner.
 * If no user data is available, it renders an error message.
 *
 * @returns {JSX.Element} The rendered AdminUserModify component.
 */
const AdminUserModify: React.FC = () => {
  /**
   * User ID parameter from the URL.
   *
   * @type {useParams<{userid: string}>}
   */
  const {userid} = useParams<{userid: string}>();
  /**
   * User context.
   *
   * @type {React.Context<UserContext>}
   */
  const {user} = useContext(UserContext);
  /**
   * State variable for the user to be modified.
   *
   * @type {React.useState<User | null>}
   */
  const [modifyUser, setModifyUser] = useState<User | null>(null);
  /**
   * Effect hook to fetch user data.
   *
   * @type {React.useEffect}
   */
  useEffect(() => {
    if (user) {
      // Get token from local storage
      const token: string | null = localStorage.getItem('userToken');
      if (!token) {
        throw new Error('No token available');
      }

      // Create an async function inside the effect
      const ModifyUserData = async () => {
        try {
          const modifyUser = await apiHooks.fetchUserById(
            Number(userid),
            token,
          );
          setModifyUser(modifyUser[0]);
          console.log(modifyUser[0]);
        } catch (error) {
          console.error('Failed to fetch user data:', error);
          // handle the error appropriately, e.g., show a message to the user
        }
      };

      // Call the async function
      ModifyUserData();
    }
  }, [user, userid]);
  /**
   * Handle save.
   * This function saves the edited user data.
   *
   * @param {User} editedUser - The edited user data.
   */
  const handleSave = async (editedUser: User) => {
    // Get token from local storage
    const token: string | null = localStorage.getItem('userToken');
    if (!token) {
      throw new Error('No token available');
    }

    try {
      const response = await apiHooks.updateUser(token, editedUser);
      toast.success(response.message);
    } catch (error) {
      toast.error('Failed to update user: ' + (error as Error).toString());
      // handle the error appropriately, e.g., show a message to the user
    }
  };
  /**
   * Render the component.
   *
   * @returns {JSX.Element} The rendered JSX element.
   */
  return modifyUser && <EditUserView user={modifyUser} onSave={handleSave} />;
};

export default AdminUserModify;
