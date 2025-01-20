/**
 * @module i18n
 */

import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';

import enTranslation from '../locales/en/translation.json';
import fiTranslation from '../locales/fi/translation.json';
import svTranslation from '../locales/sv/translation.json';

/**
 * Initialize and configure i18next with translation resources.
 */
i18n
  .use(initReactI18next) // Pass the i18n instance to react-i18next.
  .init({
    resources: {
      en: {
        translation: enTranslation,
      },
      fi: {
        translation: fiTranslation,
      },
      sv: {
        translation: svTranslation,
      }, 
    },
    lng: 'en', // Default language is English.
    fallbackLng: 'en', // Fallback language is English.
    interpolation: {
      escapeValue: false, // Not escape value, so it allows to use HTML in translations.
    },
  });

/**
 * The i18next instance with the application's translation resources.
 * @type {i18n.i18n}
 */
export default i18n;
