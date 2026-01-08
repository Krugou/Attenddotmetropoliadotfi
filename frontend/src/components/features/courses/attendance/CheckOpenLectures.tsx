import React, {useContext, useEffect, useState} from 'react';
import NavigationCard from '../../../ui/cards/NavigationCard.tsx';
import {UserContext} from '../../../../contexts/UserContext.tsx';
import apiHooks from '../../../../api';
import {useTranslation} from 'react-i18next';
import HowToRegIcon from '@mui/icons-material/HowToReg'

interface Lecture {
  lectureid: number;
  topicname: string;
  code: string;
  [key: string]: any;
}

const CheckOpenLectures: React.FC = () => {
  const {user} = useContext(UserContext);
  const {t} = useTranslation(['common']);
  const [openLectures, setOpenLectures] = useState<Lecture[]>([]);

  useEffect(() => {
    const token: string | null = localStorage.getItem('userToken');
    if (!token) {
      throw new Error('No token available');
    }
    if (user) {
      const fetchOpenLectures = async () => {
        try {
          const lectures = await apiHooks.getOpenLecturesByTeacher(
            user.userid,
            token,
          );
          console.log('🚀 ~ fetchOpenLectures ~ TeacherLectures:', lectures);
          setOpenLectures(lectures);
        } catch (error) {
          console.error('Failed to fetch open TeacherLectures:', error);
        }
      };

      fetchOpenLectures();
    }
  }, []);

  if (openLectures.length === 0) {
    return null;
  }

  return (
    <>
      {openLectures.map((lecture: Lecture) => (
        <NavigationCard
          icon={HowToRegIcon}
          key={lecture.lectureid}
          path={`/teacher/attendance/${lecture.lectureid}`}
          title={t('openLectureCard.title')}
          description={t('openLectureCard.subtitle', {code: lecture.code,
            topic: lecture.topicname,})}
          className="animate-pulse"
        />
      ))}
    </>
  );
};

export default CheckOpenLectures;

/*import React, {useContext, useEffect, useState} from 'react';
import NavigationCard from '../../navigation/NavigationCard.tsx';
import {UserContext} from '../../../../contexts/UserContext.tsx';
import apiHooks from '../../../../api';
import {useTranslation} from 'react-i18next'; // Import useTranslation

interface Lecture {
  lectureid: number;
  topicname: string;
  code: string;
  [key: string]: any;
}

const CheckOpenLectures: React.FC = () => {
  const {user} = useContext(UserContext);
  const {t} = useTranslation(['common']); // Initialize useTranslation
  const [openLectures, setOpenLectures] = useState<Lecture[]>([]);

  useEffect(() => {
    const token: string | null = localStorage.getItem('userToken');
    if (!token) {
      throw new Error('No token available');
    }
    if (user) {
      const fetchOpenLectures = async () => {
        try {
          const lectures = await apiHooks.getOpenLecturesByTeacher(
            user.userid,
            token,
          );
          console.log('🚀 ~ fetchOpenLectures ~ TeacherLectures:', lectures);
          setOpenLectures(lectures);
        } catch (error) {
          console.error('Failed to fetch open TeacherLectures:', error);
        }
      };

      fetchOpenLectures();
    }
  }, []);

  return openLectures.length > 0
    ? openLectures.map((lecture: Lecture) => (
        <NavigationCard
          key={lecture.lectureid}
          path={`/teacher/attendance/${lecture.lectureid}`}
          title={t('ui:openLectureCard.title', {
            code: lecture.code,
            topic: lecture.topicname,
          })}
          description={t('ui:openLectureCard.description')}
          className='animate-pulse'
        />
      ))
    : null;
};

export default CheckOpenLectures;*/
