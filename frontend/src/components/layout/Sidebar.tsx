import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';

export default function Sidebar() {
  const { t } = useTranslation();
  const location = useLocation();

  const links = [
    { to: '/', label: t('nav.dashboard'), icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { to: '/projects/new', label: t('nav.newProject'), icon: 'M12 4v16m8-8H4' },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-lg">GDL</span>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={clsx(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              location.pathname === link.to
                ? 'bg-primary-50 text-primary-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
            )}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d={link.icon} />
            </svg>
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
