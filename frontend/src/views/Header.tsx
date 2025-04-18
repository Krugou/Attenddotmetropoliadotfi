import React, {useContext, useEffect, useState} from 'react';
import {Link, useLocation, useNavigate} from 'react-router-dom';
import logo from '../assets/images/metropolia_s_oranssi_en.png';
import ErrorAlert from '../components/main/ErrorAlert';
import FirstTimeHereGuide from '../components/main/FirstTimeHereGuide';
import NavigationButton from '../components/main/buttons/NavigationButton';
import {UserContext} from '../contexts/UserContext';
import apiHooks from '../api';
import {useTranslation} from 'react-i18next';
import LanguageSwitcher from '../components/common/LanguageSwitcher';

/**
 * Header component.
 * This component is responsible for rendering the header of the application.
 * It also handles user authentication based on the token stored in localStorage.
 */
const Header = () => {
  // Get the current location and navigation function from react-router
  const location = useLocation();
  const navigate = useNavigate();
  // if lang params are present use it in help link
  type SupportedLanguage = 'fi' | 'en' | 'sv' | null;

  // Create language validation function
  const validateLanguage = (pathLang: string): SupportedLanguage => {
    const supportedLangs = ['fi', 'en', 'sv'];
    if (pathLang === 'login' || !supportedLangs.includes(pathLang)) {
      return null;
    }
    return pathLang as SupportedLanguage;
  };

  // Extract and validate language from path
  const pathParts = location.pathname.split('/');
  const lang: SupportedLanguage = validateLanguage(pathParts[1]);
  // State for storing any alert messages
  const [alert, setAlert] = useState<string | null>('');

  // Get the current user and the setUser function from the UserContext
  const {user, setUser} = useContext(UserContext);
  const {t, i18n} = useTranslation(['translation']);
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language || 'en');

  const handleLanguageChange = (newLang: string) => {
    setCurrentLanguage(newLang);
    i18n.changeLanguage(newLang);
  };

  /**
   * Function to get the user info based on the token stored in localStorage.
   */
  const getUserInfo = async () => {
    // If the current path is '/logout', don't try to get the user info
    if (location.pathname === '/logout') return;

    // Get the user token from localStorage
    const userToken = localStorage.getItem('userToken');

    // If the user token exists, try to get the user info
    if (userToken) {
      try {
        const user = await apiHooks.getUserInfoByToken(userToken);
        console.log('user', user);

        // If the user info is successfully fetched, set the user
        if (user) {
          setUser(user);
          if (location.pathname === '/') {
            navigate(`/${user.role.toLowerCase()}/mainview`);
          }
          return;
        }
      } catch (error) {
        // If the user info cannot be fetched, remove the token and set the user to null
        setAlert(
          t(
            'common:header.sessionExpired',
            'Your session has expired, please login again.',
          ),
        );

        localStorage.removeItem('userToken');

        // Set the user in the UserContext to null
        setUser(null);
      }
    } else {
      const publicPaths = [
        '/',
        '/login',
        '/help',
        '/team',
        '/about',
        '/fi',
        '/fi/login',
        '/fi/help',
        '/fi/team',
        '/fi/about',
        '/en',
        '/en/login',
        '/en/help',
        '/en/team',
        '/en/about',
        '/sv',
        '/sv/login',
        '/sv/help',
        '/sv/team',
        '/sv/about',
        '/auth/microsoft/callback',
      ];

      if (!publicPaths.includes(location.pathname)) {
        navigate('/login');
      }
    }
  };

  // Call the getUserInfo function when the location changes
  useEffect(() => {
    getUserInfo();
  }, [location]);

  // Render the header
  return (
    <header
      className={`flex items-center border-2  border-b-metropolia-main-orange ${
        user ? 'sm:flex-row flex-col' : ''
      } sm:p-4 p-0 justify-between`}>
      {alert && (
        <ErrorAlert
          backToLogin={true}
          onClose={() => setAlert(null)}
          alert={alert}
        />
      )}
      <Link to={user ? `/${user.role.toLowerCase()}/mainview` : '/'}>
        <img
          src={logo}
          alt='Metropolia Logo'
          className={`w-48 mb-5 sm:w-32 md:w-48 lg:w-64 h-auto mr-4 ${
            user ? '' : 'w-24'
          }`}
        />
      </Link>
      {import.meta.env.MODE === 'development' && (
        <h1 className='text-lg font-heading'>
          {t('common:header.developmentMode', 'In Development Mode')}
        </h1>
      )}
      {user && (
        <div className='flex items-center justify-center w-full gap-10 p-2 m-2 sm:w-fit'>
          <NavigationButton
            path={`/${user.role.toLowerCase()}/profile`}
            label={t('common:header.profile', 'Profile')}
          />
          <NavigationButton
            path='/logout'
            label={t('common:header.logout', 'Logout')}
          />
        </div>
      )}
      {!user && (
        <div className='flex justify-center items-center'>
          <LanguageSwitcher
            currentLanguage={currentLanguage}
            onLanguageChange={handleLanguageChange}
            dropdown={true}
          />

          <div className='relative flex items-center justify-center w-full gap-10 p-2 m-2 sm:w-fit'>
            {location.pathname.includes('/help') ? (
              <NavigationButton
                path={lang ? `/${lang}/login` : '/login'}
                label={t('noUser:navigation.backToLogin', 'Back to Login')}
              />
            ) : (
              <NavigationButton
                path={lang ? `/${lang}/help` : '/help'}
                label={t('noUser:navigation.help', 'Help')}
              />
            )}

            <FirstTimeHereGuide
              message={t(
                'noUser:navigation.helpMessage',
                'Need help? Click the help button above to get started!',
              )}
              position='bottom'
              storageKey='help-guided-seen'
              isFixed={false}
            />
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
