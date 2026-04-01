import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectionsApi } from '../api/projections';
import { costsApi } from '../api/costs';
import { formatMXN, formatPercent } from '../utils/currency';
import { useProjectStore } from '../store/projectStore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const SENSITIVITY_COLORS: Record<string, string> = {
  great: 'bg-green-200 text-green-900',
  good: 'bg-green-100 text-green-800',
  neutral: 'bg-yellow-100 text-yellow-800',
  bad: 'bg-red-100 text-red-800',
  terrible: 'bg-red-200 text-red-900',
};

function irrColor(irr: number | null): string {
  if (irr === null) return SENSITIVITY_COLORS.neutral;
  if (irr > 0.20) return SENSITIVITY_COLORS.great;
  if (irr > 0.10) return SENSITIVITY_COLORS.good;
  if (irr > 0) return SENSITIVITY_COLORS.neutral;
  if (irr > -0.10) return SENSITIVITY_COLORS.bad;
  return SENSITIVITY_COLORS.terrible;
}

export default function Projections() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const setAssistantContext = useProjectStore((s) => s.setAssistantContext);

  useEffect(() => { setAssistantContext('projections'); }, [setAssistantContext]);

  const { data: projections = [], isLoading } = useQuery({
    queryKey: ['projections', id],
    queryFn: () => projectionsApi.list(id!),
    enabled: !!id,
  });

  const { data: costSummary } = useQuery({
    queryKey: ['costs-summary', id],
    queryFn: () => costsApi.summary(id!),
    enabled: !!id,
  });

  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    name: 'Base Case',
    projection_months: 36,
    monthly_revenue_mxn: 0,
    monthly_expenses_mxn: 0,
    sale_price_mxn: 0,
    sale_month: 36,
    discount_rate: 0.10,
  });

  const addMutation = useMutation({
    mutationFn: (data: any) => projectionsApi.create(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projections', id] });
      setShowAdd(false);
    },
  });

  const calculateMutation = useMutation({
    mutationFn: (projId: string) => projectionsApi.calculate(id!, projId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projections', id] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (projId: string) => projectionsApi.delete(id!, projId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projections', id] }),
  });

  if (isLoading) return <div className="text-gray-500">{t('common.loading')}</div>;

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('projections.title')}</h1>

      {/* Total Investment Info */}
      {costSummary && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-sm text-blue-800">
          {t('project.totalCost')}: <span className="font-bold">{formatMXN(costSummary.total_mxn)}</span>
        </div>
      )}

      {/* Scenario Cards */}
      {projections.length > 0 && (
        <div className="space-y-6 mb-6">
          {projections.map((proj: any) => (
            <div key={proj.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {/* Scenario Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h2 className="font-semibold text-gray-900">{proj.name}</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => calculateMutation.mutate(proj.id)}
                    disabled={calculateMutation.isPending}
                    className="px-3 py-1.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors"
                  >
                    {calculateMutation.isPending ? t('common.loading') : t('projections.calculate')}
                  </button>
                  <button
                    onClick={() => deleteMutation.mutate(proj.id)}
                    className="px-3 py-1.5 text-red-600 border border-red-200 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
                  >
                    {t('common.delete')}
                  </button>
                </div>
              </div>

              {/* Metrics Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">{t('projections.roi')}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {proj.roi != null ? formatPercent(parseFloat(proj.roi)) : '--'}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">{t('projections.irr')}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {proj.irr != null ? formatPercent(parseFloat(proj.irr)) : '--'}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">{t('projections.months')}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{proj.projection_months}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">{t('projections.salePrice')}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{formatMXN(parseFloat(proj.sale_price_mxn))}</p>
                </div>
              </div>

              {/* Cash Flow Chart */}
              {proj.cash_flows && Array.isArray(proj.cash_flows) && proj.cash_flows.length > 1 && (
                <div className="p-4 border-t border-gray-200">
                  <p className="text-sm font-medium text-gray-700 mb-3">{t('projections.cashFlow')}</p>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={buildCashFlowChartData(proj.cash_flows)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} tickFormatter={(v: number) => `$${(v / 1000000).toFixed(1)}M`} />
                      <Tooltip
                        formatter={(value: number) => formatMXN(value)}
                        labelFormatter={(label: string) => `Month ${label}`}
                      />
                      <Line type="monotone" dataKey="cumulative" stroke="#3B82F6" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Sensitivity Matrix */}
              {proj.sensitivity && proj.sensitivity.irr_matrix && (
                <div className="p-4 border-t border-gray-200">
                  <p className="text-sm font-medium text-gray-700 mb-3">
                    {t('projections.sensitivity')}
                    <span className="text-xs text-gray-400 ml-2">
                      (X: {proj.sensitivity.variable_x}, Y: {proj.sensitivity.variable_y})
                    </span>
                  </p>
                  <div className="overflow-x-auto">
                    <table className="text-xs w-full">
                      <thead>
                        <tr>
                          <th className="p-1.5 bg-gray-100 text-gray-600">%</th>
                          {proj.sensitivity.x_values.map((x: number, i: number) => (
                            <th key={i} className="p-1.5 bg-gray-100 text-gray-600 text-center">
                              {x > 0 ? '+' : ''}{x}%
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {proj.sensitivity.irr_matrix.map((row: (number | null)[], yi: number) => (
                          <tr key={yi}>
                            <td className="p-1.5 bg-gray-100 text-gray-600 font-medium text-center">
                              {proj.sensitivity.y_values[yi] > 0 ? '+' : ''}{proj.sensitivity.y_values[yi]}%
                            </td>
                            {row.map((irr: number | null, xi: number) => (
                              <td key={xi} className={`p-1.5 text-center font-medium ${irrColor(irr)}`}>
                                {irr !== null ? formatPercent(irr) : 'N/A'}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Scenario Details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 border-t border-gray-200 text-sm">
                <div>
                  <span className="text-gray-500">{t('projections.monthlyRevenue')}:</span>
                  <span className="ml-1 font-medium">{formatMXN(parseFloat(proj.monthly_revenue_mxn))}</span>
                </div>
                <div>
                  <span className="text-gray-500">{t('projections.monthlyExpenses')}:</span>
                  <span className="ml-1 font-medium">{formatMXN(parseFloat(proj.monthly_expenses_mxn))}</span>
                </div>
                <div>
                  <span className="text-gray-500">{t('projections.saleMonth')}:</span>
                  <span className="ml-1 font-medium">{proj.sale_month || proj.projection_months}</span>
                </div>
                <div>
                  <span className="text-gray-500">{t('projections.discountRate')}:</span>
                  <span className="ml-1 font-medium">{(parseFloat(proj.discount_rate) * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Scenario Form */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="font-semibold">{t('projections.addScenario')}</h2>
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="px-3 py-1.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
          >
            {showAdd ? t('common.cancel') : t('projections.addScenario')}
          </button>
        </div>

        {showAdd && (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('projections.scenario')}</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('projections.months')}</label>
              <input
                type="number"
                value={form.projection_months}
                onChange={(e) => setForm({ ...form, projection_months: parseInt(e.target.value) || 36 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('projections.monthlyRevenue')}</label>
              <input
                type="number"
                value={form.monthly_revenue_mxn || ''}
                onChange={(e) => setForm({ ...form, monthly_revenue_mxn: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('projections.monthlyExpenses')}</label>
              <input
                type="number"
                value={form.monthly_expenses_mxn || ''}
                onChange={(e) => setForm({ ...form, monthly_expenses_mxn: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('projections.salePrice')}</label>
              <input
                type="number"
                value={form.sale_price_mxn || ''}
                onChange={(e) => setForm({ ...form, sale_price_mxn: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('projections.saleMonth')}</label>
              <input
                type="number"
                value={form.sale_month || ''}
                onChange={(e) => setForm({ ...form, sale_month: parseInt(e.target.value) || 36 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('projections.discountRate')}</label>
              <input
                type="number"
                step="0.5"
                value={(form.discount_rate * 100) || ''}
                onChange={(e) => setForm({ ...form, discount_rate: (parseFloat(e.target.value) || 0) / 100 })}
                placeholder="10.0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="md:col-span-2">
              <button
                onClick={() => addMutation.mutate(form)}
                disabled={addMutation.isPending || !form.name}
                className="w-full py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors"
              >
                {addMutation.isPending ? t('common.loading') : t('common.save')}
              </button>
            </div>
          </div>
        )}

        {projections.length === 0 && !showAdd && (
          <div className="p-8 text-center text-gray-500">{t('projections.noProjections')}</div>
        )}
      </div>
    </div>
  );
}

function buildCashFlowChartData(cashFlows: number[]): { month: number; value: number; cumulative: number }[] {
  let cumulative = 0;
  return cashFlows.map((cf, i) => {
    cumulative += cf;
    return { month: i, value: cf, cumulative };
  });
}
