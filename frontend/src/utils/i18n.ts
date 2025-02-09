/**
 * @module i18n
 */

import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';

import enAdmin from '../locales/en/admin.json';
import enStudent from '../locales/en/student.json';
import enTeacher from '../locales/en/teacher.json';
import enCommon from '../locales/en/common.json';
import enCounselor from '../locales/en/counselor.json';
import enNoUser from '../locales/en/noUser.json';
import fiAdmin from '../locales/fi/admin.json';
import fiStudent from '../locales/fi/student.json';
import fiTeacher from '../locales/fi/teacher.json';
import fiCommon from '../locales/fi/common.json';
import fiCounselor from '../locales/fi/counselor.json';
import fiNoUser from '../locales/fi/noUser.json';
import svAdmin from '../locales/sv/admin.json';
import svStudent from '../locales/sv/student.json';
import svTeacher from '../locales/sv/teacher.json';
import svCommon from '../locales/sv/common.json';
import svCounselor from '../locales/sv/counselor.json';
import svNoUser from '../locales/sv/noUser.json';

/**
 * Initialize and configure i18next with translation resources.
 */
i18n
  .use(initReactI18next) // Pass the i18n instance to react-i18next.
  .init({
    resources: {
      en: {
        admin: enAdmin,
        student: enStudent,
        teacher: enTeacher,
        common: {
          ...enCommon,
          openLectureCard: {
            title: 'Open lecture found, code: {{code}} topic: {{topic}} !',
            description: 'Click to continue',
          },
        },
        counselor: enCounselor,
        nouser: enNoUser,
      },
      fi: {
        admin: fiAdmin,
        student: fiStudent,
        teacher: fiTeacher,
        common: {
          ...fiCommon,
          openLectureCard: {
            title: 'Avoin luento löytyi, koodi: {{code}} aihe: {{topic}} !',
            description: 'Klikkaa jatkaaksesi',
          },
        },
        counselor: fiCounselor,
        nouser: fiNoUser,
      },
      sv: {
        admin: svAdmin,
        student: svStudent,
        teacher: svTeacher,
        common: {
          ...svCommon,
          openLectureCard: {
            title:
              'Öppen föreläsning hittades, kod: {{code}} ämne: {{topic}} !',
            description: 'Klicka för att fortsätta',
          },
        },
        counselor: svCounselor,
        nouser: svNoUser,
      },
    },
    lng: 'en', // Default language is English.
    fallbackLng: 'en', // Fallback language is English.
    ns: ['admin', 'student', 'teacher', 'common', 'counselor', 'nouser'], // Namespaces to load
    defaultNS: 'common', // Default namespace
    interpolation: {
      escapeValue: false, // Not escape value, so it allows to use HTML in translations.
    },
  });

/**
 * The i18next instance with the application's translation resources.
 * @type {i18n.i18n}
 */
export default i18n;
