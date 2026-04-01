import { useTranslation } from 'react-i18next';
import LanguageToggle from './LanguageToggle';
import { useProjectStore } from '../../store/projectStore';

export default function Header() {
  const { t } = useTranslation();
  const toggleAssistant = useProjectStore((s) => s.toggleAssistant);

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div>
        <h1 className="text-lg font-semibold text-primary-700">{t('app.title')}</h1>
        <p className="text-xs text-gray-500">{t('app.subtitle')}</p>
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={toggleAssistant}
          className="px-3 py-1.5 text-sm font-medium rounded-md bg-primary-50 text-primary-700 hover:bg-primary-100 transition-colors"
        >
          {t('assistant.title')}
        </button>
        <LanguageToggle />
      </div>
    </header>
  );
}
