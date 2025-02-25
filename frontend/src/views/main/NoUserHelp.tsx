import React from 'react';
import {useTranslation} from 'react-i18next';
/**
 * NoUserHelp component that displays help sections for users who haven't logged in.
 * Includes sections about getting started, common issues, and contact information.
 *
 * @returns {JSX.Element} The rendered NoUserHelp component
 */
const NoUserHelp: React.FC = () => {
  const {t} = useTranslation(['noUser']);

  return (
    <div className='max-w-4xl p-6 mx-auto space-y-8 rounded-sm bg-metropolia-support-white dark:bg-metropolia-main-grey-dark'>
      {/* Main heading */}
      <h1 className='mb-8 text-3xl font-heading text-metropolia-main-grey dark:text-metropolia-support-white'>
        {t('noUser:help.title', 'Help Center')}
      </h1>

      {/* Getting Started Section */}
      <section className='p-6 rounded-lg shadow-md bg-metropolia-support-white dark:bg-metropolia-main-grey-dark'>
        <h2 className='mb-4 text-2xl font-heading text-metropolia-main-grey dark:text-metropolia-support-white'>
          {t('noUser:help.gettingStarted.title', 'Getting Started')}
        </h2>
        <div className='space-y-4 font-body'>
          <p className='text-metropolia-main-grey dark:text-metropolia-support-white'>
            {t(
              'noUser:help.gettingStarted.description',
              'To use this application, you need to have:',
            )}
          </p>
          <ul className='ml-4 list-disc list-inside text-metropolia-main-grey dark:text-metropolia-support-white'>
            <li>
              {t('noUser:help.gettingStarted.item1', 'Metropolia credentials')}
            </li>
            <li>
              {t(
                'noUser:help.gettingStarted.item2',
                'Access to Metropolia network or VPN',
              )}
            </li>
            <li>
              {t(
                'noUser:help.gettingStarted.item3',
                'Google Chrome browser (recommended for best experience)',
              )}
            </li>
          </ul>
          <p className='p-4 mt-2 rounded-lg text-metropolia-main-grey bg-metropolia-main-grey-dark/10 dark:bg-metropolia-main-grey dark:text-metropolia-support-white'>
            {t(
              'noUser:help.gettingStarted.pwa',
              'This application is built as a Progressive Web App (PWA) optimized for Chrome. For the best experience, we recommend using Chrome browser where you can install it as a desktop application. On mobile devices, you can add the app to your home screen: on Android, tap the menu (⋮) and select "Add to Home screen", on iOS tap the share button and choose "Add to Home Screen".',
            )}
          </p>
        </div>
      </section>

      {/* Common Issues Section */}
      <section className='p-6 rounded-lg shadow-md bg-metropolia-support-white dark:bg-metropolia-main-grey-dark'>
        <h2 className='mb-4 text-2xl font-heading text-metropolia-main-grey dark:text-metropolia-support-white'>
          {t('noUser:help.commonIssues.title', 'Common Issues')}
        </h2>
        <div className='space-y-4 font-body'>
          <div className='pb-4 border-b border-metropolia-main-grey/20 dark:border-metropolia-support-white/20'>
            <h3 className='font-semibold text-metropolia-main-grey dark:text-metropolia-support-white'>
              {t('noUser:help.commonIssues.login.title', 'Cannot Log In?')}
            </h3>
            <p className='text-metropolia-main-grey dark:text-metropolia-support-white'>
              {t(
                'noUser:help.commonIssues.login.description',
                'Make sure you are connected to Metropolia network or VPN',
              )}
            </p>
          </div>
          <div className='pb-4 border-b border-metropolia-main-grey/20 dark:border-metropolia-support-white/20'>
            <h3 className='font-semibold text-metropolia-main-grey dark:text-metropolia-support-white'>
              {t(
                'noUser:help.commonIssues.connection.title',
                'Connection Issues?',
              )}
            </h3>
            <p className='text-metropolia-main-grey dark:text-metropolia-support-white'>
              {t(
                'noUser:help.commonIssues.connection.description',
                'Check your internet connection and try refreshing the page',
              )}
            </p>
          </div>
          <div className='pb-4 border-b border-metropolia-main-grey/20 dark:border-metropolia-support-white/20'>
            <h3 className='font-semibold text-metropolia-main-grey dark:text-metropolia-support-white'>
              {t(
                'noUser:help.commonIssues.iphone.title',
                'Issues with iPhone?',
              )}
            </h3>
            <p className='text-metropolia-main-grey dark:text-metropolia-support-white'>
              {t(
                'noUser:help.commonIssues.iphone.description',
                'If using an iPhone, make sure to disable iCloud Private Relay as it may interfere with VPN connectivity. You can disable it in Settings > Apple ID > iCloud > Private Relay.',
              )}
            </p>
          </div>
          <div className='pb-4 border-b border-metropolia-main-grey/20 dark:border-metropolia-support-white/20'>
            <h3 className='font-semibold text-metropolia-main-grey dark:text-metropolia-support-white'>
              {t(
                'noUser:help.commonIssues.scaling.title',
                'Display Scaling Issues?',
              )}
            </h3>
            <p className='text-metropolia-main-grey dark:text-metropolia-support-white'>
              {t(
                'noUser:help.commonIssues.scaling.description',
                'This website is built using 100% display scaling in mind. If your device uses different scaling settings, the content might appear too big or too small. Adjust your browser zoom or system display scaling for optimal viewing.',
              )}
            </p>
          </div>
        </div>
      </section>

      {/* Contact Support Section */}
      <section className='p-6 rounded-lg shadow-md bg-metropolia-support-white dark:bg-metropolia-main-grey-dark'>
        <h2 className='mb-4 text-2xl font-heading text-metropolia-main-grey dark:text-metropolia-support-white'>
          {t('noUser:help.contact.title', 'Need More Help?')}
        </h2>
        <div className='space-y-4 font-body'>
          <p className='text-metropolia-main-grey dark:text-metropolia-support-white'>
            {t(
              'noUser:help.contact.description',
              'If you need additional assistance, please contact Metropolia support:',
            )}
          </p>
          <div className='p-4 rounded-lg bg-metropolia-main-grey/5 dark:bg-metropolia-main-grey'>
            <p className='text-metropolia-main-grey dark:text-metropolia-support-white'>
              {t(
                'noUser:help.contact.email',
                'Email: kimmo.sauren@metropolia.fi',
              )}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default NoUserHelp;
