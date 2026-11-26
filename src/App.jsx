import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import SuperAdminLogin from './pages/super-admin/SuperAdminLogin';
import SuperAdminDashboard from './pages/super-admin/SuperAdminDashboard';
import PlansManagement from './pages/super-admin/PlansManagement';
import PlanForm from './pages/super-admin/PlanForm';
import TenantsManagement from './pages/super-admin/TenantsManagement';
import OnboardAdmin from './pages/super-admin/OnboardAdmin';
import EditTenant from './pages/super-admin/EditTenant';
import ExtendSubscription from './pages/super-admin/ExtendSubscription';
import TenantDetails from './pages/super-admin/TenantDetails';
import GlobalSettings from './pages/super-admin/GlobalSettings';
import AddOnPacksManagement from './pages/super-admin/AddOnPacksManagement';

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('saas_token');
  if (!token) {
    return <Navigate to="/super-admin/login" replace />;
  }
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/super-admin" replace />} />
      <Route path="/super-admin/login" element={<SuperAdminLogin />} />

      {/* Protected Super Admin Routes */}
      <Route
        path="/super-admin"
        element={
          <ProtectedRoute>
            <SuperAdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/super-admin/plans"
        element={
          <ProtectedRoute>
            <PlansManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/super-admin/plans/new"
        element={
          <ProtectedRoute>
            <PlanForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/super-admin/plans/:id/edit"
        element={
          <ProtectedRoute>
            <PlanForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/super-admin/tenants"
        element={
          <ProtectedRoute>
            <TenantsManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/super-admin/tenants/new"
        element={
          <ProtectedRoute>
            <OnboardAdmin />
          </ProtectedRoute>
        }
      />
      <Route
        path="/super-admin/tenants/:id"
        element={
          <ProtectedRoute>
            <TenantDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/super-admin/tenants/:id/edit"
        element={
          <ProtectedRoute>
            <EditTenant />
          </ProtectedRoute>
        }
      />
      <Route
        path="/super-admin/tenants/:id/extend"
        element={
          <ProtectedRoute>
            <ExtendSubscription />
          </ProtectedRoute>
        }
      />
      <Route
        path="/super-admin/addons"
        element={
          <ProtectedRoute>
            <AddOnPacksManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/super-admin/settings"
        element={
          <ProtectedRoute>
            <GlobalSettings />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/super-admin" replace />} />
    </Routes>
  );
}
