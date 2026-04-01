import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { costsApi } from '../api/costs';
import { projectsApi } from '../api/projects';
import { formatMXN, formatUSD } from '../utils/currency';
import { useProjectStore } from '../store/projectStore';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import CurrencyInput from '../components/shared/CurrencyInput';
import { useEffect } from 'react';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#06B6D4', '#6B7280'];

export default function CostAnalysis() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const setAssistantContext = useProjectStore((s) => s.setAssistantContext);

  useEffect(() => { setAssistantContext('cost_analysis'); }, [setAssistantContext]);

  const { data: project } = useQuery({
    queryKey: ['project', id],
    queryFn: () => projectsApi.get(id!),
    enabled: !!id,
  });

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['costs', id],
    queryFn: () => costsApi.list(id!),
    enabled: !!id,
  });

  const { data: summary } = useQuery({
    queryKey: ['costs-summary', id],
    queryFn: () => costsApi.summary(id!),
    enabled: !!id,
  });

  const [showAdd, setShowAdd] = useState(false);
  const [newItem, setNewItem] = useState({
    category: 'construction',
    subcategory: '',
    description: '',
    amount_mxn: 0,
  });

  const addMutation = useMutation({
    mutationFn: (data: any) => costsApi.create(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['costs', id] });
      queryClient.invalidateQueries({ queryKey: ['costs-summary', id] });
      setShowAdd(false);
      setNewItem({ category: 'construction', subcategory: '', description: '', amount_mxn: 0 });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (costId: string) => costsApi.delete(id!, costId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['costs', id] });
      queryClient.invalidateQueries({ queryKey: ['costs-summary', id] });
    },
  });

  const categories = ['land', 'construction', 'permits', 'fees', 'financing', 'taxes', 'other'];

  const chartData = summary?.by_category?.map((cat: any) => ({
    name: t(`costs.categories.${cat.category}`),
    value: cat.total_mxn,
  })) || [];

  if (isLoading) return <div className="text-gray-500">{t('common.loading')}</div>;

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('costs.title')}</h1>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <p className="text-sm text-gray-500">{t('costs.total')}</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{formatMXN(summary.total_mxn)}</p>
            <p className="text-sm text-gray-500 mt-1">{formatUSD(summary.total_usd)}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <p className="text-sm font-medium text-gray-700 mb-2">{t('costs.breakdown')}</p>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                    {chartData.map((_: any, i: number) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatMXN(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-400 text-sm">{t('costs.noItems')}</p>
            )}
          </div>
        </div>
      )}

      {/* Cost Items Table */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">{t('costs.title')}</h2>
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="px-3 py-1.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
          >
            {t('costs.addItem')}
          </button>
        </div>

        {/* Add Form */}
        {showAdd && (
          <div className="p-4 bg-gray-50 border-b border-gray-200 grid grid-cols-1 md:grid-cols-5 gap-3">
            <select
              value={newItem.category}
              onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{t(`costs.categories.${cat}`)}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder={t('costs.subcategory')}
              value={newItem.subcategory}
              onChange={(e) => setNewItem({ ...newItem, subcategory: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
            <input
              type="text"
              placeholder={t('costs.description')}
              value={newItem.description}
              onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
            <CurrencyInput
              value={newItem.amount_mxn}
              onChange={(v) => setNewItem({ ...newItem, amount_mxn: v })}
              exchangeRate={project?.exchange_rate || 17.5}
            />
            <button
              onClick={() => addMutation.mutate(newItem)}
              disabled={addMutation.isPending || newItem.amount_mxn <= 0}
              className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {t('common.save')}
            </button>
          </div>
        )}

        {/* Table */}
        {items.length === 0 ? (
          <div className="p-8 text-center text-gray-500">{t('costs.noItems')}</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-500">{t('costs.category')}</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">{t('costs.description')}</th>
                <th className="px-4 py-3 text-right font-medium text-gray-500">{t('costs.amountMxn')}</th>
                <th className="px-4 py-3 text-right font-medium text-gray-500">{t('costs.amountUsd')}</th>
                <th className="px-4 py-3 text-center font-medium text-gray-500">{t('costs.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {items.map((item: any) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <span className="font-medium">{t(`costs.categories.${item.category}`)}</span>
                    {item.subcategory && <span className="text-gray-500 ml-1">/ {item.subcategory}</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{item.description}</td>
                  <td className="px-4 py-3 text-right font-medium">{formatMXN(parseFloat(item.amount_mxn))}</td>
                  <td className="px-4 py-3 text-right text-gray-500">{formatUSD(parseFloat(item.amount_usd || 0))}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => deleteMutation.mutate(item.id)}
                      className="text-red-500 hover:text-red-700 text-xs"
                    >
                      {t('costs.delete')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
