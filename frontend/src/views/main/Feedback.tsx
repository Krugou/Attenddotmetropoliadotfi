import React, {useContext, useState} from 'react';
import {toast} from 'react-toastify';
import ServerStatus from '../../components/main/ServerStatus';
import {UserContext} from '../../contexts/UserContext';
import apiHooks from '../../hooks/ApiHooks';
import {useTranslation} from 'react-i18next';

/**
 * Interface defining the structure of feedback topics by user role
 */
interface FeedbackTopicsByRole {
  [key: string]: string[];
}

/**
 * Feedback Component
 *
 * Provides a form interface for users to submit feedback based on their role.
 * Supports multiple feedback topics and includes internationalization.
 *
 * Features:
 * - Role-based feedback topics
 * - Input validation
 * - Internationalization support
 * - Error handling
 * - Success notifications
 *
 * @component
 * @example
 * ```tsx
 * <Feedback />
 * ```
 */
const Feedback: React.FC = () => {
  const {user} = useContext(UserContext);
  const [feedback, setFeedback] = useState('');
  const [topic, setTopic] = useState('');
  const {t, i18n} = useTranslation();

  /**
   * Handles the submission of feedback
   *
   * @param {React.FormEvent} event - The form submission event
   * @throws {Error} When no token is available
   * @async
   */
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (user) {
      try {
        const token: string | null = localStorage.getItem('userToken');
        if (!token) {
          throw new Error('No token available');
        }

        // Include current language in the feedback submission
        const response = await apiHooks.postUserFeedback(
          {
            topic,
            text: feedback,
            userId: user.userid,
          },
          token,
        );

        toast.success(
          t(
            'feedback.submitSuccess',
            'Your feedback has been submitted successfully!',
          ),
        );
        console.log(response);
      } catch (error) {
        toast.error(
          t(
            'feedback.submitError',
            'An error occurred while submitting your feedback.',
          ),
        );
        console.error(error);
      }
    }
    setFeedback('');
    setTopic('');
  };

  /**
   * Mapping of feedback topics available to each user role
   */
  const feedbackTopicsByRole: FeedbackTopicsByRole = {
    student: [
      'Qr Code Scanning',
      'User Interface / Accessibility',
      'Attendance info',
      'Other',
    ],
    teacher: [
      'User Interface / Accessibility',
      'Course Creation',
      'Lecture Creation',
      'Attendance gathering',
      'Course/Student info',
      'Attendance info',
      'Other',
    ],
    counselor: [
      'User Interface / Accessibility',
      'Course/Student info',
      'Attendance info',
      'Other',
    ],
    admin: [
      'User Interface / Accessibility',
      'Course Creation',
      'Lecture Creation',
      'Attendance gathering',
      'Course/Student info',
      'Attendance info',
      'Qr Code Scanning',
      'Other',
    ],
  };

  const userRole = user?.role;
  let feedbackTopics: string[] = [];
  if (userRole) {
    feedbackTopics = feedbackTopicsByRole[userRole];
  }
  return (
    <>
      <div className='p-4 bg-white rounded-lg shadow-md'>
        <h2 className='mb-4 text-xl font-heading'>
          {t(
            'feedback.header',
            'Help us improve, {{username}} by sharing your feedback.',
            {
              username: user?.username,
            },
          )}
        </h2>
        <form onSubmit={handleSubmit} className='flex flex-col mb-4'>
          <label htmlFor='feedback-topic' className='sr-only'>
            {t('feedback.topicLabel', 'Feedback Topic')}
          </label>
          <select
            id='feedback-topic'
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className='p-2 m-2 border rounded'
            required>
            <option value=''>
              {t('feedback.selectTopic', 'Select a topic')}
            </option>
            {feedbackTopics.map((topic, index) => (
              <option key={index} value={topic}>
                {t(`feedback.topics.${topic}`, topic).toString()}
              </option>
            ))}
          </select>
          <label htmlFor='feedback-text' className='sr-only'>
            {t('feedback.textLabel', 'Feedback Text')}
          </label>
          <textarea
            id='feedback-text'
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className='p-2 m-2 border rounded'
            rows={8}
            placeholder={t(
              'feedback.placeholder',
              'Enter your feedback here...',
            )}
            required
          />
          <button
            type='submit'
            className='px-4 py-2 m-4 text-white transition rounded font-heading bg-metropoliaMainOrange hover:bg-metropoliaSecondaryOrange focus:outline-none focus:shadow-outline'>
            {t('feedback.submit', 'Submit')}
          </button>
        </form>
      </div>
      <ServerStatus />
    </>
  );
};

export default Feedback;
