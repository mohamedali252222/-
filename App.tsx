import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './components/layout/DashboardLayout';
import DashboardPage from './pages/DashboardPage';
import ItemsPage from './pages/ItemsPage';
import ProjectsPage from './pages/ProjectsPage';
import ClientsPage from './pages/ClientsPage';
import InvoicesPage from './pages/InvoicesPage';
import SettingsPage from './pages/SettingsPage';
import NotFoundPage from './pages/NotFoundPage';
import InventoryTransactionsPage from './pages/InventoryTransactionsPage';
import UsersPage from './pages/UsersPage';
import LoginPage from './pages/LoginPage';
import AccessDeniedPage from './pages/AccessDeniedPage';
import { DataProvider } from './contexts/DataContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

const AppRoutes: React.FC = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/dashboard" replace />} />
      
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<ProtectedRoute requiredRole='any'><DashboardPage /></ProtectedRoute>} />
        <Route path="items" element={<ProtectedRoute requiredRole={['admin', 'warehouse_manager']}><ItemsPage /></ProtectedRoute>} />
        <Route path="projects" element={<ProtectedRoute requiredRole={['admin', 'warehouse_manager']}><ProjectsPage /></ProtectedRoute>} />
        <Route path="transactions" element={<ProtectedRoute requiredRole={['admin', 'warehouse_manager']}><InventoryTransactionsPage /></ProtectedRoute>} />
        <Route path="clients" element={<ProtectedRoute requiredRole={['admin', 'accountant']}><ClientsPage /></ProtectedRoute>} />
        <Route path="invoices" element={<ProtectedRoute requiredRole={['admin', 'accountant']}><InvoicesPage /></ProtectedRoute>} />
        <Route path="users" element={<ProtectedRoute requiredRole={['admin']}><UsersPage /></ProtectedRoute>} />
        <Route path="settings" element={<ProtectedRoute requiredRole={['admin']}><SettingsPage /></ProtectedRoute>} />
        <Route path="access-denied" element={<AccessDeniedPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
      
      <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <NotificationProvider>
      <DataProvider>
        <AuthProvider>
          <HashRouter>
            <AppRoutes />
          </HashRouter>
        </AuthProvider>
      </DataProvider>
    </NotificationProvider>
  );
};

export default App;
