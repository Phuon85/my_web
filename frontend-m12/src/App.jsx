import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

import LoginPage from './pages/auth/LoginPage';
import { RegisterSelectionPage, RegisterInternalPage, RegisterExternalPage } from './pages/auth/RegisterPages';
import HomePage          from './pages/home/HomePage';
import ProfilePage       from './pages/profile/ProfilePage';
import ContestListPage   from './pages/contest/ContestListPage';
import ContestDetailPage from './pages/contest/ContestDetailPage';
import DocumentsPage     from './pages/documents/DocumentsPage';
import RoadmapPage       from './pages/roadmap/RoadmapPage';
import LessonPage        from './pages/roadmap/LessonPage';
import AdminOverviewPage from './pages/admin/AdminOverviewPage';
import AdminUsersPage    from './pages/admin/AdminUsersPage';
import AdminExamsPage    from './pages/admin/AdminExamsPage';
import AdminLogsPage     from './pages/admin/AdminLogsPage';
import AdminTeamsPage    from './pages/admin/AdminTeamsPage';
import ForumPage         from './pages/forum/ForumPage';
import ForumDetailPage   from './pages/forum/ForumDetailPage';
import NewsPage          from './pages/news/NewsPage';
import NewsDetailPage    from './pages/news/NewsDetailPage';
import TeamPage          from './pages/team/TeamPage';

function LoadingScreen() {
  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(135deg,#0f2a6e 0%,#1a4298 50%,#0f2a6e 100%)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:20 }}>
      <div style={{ width:52, height:52, borderRadius:'50%', border:'3px solid rgba(255,255,255,0.2)', borderTopColor:'#f59e0b', animation:'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <p style={{ color:'rgba(255,255,255,0.7)', fontSize:14, fontFamily:"'Be Vietnam Pro',sans-serif" }}>Đang tải...</p>
    </div>
  );
}

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  return user ? children : <Navigate to="/login" replace />;
}
function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  return (user.role==='ADMIN'||user.role==='MANAGER') ? children : <Navigate to="/home" replace />;
}
function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/home" replace /> : children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route path="/login"             element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register"          element={<PublicRoute><RegisterSelectionPage /></PublicRoute>} />
      <Route path="/register/internal" element={<PublicRoute><RegisterInternalPage /></PublicRoute>} />
      <Route path="/register/external" element={<PublicRoute><RegisterExternalPage /></PublicRoute>} />

      <Route path="/home"    element={<PrivateRoute><HomePage /></PrivateRoute>} />
      <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />

      <Route path="/contests"     element={<PrivateRoute><ContestListPage /></PrivateRoute>} />
      <Route path="/contests/:id" element={<PrivateRoute><ContestDetailPage /></PrivateRoute>} />

      <Route path="/documents" element={<PrivateRoute><DocumentsPage /></PrivateRoute>} />

      <Route path="/roadmap" element={<PrivateRoute><RoadmapPage /></PrivateRoute>} />
      <Route path="/roadmap/chapter/:chapterId/lesson/:lessonId" element={<PrivateRoute><LessonPage /></PrivateRoute>} />

      <Route path="/forum"     element={<PrivateRoute><ForumPage /></PrivateRoute>} />
      <Route path="/forum/:id" element={<PrivateRoute><ForumDetailPage /></PrivateRoute>} />

      <Route path="/news"     element={<PrivateRoute><NewsPage /></PrivateRoute>} />
      <Route path="/news/:id" element={<PrivateRoute><NewsDetailPage /></PrivateRoute>} />

      <Route path="/teams"   element={<PrivateRoute><TeamPage /></PrivateRoute>} />

      <Route path="/admin"       element={<AdminRoute><AdminOverviewPage /></AdminRoute>} />
      <Route path="/admin/users" element={<AdminRoute><AdminUsersPage /></AdminRoute>} />
      <Route path="/admin/teams" element={<AdminRoute><AdminTeamsPage /></AdminRoute>} />
      <Route path="/admin/exams" element={<AdminRoute><AdminExamsPage /></AdminRoute>} />
      <Route path="/admin/logs"  element={<AdminRoute><AdminLogsPage /></AdminRoute>} />

      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              fontFamily: "'Be Vietnam Pro', sans-serif",
              fontSize: 14,
              fontWeight: 500,
              borderRadius: 10,
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            },
            success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
            error:   { iconTheme: { primary: '#e53e3e', secondary: '#fff' } },
          }}
        />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}