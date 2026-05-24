import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// NẾU BẠN DÙNG THƯ VIỆN REACT-TOASTIFY, HÃY MỞ 2 DÒNG DƯỚI ĐÂY VÀ XÓA import từ './components/ui'
// import { ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

// Tạm ẩn ToastContainer từ UI vì hệ thống báo không tìm thấy
// import { ToastContainer } from './components/ui';

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

// ── Forum ───────────────────────────────────────────────────────
import ForumPage       from './pages/forum/ForumPage';
import ForumDetailPage from './pages/forum/ForumDetailPage';

// ── News ────────────────────────────────────────────────────────
import NewsPage       from './pages/news/NewsPage';
import NewsDetailPage from './pages/news/NewsDetailPage';

// ── Misc ────────────────────────────────────────────────────────
// Tạm ẩn 2 trang này vì bạn chưa tạo file trong thư mục src/pages/misc/
// import NotificationsPage  from './pages/misc/NotificationsPage';
// import ChangePasswordPage from './pages/misc/ChangePasswordPage';

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

      {/* Auth */}
      <Route path="/login"             element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register"          element={<PublicRoute><RegisterSelectionPage /></PublicRoute>} />
      <Route path="/register/internal" element={<PublicRoute><RegisterInternalPage /></PublicRoute>} />
      <Route path="/register/external" element={<PublicRoute><RegisterExternalPage /></PublicRoute>} />

      {/* Main */}
      <Route path="/home"    element={<PrivateRoute><HomePage /></PrivateRoute>} />
      <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />

      {/* Contest */}
      <Route path="/contests"     element={<PrivateRoute><ContestListPage /></PrivateRoute>} />
      <Route path="/contests/:id" element={<PrivateRoute><ContestDetailPage /></PrivateRoute>} />

      {/* Documents */}
      <Route path="/documents" element={<PrivateRoute><DocumentsPage /></PrivateRoute>} />

      {/* Roadmap */}
      <Route path="/roadmap" element={<PrivateRoute><RoadmapPage /></PrivateRoute>} />
      <Route path="/roadmap/chapter/:chapterId/lesson/:lessonId" element={<PrivateRoute><LessonPage /></PrivateRoute>} />

      {/* Forum */}
      <Route path="/forum"     element={<PrivateRoute><ForumPage /></PrivateRoute>} />
      <Route path="/forum/:id" element={<PrivateRoute><ForumDetailPage /></PrivateRoute>} />

      {/* News */}
      <Route path="/news"     element={<PrivateRoute><NewsPage /></PrivateRoute>} />
      <Route path="/news/:id" element={<PrivateRoute><NewsDetailPage /></PrivateRoute>} />

      {/* Misc */}
      {/* Tạm ẩn Route của 2 trang chưa có */}
      {/* <Route path="/notifications"   element={<PrivateRoute><NotificationsPage /></PrivateRoute>} /> */}
      {/* <Route path="/change-password" element={<PrivateRoute><ChangePasswordPage /></PrivateRoute>} /> */}

      {/* Admin */}
      <Route path="/admin"       element={<AdminRoute><AdminOverviewPage /></AdminRoute>} />
      <Route path="/admin/users" element={<AdminRoute><AdminUsersPage /></AdminRoute>} />
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
        {/* Tạm ẩn ToastContainer */}
        {/* <ToastContainer /> */}
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}