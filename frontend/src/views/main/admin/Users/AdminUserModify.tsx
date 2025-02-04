import React, {useContext, useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';
import {toast} from 'react-toastify';
import EditUserView from '../../../../components/main/admin/EditUserView';
import {UserContext} from '../../../../contexts/UserContext';
import apiHooks from '../../../../api';
import {useTranslation} from 'react-i18next';
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
  const {t} = useTranslation();
  const {userid} = useParams<{userid: string}>();
  const {user} = useContext(UserContext);
  const [modifyUser, setModifyUser] = useState<User | null>(null);

  useEffect(() => {
    if (user) {
      // Get token from local storage
      const token: string | null = localStorage.getItem('userToken');
      if (!token) {
        toast.error(t('notifications.error'));
        return;
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
          toast.error(t('notifications.loadingError'));
        }
      };

      // Call the async function
      ModifyUserData();
    }
  }, [user, userid, t]);
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
      toast.error(t('notifications.sessionExpired'));
      return;
    }

    try {
      toast.info(t('notifications.savingChanges'));
      const response = await apiHooks.updateUser(token, editedUser);
      toast.success(t('notifications.saveSuccess'));
    } catch (error) {
      toast.error(t('notifications.saveError'));
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
