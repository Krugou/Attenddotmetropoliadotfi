import { useTranslation } from 'react-i18next';

export const useSearchFields = () => {
  const { t } = useTranslation(['admin']);

  return [
    { value: 'all', label: t('admin:ui.allFields') },
    { value: 'last_name', label: t('admin:users.lastName') },
    { value: 'first_name', label: t('admin:users.firstName') },
    { value: 'email', label: t('admin:users.email') },
    { value: 'username', label: t('admin:users.username') },
    { value: 'role', label: t('admin:users.role') },
  ];
};
