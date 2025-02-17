import React, {useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import {useTranslation} from 'react-i18next';

/**
 * ErrorAlertProps interface represents the structure of the ErrorAlert props.
 * It includes properties for the error alert message and a function to close the alert.
 */
interface ErrorAlertProps {
  backToLogin?: boolean;
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
const ErrorAlert: React.FC<ErrorAlertProps> = ({
  backToLogin,
  alert,
  onClose,
}) => {
  const navigate = useNavigate();
  const {t} = useTranslation(['common']);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && alert) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [alert, onClose]);

  if (!alert) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center'>
      {/* Backdrop */}
      <div
        className='fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity'
        onClick={onClose}
        aria-hidden='true'
      />

      {/* Modal */}
      <div
        role='alertdialog'
        aria-modal='true'
        aria-labelledby='error-title'
        className='relative w-full max-w-md transform transition-all p-6 mx-4 bg-white rounded-xl shadow-2xl'>
        {/* Header */}
        <div className='flex items-center gap-3 mb-4'>
          <div className='p-2 rounded-full bg-metropolia-support-red/10'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='w-6 h-6 text-metropolia-support-red'
              viewBox='0 0 20 20'
              fill='currentColor'>
              <path
                fillRule='evenodd'
                d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
                clipRule='evenodd'
              />
            </svg>
          </div>
          <h2
            id='error-title'
            className='text-xl font-bold text-metropolia-support-red font-heading'>
            {t('common:errorAlert.title')}
          </h2>
        </div>

        {/* Content */}
        <div className='mb-6'>
          <p className='text-gray-700'>{alert}</p>
        </div>

        {/* Actions */}
        <div className='flex justify-end gap-3'>
          {backToLogin && (
            <button
              onClick={() => {
                navigate('/login');
                onClose();
              }}
              className='px-4 py-2 text-sm font-medium text-white transition-colors bg-metropolia-support-blue hover:bg-metropolia-support-blue-dark focus:outline-none focus:ring-2 focus:ring-metropolia-support-blue focus:ring-offset-2 rounded-md'>
              {t('common:errorAlert.backToLogin')}
            </button>
          )}
          <button
            onClick={onClose}
            className='px-4 py-2 text-sm font-medium text-white transition-colors bg-metropolia-support-red hover:bg-metropolia-support-red-dark focus:outline-none focus:ring-2 focus:ring-metropolia-support-red focus:ring-offset-2 rounded-md'>
            {t('common:errorAlert.close')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorAlert;
