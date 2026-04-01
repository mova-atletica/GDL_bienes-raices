import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { projectsApi } from '../api/projects';
import { costsApi } from '../api/costs';
import { valuationsApi } from '../api/valuations';
import { projectionsApi } from '../api/projections';
import { formatMXN, formatUSD, formatPercent } from '../utils/currency';

export default function ProjectSummary() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();

  const { data: project, isLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: () => projectsApi.get(id!),
    enabled: !!id,
  });

  const { data: costSummary } = useQuery({
    queryKey: ['costs-summary', id],
    queryFn: () => costsApi.summary(id!),
    enabled: !!id,
  });

  const { data: valuations = [] } = useQuery({
    queryKey: ['valuations', id],
    queryFn: () => valuationsApi.list(id!),
    enabled: !!id,
  });

  const { data: projections = [] } = useQuery({
    queryKey: ['projections', id],
    queryFn: () => projectionsApi.list(id!),
    enabled: !!id,
  });

  if (isLoading || !project) {
    return <div className="text-gray-500">{t('common.loading')}</div>;
  }

  const sections = [
    {
      title: t('costs.title'),
      to: `/projects/${id}/costs`,
      value: costSummary ? formatMXN(costSummary.total_mxn) : '--',
      subtitle: costSummary ? formatUSD(costSummary.total_usd) : '',
      color: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    {
      title: t('valuation.title'),
      to: `/projects/${id}/valuation`,
      value: valuations.length > 0 ? formatMXN(parseFloat(valuations[0].estimated_value_mxn || 0)) : '--',
      subtitle: valuations.length > 0 ? `${valuations.length} ${t('valuation.method').toLowerCase()}(s)` : '',
      color: 'bg-green-50 text-green-700 border-green-200',
    },
    {
      title: t('projections.title'),
      to: `/projects/${id}/projections`,
      value: projections.length > 0 && projections[0].irr ? formatPercent(parseFloat(projections[0].irr)) + ' IRR' : '--',
      subtitle: projections.length > 0 ? `${projections.length} ${t('projections.scenario').toLowerCase()}(s)` : '',
      color: 'bg-purple-50 text-purple-700 border-purple-200',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Project Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
            <p className="text-gray-500 mt-1">
              {t(`project.types.${project.project_type}`)} &middot; {project.location}
            </p>
            {project.description && (
              <p className="text-gray-600 mt-2 text-sm">{project.description}</p>
            )}
          </div>
          <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
            project.status === 'complete' ? 'bg-green-100 text-green-800' :
            project.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {t(`project.statuses.${project.status}`)}
          </span>
        </div>
        <div className="mt-4 text-sm text-gray-500">
          {t('project.exchangeRate')}: {project.exchange_rate} MXN/USD
        </div>
      </div>

      {/* Section Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sections.map((section) => (
          <Link
            key={section.to}
            to={section.to}
            className={`rounded-xl border p-6 hover:shadow-md transition-shadow ${section.color}`}
          >
            <p className="text-sm font-medium opacity-80">{section.title}</p>
            <p className="text-2xl font-bold mt-2">{section.value}</p>
            {section.subtitle && (
              <p className="text-sm opacity-70 mt-1">{section.subtitle}</p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
