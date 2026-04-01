import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { projectsApi } from '../api/projects';
import { formatMXN } from '../utils/currency';

export default function Dashboard() {
  const { t } = useTranslation();
  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: projectsApi.list,
  });

  const inProgress = projects.filter((p: any) => p.status === 'in_progress').length;
  const completed = projects.filter((p: any) => p.status === 'complete').length;

  if (isLoading) {
    return <div className="text-gray-500">{t('common.loading')}</div>;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('dashboard.title')}</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <p className="text-sm text-gray-500">{t('dashboard.totalProjects')}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{projects.length}</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <p className="text-sm text-gray-500">{t('dashboard.inProgress')}</p>
          <p className="text-3xl font-bold text-primary-600 mt-1">{inProgress}</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <p className="text-sm text-gray-500">{t('dashboard.completed')}</p>
          <p className="text-3xl font-bold text-green-600 mt-1">{completed}</p>
        </div>
      </div>

      {/* Recent Projects */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">{t('dashboard.recentProjects')}</h2>
        </div>
        {projects.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500 mb-4">{t('dashboard.noProjects')}</p>
            <Link
              to="/projects/new"
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
            >
              {t('dashboard.createFirst')}
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {projects.map((project: any) => (
              <Link
                key={project.id}
                to={`/projects/${project.id}`}
                className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div>
                  <p className="font-medium text-gray-900">{project.name}</p>
                  <p className="text-sm text-gray-500">
                    {t(`project.types.${project.project_type}`)} &middot; {project.location}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    project.status === 'complete' ? 'bg-green-100 text-green-800' :
                    project.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {t(`project.statuses.${project.status}`)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
