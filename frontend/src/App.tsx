import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ProtectedLayout } from './components/layout/ProtectedLayout';
import { DashboardPage } from './pages/DashboardPage';
import { TicketListPage } from './pages/tickets/TicketListPage';
import { TicketDetailPage } from './pages/tickets/TicketDetailPage';
import { AdminPage } from './pages/admin/AdminPage';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Routes */}
          <Route element={<ProtectedLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/tickets" element={<TicketListPage />} />
            <Route path="/tickets/:id" element={<TicketDetailPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Route>

          {/* Default Redirect */}
          <Route path="*" element={<Navigate to="/tickets" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
