import { MultilingualValue } from '@/lib/api/apiService';

export const getLocaleText = (
  value: MultilingualValue | undefined,
  locale: string,
): string => {
  if (!value) return '';
  return locale === 'ru' ? value.ru : value.uz;
};
