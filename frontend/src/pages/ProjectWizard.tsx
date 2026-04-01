import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { templatesApi } from '../api/templates';
import { projectsApi } from '../api/projects';
import clsx from 'clsx';

export default function ProjectWizard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    project_type: 'residential' as string,
    location: '',
    description: '',
    exchange_rate: 17.5,
  });

  const { data: templates = [] } = useQuery({
    queryKey: ['templates'],
    queryFn: templatesApi.list,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => projectsApi.create(data),
    onSuccess: (project) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      navigate(`/projects/${project.id}`);
    },
  });

  const handleTemplateSelect = (template: any) => {
    setSelectedTemplate(template.id);
    setForm((prev) => ({ ...prev, project_type: template.project_type }));
  };

  const handleSubmit = () => {
    createMutation.mutate({
      ...form,
      template_id: selectedTemplate || undefined,
    });
  };

  const steps = [t('project.step1'), t('project.step2')];

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('project.create')}</h1>

      {/* Step Indicator */}
      <div className="flex items-center gap-4 mb-8">
        {steps.map((label, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className={clsx(
              'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
              step === i + 1 ? 'bg-primary-600 text-white' : step > i + 1 ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600',
            )}>
              {i + 1}
            </div>
            <span className="text-sm font-medium text-gray-700">{label}</span>
            {i < steps.length - 1 && <div className="w-12 h-0.5 bg-gray-200" />}
          </div>
        ))}
      </div>

      {/* Step 1: Template Selection */}
      {step === 1 && (
        <div className="space-y-4">
          <div
            onClick={() => { setSelectedTemplate(null); setStep(2); }}
            className={clsx(
              'p-4 rounded-xl border-2 cursor-pointer transition-colors',
              !selectedTemplate ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300',
            )}
          >
            <p className="font-medium">{t('project.noTemplate')}</p>
          </div>
          {templates.map((template: any) => (
            <div
              key={template.id}
              onClick={() => handleTemplateSelect(template)}
              className={clsx(
                'p-4 rounded-xl border-2 cursor-pointer transition-colors',
                selectedTemplate === template.id ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300',
              )}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{template.name}</p>
                  <p className="text-sm text-gray-500 mt-1">{template.description}</p>
                </div>
                <span className="text-xs font-medium px-2 py-1 bg-gray-100 rounded-full">
                  {t(`project.types.${template.project_type}`)}
                </span>
              </div>
            </div>
          ))}
          {selectedTemplate && (
            <button
              onClick={() => setStep(2)}
              className="w-full py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
            >
              {t('common.next')}
            </button>
          )}
        </div>
      )}

      {/* Step 2: Project Details */}
      {step === 2 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('project.name')}</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('project.type')}</label>
            <select
              value={form.project_type}
              onChange={(e) => setForm({ ...form, project_type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {['residential', 'commercial', 'mixed_use', 'agricultural'].map((type) => (
                <option key={type} value={type}>{t(`project.types.${type}`)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('project.location')}</label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="e.g., Guadalajara, Jalisco"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('project.description')}</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('project.exchangeRate')}</label>
            <input
              type="number"
              step="0.01"
              value={form.exchange_rate}
              onChange={(e) => setForm({ ...form, exchange_rate: parseFloat(e.target.value) || 17.5 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {t('common.back')}
            </button>
            <button
              onClick={handleSubmit}
              disabled={!form.name || !form.location || createMutation.isPending}
              className="flex-1 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {createMutation.isPending ? t('common.loading') : t('project.create')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
