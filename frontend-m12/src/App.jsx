import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Spinner } from './components/ui';

// ── Auth pages ──────────────────────────────────────────────────────────────
import LoginPage from './pages/auth/LoginPage';
import { RegisterSelectionPage, RegisterInternalPage, RegisterExternalPage } from './pages/auth/RegisterPages';

// ── Main pages ──────────────────────────────────────────────────────────────
import HomePage          from './pages/home/HomePage';
import ProfilePage       from './pages/profile/ProfilePage';
import ContestListPage   from './pages/contest/ContestListPage';
import ContestDetailPage from './pages/contest/ContestDetailPage';

// ── Module 2: Tài liệu & Lộ trình ──────────────────────────────────────────
import DocumentsPage from './pages/documents/DocumentsPage';
import RoadmapPage   from './pages/roadmap/RoadmapPage';
import LessonPage    from './pages/roadmap/LessonPage';

// ── Route guards ────────────────────────────────────────────────────────────
function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ minHeight:'100vh', background:'#f5f6fa', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <Spinner size={44} />
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/home" replace /> : children;
}

// ── Routes ──────────────────────────────────────────────────────────────────
function AppRoutes() {
  return (
    <Routes>
      {/* Redirect gốc */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Auth — chưa đăng nhập */}
      <Route path="/login"             element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register"          element={<PublicRoute><RegisterSelectionPage /></PublicRoute>} />
      <Route path="/register/internal" element={<PublicRoute><RegisterInternalPage /></PublicRoute>} />
      <Route path="/register/external" element={<PublicRoute><RegisterExternalPage /></PublicRoute>} />

      {/* Protected — cần đăng nhập */}
      <Route path="/home"    element={<PrivateRoute><HomePage /></PrivateRoute>} />
      <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />

      {/* Cuộc thi */}
      <Route path="/contests"     element={<PrivateRoute><ContestListPage /></PrivateRoute>} />
      <Route path="/contests/:id" element={<PrivateRoute><ContestDetailPage /></PrivateRoute>} />

      {/* Kho tài liệu */}
      <Route path="/documents" element={<PrivateRoute><DocumentsPage /></PrivateRoute>} />

      {/* Lộ trình */}
      <Route path="/roadmap" element={<PrivateRoute><RoadmapPage /></PrivateRoute>} />
      <Route path="/roadmap/chapter/:chapterId/lesson/:lessonId"
             element={<PrivateRoute><LessonPage /></PrivateRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
