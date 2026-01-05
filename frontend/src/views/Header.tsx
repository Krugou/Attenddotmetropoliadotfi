import React, {
  useContext,
  useEffect,
  useState,
  useRef,
  MouseEvent as ReactMouseEvent,
} from 'react';
import {Link, useLocation, useNavigate} from 'react-router-dom';
import logo from '../assets/images/metropolia_s_oranssi_en.png';
import ErrorAlert from '../components/ui/modals/ErrorAlert.tsx';
import FirstTimeHereGuide from '../components/ui/FirstTimeHereGuide.tsx';
import {UserContext} from '../contexts/UserContext';
import apiHooks from '../api';
import {useTranslation} from 'react-i18next';
import LanguageSwitcher from '../components/ui/LanguageSwitcher';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();

  type SupportedLanguage = 'fi' | 'en' | 'sv' | null;

  const validateLanguage = (pathLang: string): SupportedLanguage => {
    const supportedLangs = ['fi', 'en', 'sv'];
    if (pathLang === 'login' || !supportedLangs.includes(pathLang)) {
      return null;
    }
    return pathLang as SupportedLanguage;
  };

  const pathParts = location.pathname.split('/');
  const lang: SupportedLanguage = validateLanguage(pathParts[1]);

  const [alert, setAlert] = useState<string | null>('');

  const {user, setUser} = useContext(UserContext);
  const {t, i18n} = useTranslation(['translation']);
  const [currentLanguage, setCurrentLanguage] = useState(
    i18n.language || 'en',
  );

  const handleLanguageChange = (newLang: string) => {
    setCurrentLanguage(newLang);
    i18n.changeLanguage(newLang);
  };

  // --- USER MENU STATE + REFS ---
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const closeTimeoutRef = useRef<number | null>(null);

  const clearCloseTimeout = () => {
    if (closeTimeoutRef.current !== null) {
      window.clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  const scheduleCloseWithDelay = () => {
    clearCloseTimeout();
    closeTimeoutRef.current = window.setTimeout(() => {
      setMenuOpen(false);
    }, 200); // 200 ms viive – voit säätää makusi mukaan
  };

  // Klikkaus nimestä / hampurilaisesta → toggle
  const handleToggleMenu = (e: ReactMouseEvent) => {
    e.stopPropagation();
    clearCloseTimeout();
    setMenuOpen(prev => !prev);
  };

  // Klikkaus valikon itemistä
  const handleMenuItemClick = (path: string) => {
    setMenuOpen(false);
    navigate(path);
  };

  // Klikkaus ulos valikosta
  useEffect(() => {
    if (!menuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [menuOpen]);

  // Tyhjennä mahdollinen timeout unmountissa
  useEffect(() => {
    return () => {
      clearCloseTimeout();
    };
  }, []);

  /**
   * Hakee käyttäjän tiedot tokenilla.
   */
  const getUserInfo = async () => {
    if (location.pathname === '/logout') return;

    const userToken = localStorage.getItem('userToken');

    if (userToken) {
      try {
        const fetchedUser = await apiHooks.getUserInfoByToken(userToken);
        if (fetchedUser) {
          setUser(fetchedUser);
          if (location.pathname === '/') {
            navigate(`/${fetchedUser.role.toLowerCase()}/mainview`);
          }
          return;
        }
      } catch (error) {
        setAlert(
          t(
            'ui:header.sessionExpired',
            'Your session has expired, please login again.',
          ),
        );

        localStorage.removeItem('userToken');
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

  useEffect(() => {
    getUserInfo();
    // suljetaan menu, jos reitti vaihtuu (varmistus)
    setMenuOpen(false);
  }, [location]);

  const displayName =
    (user as any)?.fullName ||
    (user as any)?.name ||
    ((user as any)?.firstName &&
      (user as any)?.lastName &&
      `${(user as any).firstName} ${(user as any).lastName}`) ||
    user?.email ||
    '';

  return (
    <header
      className={`flex items-center border-2 border-b-metropolia-main-orange ${
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
          alt="Metropolia Logo"
          className={`w-48 mb-5 sm:w-32 md:w-48 lg:w-64 h-auto mr-4 ${
            user ? '' : 'w-24'
          }`}
        />
      </Link>

      {import.meta.env.MODE === 'development' && (
        <h1 className="text-lg font-heading">
          {t('ui:header.developmentMode', 'In Development Mode')}
        </h1>
      )}

      {user && (
        <div className="flex items-center justify-center w-full gap-10 p-2 m-2 sm:w-fit">
          {/* Käyttäjänimi + hampurilaisvalikko */}
          <div
            ref={menuRef}
            className="relative flex items-center gap-2 cursor-pointer select-none"
            onMouseEnter={clearCloseTimeout}
            onMouseLeave={scheduleCloseWithDelay}
          >
            <button
              type="button"
              onClick={handleToggleMenu}
              className="flex items-center gap-2 px-3 py-2 rounded-full bg-white shadow-sm border border-gray-200 hover:bg-gray-50"
            >
              <span className="max-w-[180px] truncate">
                {displayName || t('ui:user', 'User')}
              </span>
              {/* Hampurilaisikoni */}
              <span className="flex flex-col justify-center w-5 gap-[3px]">
                <span className="h-[2px] w-full bg-black rounded" />
                <span className="h-[2px] w-full bg-black rounded" />
                <span className="h-[2px] w-full bg-black rounded" />
              </span>
            </button>

            {menuOpen && (
              <div
                className="absolute right-0 top-full mt-2 w-48 rounded-xl bg-white shadow-lg border border-gray-200 z-50"
              >
                <button
                  type="button"
                  onClick={() =>
                    handleMenuItemClick(`/${user.role.toLowerCase()}/profile`)
                  }
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                >
                  {t('ui:header.profile', 'Profile')}
                </button>
                <button
                  type="button"
                  onClick={() => handleMenuItemClick('/logout')}
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                >
                  {t('ui:header.logout', 'Logout')}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {!user && (
        <div className="flex justify-center items-center">
          <LanguageSwitcher
            currentLanguage={currentLanguage}
            onLanguageChange={handleLanguageChange}
            dropdown={true}
          />

          <div className="relative flex items-center justify-center w-full gap-10 p-2 m-2 sm:w-fit">
            {location.pathname.includes('/help') ? (
              <button
                type="button"
                onClick={() => navigate(lang ? `/${lang}/login` : '/login')}
                className="px-4 py-2 rounded-md bg-metropolia-main-orange text-white hover:bg-metropolia-main-orange-dark"
              >
                {t('noUser:navigation.backToLogin', 'Back to Login')}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => navigate(lang ? `/${lang}/help` : '/help')}
                className="px-4 py-2 rounded-md bg-metropolia-main-orange text-white hover:bg-metropolia-main-orange-dark"
              >
                {t('noUser:navigation.help', 'Help')}
              </button>
            )}

            <FirstTimeHereGuide
              message={t(
                'noUser:navigation.helpMessage',
                'Need help? Click the help button above to get started!',
              )}
              position="bottom"
              storageKey="help-guided-seen"
              isFixed={false}
            />
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;


/*import React, {useContext, useEffect, useState} from 'react';
import {Link, useLocation, useNavigate} from 'react-router-dom';
import logo from '../assets/images/metropolia_s_oranssi_en.png';
import ErrorAlert from '../components/ui/modals/ErrorAlert.tsx';
import FirstTimeHereGuide from '../components/ui/FirstTimeHereGuide.tsx';
import NavigationButton from '../components/ui/buttons/NavigationButton.tsx';
import {UserContext} from '../contexts/UserContext';
import apiHooks from '../api';
import {useTranslation} from 'react-i18next';
import LanguageSwitcher from '../components/ui/LanguageSwitcher';

/**
 * Header component.
 * This component is responsible for rendering the header of the application.
 * It also handles user authentication based on the token stored in localStorage.
 */
/*const Header = () => {
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
  /*const getUserInfo = async () => {
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
            'ui:header.sessionExpired',
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
          {t('ui:header.developmentMode', 'In Development Mode')}
        </h1>
      )}
      {user && (
        <div className='flex items-center justify-center w-full gap-10 p-2 m-2 sm:w-fit'>
          <NavigationButton
            path={`/${user.role.toLowerCase()}/profile`}
            label={t('ui:header.profile', 'Profile')}
          />
          <NavigationButton
            path='/logout'
            label={t('ui:header.logout', 'Logout')}
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

export default Header;*/
