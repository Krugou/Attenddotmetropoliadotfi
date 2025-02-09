import React from 'react';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Modal from '@mui/material/Modal';
import TextField from '@mui/material/TextField';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import {useTranslation} from 'react-i18next';

/**
 * EditTopicsModalProps interface represents the structure of the EditTopicsModal props.
 * It includes properties for the modal's open state, course name, new topic, course topics, modified topics,
 * functions to handle topic change, delete topic, reset data, save changes, and user's role and course id.
 */
interface EditTopicsModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  courseName: string;
  newTopic: string;
  setNewTopic: (newTopic: string) => void;
  courseTopics: string[];
  setCourseTopics: (courseTopics: string[]) => void;
  modifiedTopics: string[];
  handleTopicChange: (topic: string) => void;
  handleDeleteTopic: (topic: string) => void;
  resetData: () => void;
  handleSave?: (usercourseid) => void;
  counselor?: boolean;
  usercourseid?: number;
}
/**
 * EditTopicsModal component.
 * This component is responsible for displaying a modal that allows users to edit the topics of a course.
 * It uses the props to determine the current state of the modal and the course, and to handle user interactions.
 * The modal contains a form that allows users to add new topics, check or uncheck existing topics, and delete topics.
 * The form also includes a reset button to reset the form to its initial state, and a save button to save the changes.
 * The visibility and functionality of some elements in the form depend on the user's role.
 *
 * @param {EditTopicsModalProps} props The props that define the state and behavior of the modal.
 * @returns {JSX.Element} The rendered EditTopicsModal component.
 */
const EditTopicsModal: React.FC<EditTopicsModalProps> = ({
  open,
  setOpen,
  courseName,
  newTopic,
  setNewTopic,
  courseTopics,
  setCourseTopics,
  modifiedTopics,
  handleTopicChange,
  handleDeleteTopic,
  resetData,
  counselor,
  handleSave,
  usercourseid,
}) => {
  const {t} = useTranslation(['translation']);

  return (
    <Modal
      open={open}
      onClose={() => setOpen(false)}
      onClick={(e) => e.stopPropagation()}>
      <div className='p-4 bg-white rounded-sm shadow-lg max-w-lg mx-auto mt-10'>
        <h2 className='text-2xl mb-4'>
          {t('translation:editTopics.title', {courseName})}
        </h2>
        {!counselor && (
          <TextField
            value={newTopic}
            onChange={(e) => setNewTopic(e.target.value)}
            label={t('translation:editTopics.newTopicLabel')}
            variant='outlined'
            className='mb-6'
            fullWidth
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position='end'>
                  <IconButton
                    onClick={() => {
                      if (newTopic.trim() !== '') {
                        setCourseTopics([...courseTopics, newTopic]);
                        setNewTopic('');
                      }
                    }}>
                    <AddIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        )}

        {courseTopics.map((topic, index) => (
          <div key={index} className='flex items-center mb-2 mt-3'>
            <Checkbox
              checked={modifiedTopics.includes(topic)}
              onChange={() => handleTopicChange(topic)}
            />
            <p className='grow'>{topic}</p>
            {!counselor && (
              <IconButton onClick={() => handleDeleteTopic(topic)}>
                <DeleteIcon />
              </IconButton>
            )}
          </div>
        ))}
        {counselor ? (
          <p className='text-sm text-gray-500 mb-4'>
            {t('translation:editTopics.counselorHelpText')}
          </p>
        ) : (
          <p className='text-sm text-gray-500 mb-4'>
            {t('translation:editTopics.teacherHelpText')}
          </p>
        )}
        <div className='flex justify-between mt-6'>
          <button
            onClick={resetData}
            className='p-2 text-white rounded-sm transition hover:bg-red-700 bg-metropolia-support-red'>
            {t('translation:common.reset')}
          </button>
          {counselor && (
            <button
              onClick={() => handleSave && handleSave(usercourseid)}
              className='p-2 text-white rounded-sm transition hover:bg-green-600 bg-metropolia-trend-green'>
              {t('translation:editTopics.saveTopics')}
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default EditTopicsModal;
