import React, {useContext, useState} from 'react';
import {toast} from 'react-toastify';
import ServerStatus from '../../components/main/ServerStatus';
import {UserContext} from '../../contexts/UserContext';
import apiHooks from '../../hooks/ApiHooks';
const Feedback: React.FC = () => {
  const {user} = useContext(UserContext);
  const [feedback, setFeedback] = useState('');
  const [topic, setTopic] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (user) {
      // Handle the submission of the feedback
      try {
        const token: string | null = localStorage.getItem('userToken');
        if (!token) {
          throw new Error('No token available');
        }

        const response = await apiHooks.postUserFeedback(
          {topic, text: feedback, userId: user.userid},
          token,
        );
        toast.success(
          `Thank you for your feedback! It has been submitted successfully.`,
        );
        console.log(response);
      } catch (error) {
        toast.error('An error occurred while submitting your feedback.');
        console.error(error);
      }
    }
    setFeedback('');
    setTopic('');
  };
  const feedbackTopicsByRole = {
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
    admin: ['User Interface / Accessibility', 'Other'],
  };

  const userRole = user?.role;
  let feedbackTopics = [];
  if (userRole) {
    feedbackTopics = feedbackTopicsByRole[userRole];
  }
  return (
    <>
      <div className='p-4 bg-white rounded-lg shadow-md'>
        <h2 className='mb-4 text-xl font-heading'>
          Help us improve, {user?.username} by sharing your feedback.
        </h2>
        <form onSubmit={handleSubmit} className='flex flex-col mb-4'>
          <label htmlFor='feedback-topic' className='sr-only'>
            Feedback Topic
          </label>
          <select
            id='feedback-topic'
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className='p-2 m-2 border rounded'
            required>
            <option value=''>Select a topic</option>
            {feedbackTopics.map((topic, index) => (
              <option key={index} value={topic}>
                {topic}
              </option>
            ))}
          </select>
          <label htmlFor='feedback-text' className='sr-only'>
            Feedback Text
          </label>
          <textarea
            id='feedback-text'
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className='p-2 m-2 border rounded'
            rows={8}
            placeholder='Enter your feedback here...'
            required
          />
          <button
            type='submit'
            className='px-4 py-2 m-4 font-heading text-white transition rounded bg-metropoliaMainOrange hover:bg-metropoliaSecondaryOrange focus:outline-none focus:shadow-outline'>
            Submit
          </button>
        </form>
      </div>
      <ServerStatus />
    </>
  );
};

export default Feedback;
