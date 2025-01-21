import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
} from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import React, {useEffect, useState} from 'react';
import {toast} from 'react-toastify';
import apiHooks from '../../../hooks/ApiHooks';
import {useTranslation} from 'react-i18next';
interface FeedbackItem {
  feedbackId: number;
  text: string;
  timestamp: string;
  topic: string;
  userid: number;
  email: string;
}

const AdminFeedback = () => {
  const {t} = useTranslation();
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const handleTopicChange = (topic: string) => {
    setSelectedTopic(topic === '' ? null : topic);
  };
  useEffect(() => {
    setLoading(true);
    const token: string | null = localStorage.getItem('userToken');
    if (!token) {
      throw new Error('No token available');
    }
    apiHooks
      .getUserFeedback(token)
      .then((response) => {
        setFeedback(response);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching feedback:', error);
        setLoading(false);
      });
  }, []);
  const handleClickOpen = (feedbackId: number) => {
    setOpen(true);
    setDeleteId(feedbackId);
  };
  const handleClose = () => {
    setOpen(false);
  };
  const handleConfirmDelete = async () => {
    if (deleteId !== null) {
      await handleDelete(deleteId);
    }
    setOpen(false);
  };
  const handleDelete = async (feedbackId: number) => {
    setLoading(true);
    const token: string | null = localStorage.getItem('userToken');
    if (!token) {
      throw new Error('No token available');
    }
    try {
      await apiHooks.deleteUserFeedback(feedbackId, token);
      setFeedback(
        feedback.filter((item: FeedbackItem) => item.feedbackId !== feedbackId),
      );
      setLoading(false);
      toast.success('Feedback deleted successfully');
    } catch (error) {
      console.error('Error deleting feedback:', error);
      setLoading(false);
      toast.error('Error deleting feedback');
    }
  };

  return (
    <div className='w-full bg-white'>
      <h1 className='p-3 m-auto mb-10 text-3xl font-heading text-center rounded-lg w-fit'>
        {t('admin.feedback.title')}
      </h1>
      <div className='flex flex-col justify-center p-4 m-auto bg-white rounded-lg 2xl:w-1/3 md:w-2/3 w-fit'>
        <div className='flex flex-col items-center justify-center m-2'>
          <p className='mb-2 text-xl text-center'>
            {t('admin.feedback.filterFeedback')}:
          </p>
          <select
            title={t('admin.feedback.topic')}
            className='w-2/3 p-2 my-2 text-xl font-heading text-white rounded cursor-pointer bg-metropoliaTrendGreen focus:outline-none focus:shadow-outline'
            onChange={(e) => handleTopicChange(e.target.value)}>
            <option value=''>All</option>
            {feedback &&
              [...new Set(feedback.map((item) => item.topic))].map((topic) => (
                <option key={topic} value={topic}>
                  {topic}
                </option>
              ))}
          </select>
        </div>
        <div className='max-h-[25em] pl-5 pr-5 pb-5 overflow-y-scroll'>
          {loading ? (
            <CircularProgress />
          ) : feedback.length > 0 ? (
            feedback
              .filter(
                (item) =>
                  selectedTopic === null || item.topic === selectedTopic,
              )
              .map((item: FeedbackItem) => (
                <Accordion
                  key={item.feedbackId}
                  style={{backgroundColor: '#ff5000', color: '#F5F5F5'}}
                  className='w-full mb-5'>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls='panel1a-content'
                    id='panel1a-header'
                    className='border border-white'>
                    <Typography>
                      {item.topic} - {item.email}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails className='text-black bg-white'>
                    <Typography className='break-words'>{item.text}</Typography>
                    <div className='flex justify-end'>
                      <button
                        className='p-2 m-2 font-heading text-white transition rounded bg-metropoliaSupportRed hover:hover:bg-metropoliaSupportSecondaryRed focus:outline-none focus:shadow-outline'
                        onClick={() => handleClickOpen(item.feedbackId)}>
                        {t('admin.common.delete')}
                      </button>
                    </div>
                  </AccordionDetails>
                </Accordion>
              ))
          ) : (
            <p className='text-center'>
              {t('admin.feedback.noFeedbackAvailable')}
            </p>
          )}
          <Dialog
            open={open}
            onClose={handleClose}
            aria-labelledby='alert-dialog-title'
            aria-describedby='alert-dialog-description'>
            <DialogTitle id='alert-dialog-title'>
              {'Confirm Delete'}
            </DialogTitle>
            <DialogContent>
              <DialogContentText id='alert-dialog-description'>
                {t('admin.feedback.confirmDelete')}
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <button
                className='p-2 m-2 font-heading text-white transition rounded bg-metropoliaMainOrange hover:hover:bg-metropoliaSecondaryOrange focus:outline-none focus:shadow-outline'
                onClick={handleClose}>
                {t('admin.common.cancel')}
              </button>
              <button
                className='p-2 m-2 font-heading text-white transition rounded bg-metropoliaSupportRed hover:hover:bg-metropoliaSupportSecondaryRed focus:outline-none focus:shadow-outline'
                onClick={handleConfirmDelete}
                autoFocus>
                {t('admin.common.delete')}
              </button>
            </DialogActions>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default AdminFeedback;
