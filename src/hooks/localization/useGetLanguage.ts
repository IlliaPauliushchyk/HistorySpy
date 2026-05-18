import { useTranslation } from 'react-i18next';

export type ILanguage = 'ru' | 'en' | 'be';

export const useGetLanguage = () => {
  const { i18n } = useTranslation();
  const language = i18n.language as ILanguage;

  return language;
};
