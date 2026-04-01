import { useTranslation } from 'react-i18next';

export default function LanguageToggle() {
  const { i18n } = useTranslation();

  const toggle = () => {
    const newLang = i18n.language === 'es' ? 'en' : 'es';
    i18n.changeLanguage(newLang);
  };

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md bg-gray-100 hover:bg-gray-200 transition-colors"
    >
      <span className={i18n.language === 'en' ? 'font-bold' : 'text-gray-500'}>EN</span>
      <span className="text-gray-400">|</span>
      <span className={i18n.language === 'es' ? 'font-bold' : 'text-gray-500'}>ES</span>
    </button>
  );
}
