import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import CompleteProfilePage from './pages/CompleteProfilePage';
import DashboardPage from './pages/DashboardPage';
import NeonMatchPage from './pages/NeonMatchPage';

// Simple protected route wrapper
const ProtectedRoute = ({ children }: { children: React.JSX.Element }) => {
  const token = localStorage.getItem('token');

  // Also check for token in URL (for Google OAuth callback)
  const urlParams = new URLSearchParams(window.location.search);
  const urlToken = urlParams.get('token');

  if (!token && !urlToken) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/complete-profile"
          element={
            <ProtectedRoute>
              <CompleteProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/"
          element={<DashboardPage />}
        />
        <Route path="/game/neon-match" element={<NeonMatchPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
