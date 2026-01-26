import { useLanguage } from '@/lib/language-context';
import { translate } from '@/lib/translations';

export function useT() {
  const { language } = useLanguage();
  return (key: string) => translate(key, language);
}
