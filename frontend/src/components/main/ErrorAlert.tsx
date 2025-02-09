import React from 'react';
import {useNavigate} from 'react-router-dom';
import {useTranslation} from 'react-i18next';

/**
 * ErrorAlertProps interface represents the structure of the ErrorAlert props.
 * It includes properties for the error alert message and a function to close the alert.
 */
interface ErrorAlertProps {
  alert: string | null;
  onClose: () => void;
}
/**
 * ErrorAlert component.
 * This component is responsible for displaying an error alert message.
 * It uses the alert and onClose props to determine the message and what happens when the alert is closed.
 * The alert is displayed in a modal that is centered on the screen.
 * The modal contains a title, the error message, and a close button.
 * The visibility of the modal is controlled by the alert prop.
 * If the alert prop is truthy, the modal is displayed; otherwise, it is hidden.
 *
 * @param {ErrorAlertProps} props The props that define the error alert message and the close function.
 * @returns {JSX.Element} The rendered ErrorAlert component.
 */
const ErrorAlert: React.FC<ErrorAlertProps> = ({alert, onClose}) => {
  const navigate = useNavigate();
  const {t} = useTranslation(['translation']);

  return (
    <div
      className={`fixed inset-0 z-10 flex items-center justify-center ${
        alert ? 'block' : 'hidden'
      }`}>
      <div className='p-4 mx-auto mt-10 bg-red-100 rounded-lg shadow-lg modal-container w-96'>
        <h2 className='mb-4 text-xl font-heading text-red-600'>
          {t('translation:errorAlert.title')}
        </h2>
        <div className='mb-4'>
          {alert && <p className='text-red-700'>{alert}</p>}
        </div>
        <div className='flex justify-end'>
          {alert === 'Your session has expired, please login again.' && (
            <button
              onClick={() => {
                navigate('/login');
                onClose();
              }}
              className='px-4 py-2 mr-2 font-semibold text-white bg-blue-500 rounded-sm hover:bg-blue-600'>
              {t('translation:errorAlert.backToLogin')}
            </button>
          )}
          <button
            onClick={onClose}
            className='px-4 py-2 font-semibold text-white bg-red-500 rounded-sm hover:bg-red-600'>
            {t('translation:errorAlert.close')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorAlert;
