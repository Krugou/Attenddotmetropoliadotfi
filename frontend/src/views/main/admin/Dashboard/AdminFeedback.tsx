import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import React, {useEffect, useState} from 'react';
import {toast} from 'react-toastify';
import apiHooks from '../../../../api';
import {useTranslation} from 'react-i18next';
import Loader from '../../../../utils/Loader';

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
  const [expandedId, setExpandedId] = useState<number | null>(null);

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

  const toggleAccordion = (feedbackId: number) => {
    setExpandedId(expandedId === feedbackId ? null : feedbackId);
  };

  return (
    <div className='min-h-screen bg-gradient-to-b from-white via-gray-50/50 to-gray-50'>
      <div className='container px-4 py-8 mx-auto space-y-6 max-w-7xl sm:px-6 lg:px-8 lg:py-12'>
        <h1 className='text-2xl font-bold tracking-tight text-center text-metropolia-main-grey sm:text-3xl md:text-4xl font-heading'>
          {t('admin:feedback.title')}
        </h1>

        <div className='overflow-hidden bg-white rounded-2xl shadow-lg ring-1 ring-black/5 backdrop-blur-sm'>
          <div className='p-4 sm:p-6 lg:p-8'>
            {/* Filter Section */}
            <div className='max-w-2xl mx-auto mb-8'>
              <p className='mb-3 text-base font-medium text-center text-metropolia-main-grey/80 font-body sm:text-lg'>
                {t('admin:feedback.filterFeedback')}:
              </p>
              <select
                title={t('admin:feedback.topic')}
                className='w-full p-3 text-sm text-white transition-all duration-300 ease-in-out rounded-lg cursor-pointer sm:text-base font-heading bg-metropolia-trend-green hover:bg-metropolia-trend-green-dark focus:ring-4 focus:ring-metropolia-trend-green/20 focus:outline-none active:scale-[0.98]'
                onChange={(e) => handleTopicChange(e.target.value)}>
                <option value=''>All Topics</option>
                {feedback &&
                  [...new Set(feedback.map((item) => item.topic))].map(
                    (topic) => (
                      <option key={topic} value={topic}>
                        {topic}
                      </option>
                    ),
                  )}
              </select>
            </div>

            {/* Feedback List */}
            <div className='px-0 overflow-y-auto sm:px-4 max-h-[calc(100vh-24rem)] scrollbar-thin scrollbar-thumb-metropolia-main-orange/20 scrollbar-track-transparent'>
              {loading ? (
                <div className='flex items-center justify-center py-12'>
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
                      <div
                        key={item.feedbackId}
                        className='overflow-hidden transition-all duration-300 ease-in-out border rounded-xl shadow-sm group border-metropolia-main-orange/10 hover:shadow-md hover:border-metropolia-main-orange/20'>
                        <button
                          onClick={() => toggleAccordion(item.feedbackId)}
                          className='flex items-center justify-between w-full p-4 text-left bg-gradient-to-r from-metropolia-main-orange to-metropolia-secondary-orange hover:from-metropolia-main-orange-dark hover:to-metropolia-secondary-orange-dark transition-all duration-300'>
                          <div className='flex flex-col w-full gap-2 pr-4'>
                            <div className='flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center sm:gap-4'>
                              <span className='text-base font-medium text-white sm:text-lg font-body'>
                                {item.topic}
                              </span>
                              <span className='text-sm text-white/90 font-body'>
                                {item.email}
                              </span>
                            </div>
                            <span className='text-xs tracking-wide text-white/80 font-body sm:text-sm'>
                              {formatDateTime(item.timestamp)}
                            </span>
                          </div>
                          <ExpandMoreIcon
                            className={`text-white transition-transform duration-300 ease-in-out group-hover:scale-110 ${
                              expandedId === item.feedbackId ? 'rotate-180' : ''
                            }`}
                          />
                        </button>
                        <div
                          className={`transition-all duration-300 ease-in-out ${
                            expandedId === item.feedbackId
                              ? 'max-h-96 opacity-100'
                              : 'max-h-0 opacity-0'
                          }`}>
                          <div className='p-4 bg-white sm:p-6'>
                            <p className='mb-6 text-sm leading-relaxed break-words sm:text-base font-body text-metropolia-main-grey'>
                              {item.text}
                            </p>
                            <div className='flex justify-end'>
                              <button
                                className='px-4 py-2 text-sm font-medium text-white transition-all duration-300 ease-in-out rounded-lg shadow-sm sm:px-5 sm:py-2.5 sm:text-base font-heading bg-metropolia-support-red hover:bg-metropolia-support-secondary-red focus:ring-4 focus:ring-metropolia-support-red/20 focus:outline-none hover:shadow-md active:scale-95'
                                onClick={() =>
                                  handleClickOpen(item.feedbackId)
                                }>
                                {t('admin:common.delete')}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className='flex flex-col items-center justify-center py-16'>
                  <p className='text-base text-center sm:text-lg text-metropolia-main-grey/60 font-body'>
                    {t('admin:feedback.noFeedbackAvailable')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        {open && (
          <div className='fixed inset-0 z-50 flex items-center justify-center'>
            <div
              className='fixed inset-0 bg-black/40 backdrop-blur-sm'
              onClick={handleClose}></div>
            <div className='relative w-full max-w-md p-0 mx-4 overflow-hidden bg-white rounded-xl shadow-xl'>
              <div className='p-5 text-lg font-bold border-b sm:text-xl font-heading bg-metropolia-support-red/5 text-metropolia-support-red border-metropolia-support-red/10'>
                {t('admin:common.confirmDelete')}
              </div>
              <div className='p-5 sm:p-6'>
                <p className='text-sm sm:text-base font-body text-metropolia-main-grey'>
                  {t('admin:feedback.confirmDelete')}
                </p>
              </div>
              <div className='flex justify-end gap-3 p-5 pt-0 sm:p-6 sm:pt-0'>
                <button
                  className='px-4 py-2 text-sm font-medium transition-all duration-300 ease-in-out rounded-lg shadow-sm sm:px-5 sm:py-2.5 sm:text-base font-heading text-metropolia-main-grey bg-gray-100 hover:bg-gray-200 focus:ring-4 focus:ring-gray-100/50 focus:outline-none active:scale-95'
                  onClick={handleClose}>
                  {t('admin:common.cancel')}
                </button>
                <button
                  className='px-4 py-2 text-sm font-medium text-white transition-all duration-300 ease-in-out rounded-lg shadow-sm sm:px-5 sm:py-2.5 sm:text-base font-heading bg-metropolia-support-red hover:bg-metropolia-support-secondary-red focus:ring-4 focus:ring-metropolia-support-red/20 focus:outline-none active:scale-95'
                  onClick={handleConfirmDelete}
                  autoFocus>
                  {t('admin:common.delete')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminFeedback;
