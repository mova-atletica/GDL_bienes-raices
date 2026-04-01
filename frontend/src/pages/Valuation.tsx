import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { valuationsApi } from '../api/valuations';
import { projectsApi } from '../api/projects';
import { formatMXN, formatUSD } from '../utils/currency';
import { useProjectStore } from '../store/projectStore';

export default function Valuation() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const setAssistantContext = useProjectStore((s) => s.setAssistantContext);

  useEffect(() => { setAssistantContext('valuation'); }, [setAssistantContext]);

  const { data: project } = useQuery({
    queryKey: ['project', id],
    queryFn: () => projectsApi.get(id!),
    enabled: !!id,
  });

  const { data: valuations = [], isLoading } = useQuery({
    queryKey: ['valuations', id],
    queryFn: () => valuationsApi.list(id!),
    enabled: !!id,
  });

  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    method: 'cap_rate' as string,
    noi_annual_mxn: 0,
    cap_rate: 0.07,
    estimated_value_mxn: 0,
    notes: '',
  });

  const addMutation = useMutation({
    mutationFn: (data: any) => valuationsApi.create(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['valuations', id] });
      setShowAdd(false);
      setForm({ method: 'cap_rate', noi_annual_mxn: 0, cap_rate: 0.07, estimated_value_mxn: 0, notes: '' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (valId: string) => valuationsApi.delete(id!, valId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['valuations', id] }),
  });

  // Auto-calculate value for cap rate method
  const calculatedValue = form.method === 'cap_rate' && form.noi_annual_mxn > 0 && form.cap_rate > 0
    ? form.noi_annual_mxn / form.cap_rate
    : form.estimated_value_mxn;

  const methodLabels: Record<string, string> = {
    comparable_sales: t('valuation.comparableSales'),
    cap_rate: t('valuation.capRate'),
    income: t('valuation.incomeApproach'),
  };

  if (isLoading) return <div className="text-gray-500">{t('common.loading')}</div>;

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('valuation.title')}</h1>

      {/* Existing Valuations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {valuations.map((val: any) => (
          <div key={val.id} className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex justify-between items-start">
              <p className="text-sm font-medium text-gray-500">{methodLabels[val.method] || val.method}</p>
              <button
                onClick={() => deleteMutation.mutate(val.id)}
                className="text-red-400 hover:text-red-600 text-xs"
              >
                {t('common.delete')}
              </button>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-2">{formatMXN(parseFloat(val.estimated_value_mxn || 0))}</p>
            <p className="text-sm text-gray-500">{formatUSD(parseFloat(val.estimated_value_usd || 0))}</p>
            {val.cap_rate && (
              <p className="text-sm text-gray-600 mt-2">
                {t('valuation.capRateLabel')}: {(parseFloat(val.cap_rate) * 100).toFixed(1)}%
              </p>
            )}
            {val.noi_annual_mxn && (
              <p className="text-sm text-gray-600">
                {t('valuation.noi')}: {formatMXN(parseFloat(val.noi_annual_mxn))}
              </p>
            )}
            {val.notes && <p className="text-xs text-gray-400 mt-2">{val.notes}</p>}
          </div>
        ))}
      </div>

      {/* Add Valuation */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="font-semibold">{t('valuation.addValuation')}</h2>
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="px-3 py-1.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
          >
            {showAdd ? t('common.cancel') : t('valuation.addValuation')}
          </button>
        </div>

        {showAdd && (
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('valuation.method')}</label>
              <select
                value={form.method}
                onChange={(e) => setForm({ ...form, method: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="cap_rate">{t('valuation.capRate')}</option>
                <option value="comparable_sales">{t('valuation.comparableSales')}</option>
                <option value="income">{t('valuation.incomeApproach')}</option>
              </select>
            </div>

            {form.method === 'cap_rate' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('valuation.noi')}</label>
                  <input
                    type="number"
                    value={form.noi_annual_mxn || ''}
                    onChange={(e) => setForm({ ...form, noi_annual_mxn: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('valuation.capRateLabel')}</label>
                  <input
                    type="number"
                    step="0.5"
                    value={(form.cap_rate * 100) || ''}
                    onChange={(e) => setForm({ ...form, cap_rate: (parseFloat(e.target.value) || 0) / 100 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="7.0"
                  />
                </div>
                {calculatedValue > 0 && (
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-sm text-green-700">{t('valuation.estimatedValue')}</p>
                    <p className="text-2xl font-bold text-green-800">{formatMXN(calculatedValue)}</p>
                    <p className="text-sm text-green-600">{formatUSD(calculatedValue / (project?.exchange_rate || 17.5))}</p>
                  </div>
                )}
              </>
            )}

            {form.method !== 'cap_rate' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('valuation.estimatedValue')} (MXN)</label>
                <input
                  type="number"
                  value={form.estimated_value_mxn || ''}
                  onChange={(e) => setForm({ ...form, estimated_value_mxn: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>

            <button
              onClick={() => addMutation.mutate({
                ...form,
                estimated_value_mxn: form.method === 'cap_rate' ? undefined : form.estimated_value_mxn,
              })}
              disabled={addMutation.isPending}
              className="w-full py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors"
            >
              {t('common.save')}
            </button>
          </div>
        )}

        {valuations.length === 0 && !showAdd && (
          <div className="p-8 text-center text-gray-500">{t('valuation.noValuations')}</div>
        )}
      </div>
    </div>
  );
}
