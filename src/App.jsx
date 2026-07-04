import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { themeConfig } from './utils/theme';
import { useAuthStore } from './store/authStore';
import { useEffect } from 'react';

// Layout
import { AppLayout } from './components/Layout/AppLayout';

// Pages
import { LoginPage } from './pages/auth/LoginPage';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { UsersPage } from './pages/users/UsersPage';
import { OrgPage } from './pages/org/OrgPage';
import { AnchorsPage } from './pages/anchors/AnchorsPage';
import { LeadsPage } from './pages/leads/LeadsPage';
import { TargetsPage } from './pages/targets/TargetsPage';
import { NbaConfigPage } from './pages/nba/NbaConfigPage';
import { GeofencePage } from './pages/geofence/GeofencePage';
import { SystemConfigPage } from './pages/config/SystemConfigPage';
import { IntegrationsPage } from './pages/integrations/IntegrationsPage';
import { NotificationsPage } from './pages/notifications/NotificationsPage';
import { AuditLogsPage } from './pages/audit/AuditLogsPage';
import { ReportsPage } from './pages/reports/ReportsPage';
import { TrainingPage } from './pages/training/TrainingPage';

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider theme={themeConfig}>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            
            <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="org" element={<OrgPage />} />
              <Route path="anchors" element={<AnchorsPage />} />
              <Route path="leads" element={<LeadsPage />} />
              <Route path="targets" element={<TargetsPage />} />
              <Route path="nba" element={<NbaConfigPage />} />
              <Route path="geofence" element={<GeofencePage />} />
              <Route path="config" element={<SystemConfigPage />} />
              <Route path="integrations" element={<IntegrationsPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="audit-logs" element={<AuditLogsPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="training" element={<TrainingPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
        <Toaster position="top-right" />
      </ConfigProvider>
    </QueryClientProvider>
  );
}
