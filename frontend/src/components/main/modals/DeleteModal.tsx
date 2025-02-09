import React from 'react';
import {useTranslation} from 'react-i18next';

/**
 * DeleteModalProps interface represents the structure of the DeleteModal props.
 * It includes properties for the modal's open state, delete function, close function, and a boolean to check if the user is a student.
 */
interface DeleteModalProps {
  isOpen: boolean;
  onDelete: () => void;
  onClose: () => void;
  student?: boolean;
}
/**
 * DeleteModal component.
 * This component is responsible for displaying a modal that allows users to confirm a delete action.
 * It uses the isOpen, onDelete, onClose, and student props to determine the current state of the modal and to handle user interactions.
 * The modal contains a confirmation message and two buttons: one to cancel the delete action and close the modal, and one to confirm the delete action.
 * The confirmation message and the color of the delete button depend on whether the user is a student.
 *
 * @param {DeleteModalProps} props The props that define the state and behavior of the modal.
 * @returns {JSX.Element | null} The rendered DeleteModal component, or null if the modal is not open.
 */
const DeleteModal: React.FC<DeleteModalProps> = ({
  isOpen,
  onDelete,
  onClose,
  student = false,
}) => {
  const {t} = useTranslation(['translation']);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center'
      onClick={onClose}>
      <div className='fixed inset-0 bg-black opacity-70'></div>
      <div
        className='z-10 w-10/12 p-6 bg-white border-4 border-red-700 rounded-lg shadow-lg lg:w-3/12 sm:w-1/2'
        onClick={(e) => e.stopPropagation()}>
        <h3 className='text-xl font-medium leading-6 text-gray-900'>
          {t('translation:common.deleteModal.title')}
        </h3>
        <div className='mt-2'>
          <p className='text-base text-gray-500'>
            {t(
              student
                ? 'common.deleteModal.messages.student'
                : 'common.deleteModal.messages.course',
            )}
          </p>
        </div>
        <div className='mt-2 bg-white sm:px-6 sm:flex sm:flex-row-reverse'>
          <button
            onClick={onClose}
            className='inline-flex justify-center w-full px-4 py-2 text-base font-medium text-white transition bg-gray-500 border border-transparent rounded-md shadow-xs hover:bg-white hover:text-black focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm'>
            {t('translation:common.deleteModal.buttons.cancel')}
          </button>
          <button
            onClick={onDelete}
            className='inline-flex justify-center w-full px-4 py-2 mt-3 text-base font-medium text-white transition bg-red-700 border border-gray-300 rounded-md shadow-xs hover:text-black hover:bg-gray-50 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm'>
            {t('translation:common.deleteModal.buttons.delete')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
