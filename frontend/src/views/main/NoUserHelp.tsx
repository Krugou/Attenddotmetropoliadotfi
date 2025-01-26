import React from 'react';
import {useTranslation} from 'react-i18next';
/**
 * NoUserHelp component that displays help sections for users who haven't logged in.
 * Includes sections about getting started, common issues, and contact information.
 *
 * @returns {JSX.Element} The rendered NoUserHelp component
 */
const NoUserHelp: React.FC = () => {
  const {t} = useTranslation();

  return (
    <div className='max-w-4xl p-6 mx-auto space-y-8'>
      {/* Main heading */}
      <h1 className='mb-8 text-3xl font-heading text-metropoliaMainGrey dark:text-metropoliaSupportWhite'>
        {t('help.title', 'Help Center')}
      </h1>

      {/* Getting Started Section */}
      <section className='p-6 rounded-lg shadow-md bg-metropoliaSupportWhite dark:bg-metropoliaMainGrey-dark'>
        <h2 className='mb-4 text-2xl font-heading text-metropoliaMainGrey dark:text-metropoliaSupportWhite'>
          {t('help.gettingStarted.title', 'Getting Started')}
        </h2>
        <div className='space-y-4 font-body'>
          <p className='text-metropoliaMainGrey dark:text-metropoliaSupportWhite'>
            {t(
              'help.gettingStarted.description',
              'To use this application, you need to have:',
            )}
          </p>
          <ul className='ml-4 list-disc list-inside text-metropoliaMainGrey dark:text-metropoliaSupportWhite'>
            <li>{t('help.gettingStarted.item1', 'Metropolia credentials')}</li>
            <li>
              {t(
                'help.gettingStarted.item2',
                'Access to Metropolia network or VPN',
              )}
            </li>
            <li>
              {t(
                'help.gettingStarted.item3',
                'Google Chrome browser (recommended for best experience)',
              )}
            </li>
          </ul>
          <p className='p-4 mt-2 rounded-lg text-metropoliaMainGrey bg-metropoliaMainGrey-dark/10 dark:bg-metropoliaMainGrey dark:text-metropoliaSupportWhite'>
            {t(
              'help.gettingStarted.pwa',
              'This application is built as a Progressive Web App (PWA) optimized for Chrome. For the best experience, we recommend using Chrome browser where you can install it as a desktop application. On mobile devices, you can add the app to your home screen: on Android, tap the menu (⋮) and select "Add to Home screen", on iOS tap the share button and choose "Add to Home Screen".',
            )}
          </p>
        </div>
      </section>

      {/* Common Issues Section */}
      <section className='p-6 rounded-lg shadow-md bg-metropoliaSupportWhite dark:bg-metropoliaMainGrey-dark'>
        <h2 className='mb-4 text-2xl font-heading text-metropoliaMainGrey dark:text-metropoliaSupportWhite'>
          {t('help.commonIssues.title', 'Common Issues')}
        </h2>
        <div className='space-y-4 font-body'>
          <div className='pb-4 border-b border-metropoliaMainGrey/20 dark:border-metropoliaSupportWhite/20'>
            <h3 className='font-semibold text-metropoliaMainGrey dark:text-metropoliaSupportWhite'>
              {t('help.commonIssues.login.title', 'Cannot Log In?')}
            </h3>
            <p className='text-metropoliaMainGrey dark:text-metropoliaSupportWhite'>
              {t(
                'help.commonIssues.login.description',
                'Make sure you are connected to Metropolia network or VPN',
              )}
            </p>
          </div>
          <div className='pb-4 border-b border-metropoliaMainGrey/20 dark:border-metropoliaSupportWhite/20'>
            <h3 className='font-semibold text-metropoliaMainGrey dark:text-metropoliaSupportWhite'>
              {t('help.commonIssues.connection.title', 'Connection Issues?')}
            </h3>
            <p className='text-metropoliaMainGrey dark:text-metropoliaSupportWhite'>
              {t(
                'help.commonIssues.connection.description',
                'Check your internet connection and try refreshing the page',
              )}
            </p>
          </div>
          <div className='pb-4 border-b border-metropoliaMainGrey/20 dark:border-metropoliaSupportWhite/20'>
            <h3 className='font-semibold text-metropoliaMainGrey dark:text-metropoliaSupportWhite'>
              {t('help.commonIssues.iphone.title', 'Issues with iPhone?')}
            </h3>
            <p className='text-metropoliaMainGrey dark:text-metropoliaSupportWhite'>
              {t(
                'help.commonIssues.iphone.description',
                'If using an iPhone, make sure to disable iCloud Private Relay as it may interfere with VPN connectivity. You can disable it in Settings > Apple ID > iCloud > Private Relay.',
              )}
            </p>
          </div>
        </div>
      </section>

      {/* Contact Support Section */}
      <section className='p-6 rounded-lg shadow-md bg-metropoliaSupportWhite dark:bg-metropoliaMainGrey-dark'>
        <h2 className='mb-4 text-2xl font-heading text-metropoliaMainGrey dark:text-metropoliaSupportWhite'>
          {t('help.contact.title', 'Need More Help?')}
        </h2>
        <div className='space-y-4 font-body'>
          <p className='text-metropoliaMainGrey dark:text-metropoliaSupportWhite'>
            {t(
              'help.contact.description',
              'If you need additional assistance, please contact Metropolia IT support:',
            )}
          </p>
          <div className='p-4 rounded-lg bg-metropoliaMainGrey/5 dark:bg-metropoliaMainGrey'>
            <p className='text-metropoliaMainGrey dark:text-metropoliaSupportWhite'>
              {t('help.contact.email', 'Email: kimmo.sauren@metropolia.fi')}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default NoUserHelp;
