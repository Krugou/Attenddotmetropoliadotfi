import React from 'react';
import {useTranslation} from 'react-i18next';

/**
 * SuccessAlertProps interface represents the structure of the SuccessAlert props.
 * It includes properties for the success alert message and a function to close the alert.
 */
interface SuccessAlertProps {
  successAlert: string;
  onClose: () => void;
}
/**
 * SuccessAlert component.
 * This component is responsible for displaying a success alert message.
 * It uses the successAlert and onClose props to determine the message and what happens when the alert is closed.
 * The alert is displayed in a modal that is centered on the screen.
 * The modal contains a title, the success message, and a close button.
 * The visibility of the modal is controlled by the successAlert prop.
 * If the successAlert prop is truthy, the modal is displayed; otherwise, it is hidden.
 *
 * @param {SuccessAlertProps} props The props that define the success alert message and the close function.
 * @returns {JSX.Element} The rendered SuccessAlert component.
 */
const SuccessAlert: React.FC<SuccessAlertProps> = ({successAlert, onClose}) => {
  const {t} = useTranslation(['translation']);

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center ${
        successAlert ? 'block' : 'hidden'
      }`}>
      <div className='p-4 mx-auto mt-10 bg-green-100 rounded-lg shadow-lg modal-container w-96'>
        <h2 className='mb-4 text-xl font-heading text-green-600'>
          {t('translation:successAlert.title')}
        </h2>
        <div className='mb-4'>
          {successAlert && <p className='text-green-700'>{successAlert}</p>}
        </div>
        <div className='flex justify-end'>
          <button
            onClick={onClose}
            className='px-4 py-2 font-semibold text-white bg-green-500 rounded-sm hover:bg-green-600'>
            {t('translation:common.close')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessAlert;
