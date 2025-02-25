import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {FI, GB, SE} from 'country-flag-icons/react/3x2';

interface LanguageSwitcherProps {
  currentLanguage: string;
  onLanguageChange: (language: string) => void;
  buttonClassName?: string;
  activeButtonClassName?: string;
  inactiveButtonClassName?: string;
  dropdown?: boolean;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  currentLanguage,
  onLanguageChange,
  buttonClassName = 'p-1 rounded',
  activeButtonClassName = 'bg-metropolia-main-orange',
  inactiveButtonClassName = 'bg-metropolia-main-grey',
  dropdown = false,
}) => {
  const {t} = useTranslation(['common']);
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    {code: 'en', Flag: GB, name: 'English'},
    {code: 'fi', Flag: FI, name: 'Suomi'},
    {code: 'sv', Flag: SE, name: 'Svenska'},
  ];

  if (dropdown) {
    const currentLang = languages.find((lang) => lang.code === currentLanguage);
    const CurrentFlag = currentLang?.Flag;

    return (
      <div className='relative'>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className='flex items-center gap-2 p-2 text-sm font-medium rounded hover:bg-metropolia-main-orange/10 focus:outline-none'
          aria-expanded={String(isOpen)}
          aria-haspopup='true'>
          {CurrentFlag && (
            <CurrentFlag className='w-6 h-4' aria-hidden='true' />
          )}
          <span>{currentLang?.name}</span>
        </button>

        {isOpen && (
          <div className='absolute z-10 w-48 mt-1 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none'>
            <div className='py-1'>
              {languages.map(({code, Flag, name}) => (
                <button
                  key={code}
                  onClick={() => {
                    onLanguageChange(code);
                    setIsOpen(false);
                  }}
                  className='flex items-center w-full gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-metropolia-main-orange/10'>
                  <Flag className='w-6 h-4' aria-hidden='true' />
                  <span>{name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className='flex gap-2'>
      {languages.map(({code, Flag}) => (
        <button
          key={code}
          onClick={() => onLanguageChange(code)}
          className={`${buttonClassName} ${
            currentLanguage === code
              ? activeButtonClassName
              : inactiveButtonClassName
          }`}
          title={t(`common:languages.flags.${code}`)}
          aria-label={t(`common:languages.flags.${code}`)}>
          <Flag className='w-6 h-4' aria-hidden='true' />
        </button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;
