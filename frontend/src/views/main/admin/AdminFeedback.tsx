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
import React, {useEffect, useState} from 'react';
import {toast} from 'react-toastify';
import apiHooks from '../../../api';
import {useTranslation} from 'react-i18next';
import Loader from '../../../utils/Loader';
interface FeedbackItem {
  feedbackId: number;
  text: string;
  timestamp: string;
  topic: string;
  userid: number;
  email: string;
}

const AdminFeedback = () => {
  const {t} = useTranslation(['admin']);
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
        console.log('🚀 ~ .then ~ response:', response);
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

  const formatDateTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className='w-full min-h-screen px-4 py-8 bg-white sm:px-6 lg:px-8'>
      <h1 className='mb-8 text-2xl text-center sm:text-3xl font-heading'>
        {t('admin:feedback.title')}
      </h1>

      <div className='max-w-4xl p-4 mx-auto bg-white rounded-lg shadow-xs sm:p-6'>
        <div className='flex flex-col items-center mb-6 space-y-4'>
          <p className='text-lg text-center sm:text-xl font-body'>
            {t('admin:feedback.filterFeedback')}:
          </p>
          <select
            title={t('admin:feedback.topic')}
            className='w-full p-2 text-base text-white transition-colors duration-200 rounded-lg sm:w-2/3 sm:text-lg font-heading bg-metropolia-trend-green hover:bg-metropolia-trend-green/90 focus:outline-hidden focus:ring-2 focus:ring-metropolia-trend-green focus:ring-offset-2'
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

        <div className='max-h-[calc(100vh-20rem)] overflow-y-auto px-2 sm:px-4'>
          {loading ? (
            <div className='flex justify-center py-8'>
                <Loader />
            </div>
          ) : feedback.length > 0 ? (
            <div className='space-y-4'>
              {feedback
                .filter(
                  (item) =>
                    selectedTopic === null || item.topic === selectedTopic,
                )
                .map((item: FeedbackItem) => (
                  <Accordion
                    key={item.feedbackId}
                    className='overflow-hidden border rounded-lg border-metropolia-main-orange/20'
                    style={{backgroundColor: '#ff5000'}}>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon className='text-white' />}
                      className='hover:bg-metropolia-main-orange/90'>
                      <div className='flex flex-col w-full gap-1 pr-4'>
                        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between'>
                          <Typography className='text-sm text-white sm:text-base font-body'>
                            {item.topic}
                          </Typography>
                          <Typography className='text-xs text-white sm:text-sm font-body'>
                            {item.email}
                          </Typography>
                        </div>
                        <Typography className='text-xs text-white/80 font-body'>
                          {formatDateTime(item.timestamp)}
                        </Typography>
                      </div>
                    </AccordionSummary>
                    <AccordionDetails className='p-4 bg-white'>
                      <Typography className='mb-4 text-sm break-words sm:text-base font-body'>
                        {item.text}
                      </Typography>
                      <div className='flex justify-end'>
                        <button
                          className='px-4 py-2 text-sm text-white transition-colors duration-200 rounded-lg sm:text-base font-heading bg-metropolia-support-red hover:bg-metropolia-support-secondary-red focus:outline-hidden focus:ring-2 focus:ring-metropolia-support-red focus:ring-offset-2'
                          onClick={() => handleClickOpen(item.feedbackId)}>
                          {t('admin:common.delete')}
                        </button>
                      </div>
                    </AccordionDetails>
                  </Accordion>
                ))}
            </div>
          ) : (
            <p className='py-8 text-center text-gray-600 font-body'>
              {t('admin:feedback.noFeedbackAvailable')}
            </p>
          )}
        </div>

        <Dialog
          open={open}
          onClose={handleClose}
          className='rounded-lg'
          PaperProps={{
            className: 'rounded-lg p-4',
          }}>
          <DialogTitle className='text-lg sm:text-xl font-heading'>
            {t('admin:common.confirmDelete')}
          </DialogTitle>
          <DialogContent>
            <DialogContentText className='font-body'>
              {t('admin:feedback.confirmDelete')}
            </DialogContentText>
          </DialogContent>
          <DialogActions className='p-4'>
            <button
              className='px-4 py-2 text-sm text-white transition-colors duration-200 rounded-lg sm:text-base font-heading bg-metropolia-main-orange hover:bg-metropolia-secondary-orange focus:outline-hidden focus:ring-2 focus:ring-metropolia-main-orange focus:ring-offset-2'
              onClick={handleClose}>
              {t('admin:common.cancel')}
            </button>
            <button
              className='px-4 py-2 text-sm text-white transition-colors duration-200 rounded-lg sm:text-base font-heading bg-metropolia-support-red hover:bg-metropolia-support-secondary-red focus:outline-hidden focus:ring-2 focus:ring-metropolia-support-red focus:ring-offset-2'
              onClick={handleConfirmDelete}
              autoFocus>
              {t('admin:common.delete')}
            </button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminFeedback;
