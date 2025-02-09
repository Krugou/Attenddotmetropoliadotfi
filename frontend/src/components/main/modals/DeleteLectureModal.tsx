import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import React from 'react';
import {useTranslation} from 'react-i18next';

/**
 * lecture interface represents the structure of a lecture.
 * It includes properties for the teacher's name, start date, and time of day.
 */
interface lecture {
  teacher: string;
  start_date: string;
  timeofday: string;
  code: string;
  topicname: string;
}
/**
 * DeleteLectureModalProps interface represents the structure of the DeleteLectureModal props.
 * It includes properties for the modal's open state, close function, delete function, close lecture function, and the lecture to be deleted.
 */
interface DeleteLectureModalProps {
  open: boolean;
  onClose?: () => void;
  onDelete: () => void;
  onCloseLecture?: () => void;
  lecture?: lecture;
}
/**
 * DeleteLectureModal component.
 * This component is responsible for displaying a modal that allows users to delete a lecture.
 * It uses the open, onClose, onDelete, onCloseLecture, and lecture props to determine the current state of the modal and to handle user interactions.
 * The modal contains a title, a description of the lecture to be deleted, and two buttons: one to delete the lecture and one to close the lecture.
 *
 * @param {DeleteLectureModalProps} props The props that define the state and behavior of the modal.
 * @returns {JSX.Element} The rendered DeleteLectureModal component.
 */
const DeleteLectureModal: React.FC<DeleteLectureModalProps> = ({
  open,
  onClose,
  onDelete,
  lecture,
  onCloseLecture,
}) => {
  console.log(lecture);
  const {t} = useTranslation(['translation']);
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby='alert-dialog-title'
      aria-describedby='alert-dialog-description'>
      <DialogTitle
        className='p-4 text-white bg-metropolia-main-orange'
        id='alert-dialog-title'>
        {t('translation:teacher.deleteLecture.title')}
      </DialogTitle>
      <DialogContent>
        <DialogContentText id='alert-dialog-description'>
          <strong className='pt-4 mb-4 text-lg font-heading'>
            {t('translation:teacher.deleteLecture.subtitle')}
          </strong>
        </DialogContentText>
        <ul className='mb-4 list-disc list-inside'>
          <li>
            {t('translation:teacher.deleteLecture.details.date')}{' '}
            {lecture?.start_date
              ? new Date(lecture?.start_date).toLocaleDateString()
              : ''}
          </li>
          <li>
            {t('translation:teacher.deleteLecture.details.timeOfDay')}{' '}
            {lecture?.timeofday}
          </li>
          <li>
            {t('translation:teacher.deleteLecture.details.teacherEmail')}{' '}
            {lecture?.teacher}
          </li>
          <li>
            {t('translation:teacher.deleteLecture.details.courseCode')}{' '}
            {lecture?.code}
          </li>
          <li>
            {t('translation:teacher.deleteLecture.details.topicName')}{' '}
            {lecture?.topicname}
          </li>
        </ul>
        <DialogContentText id='alert-dialog-description'>
          <strong className='mb-4 text-lg font-heading'>
            {t('translation:teacher.deleteLecture.question')}
          </strong>{' '}
          <br />
          {t('translation:teacher.deleteLecture.explanation')}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <button
          className='w-full p-2 mt-4 text-sm font-heading text-white transition rounded-sm bg-metropolia-main-orange sm:w-fit h-fit hover:bg-metropolia-secondary-orange'
          onClick={onClose}>
          {t('translation:teacher.deleteLecture.buttons.close')}
        </button>
        <button
          className='w-full p-2 mt-4 text-sm font-heading text-white transition rounded-sm bg-metropolia-support-red sm:w-fit h-fit hover:bg-metropolia-support-secondary-red'
          onClick={onDelete}
          autoFocus>
          {t('translation:teacher.deleteLecture.buttons.delete')}
        </button>
        <button
          className='w-full p-2 mt-4 text-sm font-heading text-white transition rounded-sm bg-metropolia-trend-green sm:w-fit h-fit hover:bg-metropolia-main-grey'
          onClick={onCloseLecture}
          autoFocus>
          {t('translation:teacher.deleteLecture.buttons.finish')}
        </button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteLectureModal;
