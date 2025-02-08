import React from 'react';
import {Link} from 'react-router-dom';
import {UserContext} from '../contexts/UserContext';
import {useTranslation} from 'react-i18next';
import {useIsMobile} from '../hooks/useIsMobile';

/**
 * Footer link configuration
 */
interface FooterLink {
  label: string;
  url: string;
  external?: boolean;
}

const footerLinks: Record<string, FooterLink[]> = {
  metropolia: [
    {label: 'OMA', url: 'https://oma.metropolia.fi', external: true},
    {label: 'Wiki', url: 'https://wiki.metropolia.fi', external: true},
    {label: 'Lukkarit', url: 'https://lukkarit.metropolia.fi', external: true},
  ],
  navigation: [
    {label: 'About', url: '/about'},
    {label: 'Team', url: '/team'},
    {label: 'Help', url: '/help'},
  ],
};

/**
 * `buildDate` is the date when the application was built.
 */
const buildDate: Date = new Date(
  import.meta.env.VITE_REACT_APP_BUILD_DATE as string,
);

/**
 * `currentDate` is the current date.
 */
const currentDate: Date = new Date();

/**
 * `diffTime` is the difference in milliseconds between the current date and the build date.
 */
const diffTime: number = Math.abs(currentDate.getTime() - buildDate.getTime());

/**
 * `diffDays` is the number of full days since the build date.
 */
const diffDays: number = Math.floor(diffTime / (1000 * 60 * 60 * 24));

/**
 * `diffHours` is the number of full hours past the last full day.
 */
const diffHours: number = Math.floor((diffTime / (1000 * 60 * 60)) % 24);

/**
 * `Footer` is a React functional component that renders the footer of the application.
 * It displays the copyright year, the developer's name, and the build date and time since build date in the title of the developer's name.
 */
const Footer: React.FC = () => {
  const {user} = React.useContext(UserContext);
  const {t} = useTranslation();
  const isMobile = useIsMobile();

  const buildInfo = `Build date: ${buildDate.toLocaleDateString()}${
    diffDays > 0 ? ` Time since build date: ${diffDays} days` : ''
  }${diffHours > 0 ? ` and ${diffHours} hours` : ''}`;

  const renderLinks = (links: FooterLink[]) => (
    <ul className='p-0 list-none'>
      {links.map((link, index) => (
        <li key={index} className='mb-2'>
          {link.external ? (
            <a
              href={link.url}
              target='_blank'
              rel='noopener noreferrer'
              className='text-white transition-colors duration-200 hover:text-gray-200'>
              {link.label}
            </a>
          ) : (
            <Link
              to={link.url}
              className='text-white transition-colors duration-200 hover:text-gray-200'>
              {link.label}
            </Link>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <footer className='px-8 py-4 text-white bg-metropolia-main-orange'>
      {user || isMobile ? (
        // Logged in view or mobile view
        <div className='text-center'>
          <p className='mb-2 font-bold font-heading'>
            © {new Date().getFullYear()} {t('footer.appName')}
          </p>
          <p title={buildInfo}>
            {t('footer.developedBy')}{' '}
            <Link to={`/${user?.role || ''}/team`}>JAK</Link>
          </p>
        </div>
      ) : (
        // Desktop view for non-logged in users
        <div className='flex justify-between mx-auto'>
          <div>
            <h3 className='mb-4 text-lg font-bold font-heading'>
              {t('footer.metropolia')}
            </h3>
            {renderLinks(footerLinks.metropolia)}
          </div>
          <div className='mb-4 text-center'>
            <p className='mb-2 font-bold font-heading'>
              © {new Date().getFullYear()} {t('footer.appName')}
            </p>
            <p title={buildInfo}>{t('footer.developedBy')} JAK</p>
          </div>
          <div>
            <h3 className='mb-4 text-lg font-bold font-heading'>
              {t('footer.navigation')}
            </h3>
            {renderLinks(footerLinks.navigation)}
          </div>
        </div>
      )}
    </footer>
  );
};

export default Footer;
