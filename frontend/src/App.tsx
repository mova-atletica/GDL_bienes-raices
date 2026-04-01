import { Routes, Route } from 'react-router-dom';
import { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import AppShell from './components/layout/AppShell';
import Dashboard from './pages/Dashboard';
import ProjectWizard from './pages/ProjectWizard';
import ProjectSummary from './pages/ProjectSummary';
import CostAnalysis from './pages/CostAnalysis';
import Valuation from './pages/Valuation';
import Projections from './pages/Projections';
import NotFound from './pages/NotFound';

function App() {
  const { t } = useTranslation();

  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">{t('common.loading')}</div>}>
      <AppShell>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/projects/new" element={<ProjectWizard />} />
          <Route path="/projects/:id" element={<ProjectSummary />} />
          <Route path="/projects/:id/costs" element={<CostAnalysis />} />
          <Route path="/projects/:id/valuation" element={<Valuation />} />
          <Route path="/projects/:id/projections" element={<Projections />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AppShell>
    </Suspense>
  );
}

export default App;
