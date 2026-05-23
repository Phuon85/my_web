import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import { useAuth } from '../../context/AuthContext';
import { adminAPI } from '../../api/axios';
import { Spinner } from '../../components/ui';

function StatCard({ icon, label, value, sub, color, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: '#fff', borderRadius: 14,
      padding: '20px 22px', cursor: onClick ? 'pointer' : 'default',
      boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
      border: '1.5px solid #f0f0f0',
      transition: 'transform 0.15s, box-shadow 0.15s',
      display: 'flex', alignItems: 'center', gap: 16,
    }}
      onMouseEnter={e => { if (onClick) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'; }}}
      onMouseLeave={e => { if (onClick) { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.06)'; }}}
    >
      <div style={{ width: 50, height: 50, borderRadius: 12, background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <p style={{ fontSize: 26, fontWeight: 800, color: '#1a202c', margin: 0, lineHeight: 1 }}>{value ?? '—'}</p>
        <p style={{ fontSize: 13, color: '#888', margin: '4px 0 0' }}>{label}</p>
        {sub && <p style={{ fontSize: 11, color: color, margin: '2px 0 0', fontWeight: 600 }}>{sub}</p>}
      </div>
    </div>
  );
}

export default function AdminOverviewPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.dashboard()
      .then(r => setStats(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const CARDS = stats ? [
    { icon: '👥', label: 'Tổng người dùng', value: stats.totalUsers,   sub: `${stats.activeUsers} đang hoạt động`, color: '#3b82f6', path: '/admin/users' },
    { icon: '🎓', label: 'Tổng kỳ thi',     value: stats.totalContests, sub: `${stats.liveContests} đang diễn ra`,  color: '#10b981', path: '/admin/exams' },
    { icon: '📄', label: 'Tài liệu',         value: stats.totalDocuments, sub: 'đã tải lên',                        color: '#f59e0b', path: '/documents' },
    { icon: '🗺️', label: 'Lộ trình',          value: stats.totalRoadmaps, sub: 'lộ trình học tập',                  color: '#8b5cf6', path: '/roadmap' },
    { icon: '📝', label: 'Lượt đăng ký thi', value: stats.totalRegistrations, sub: 'tổng số đăng ký',             color: '#ef4444', path: '/admin/exams' },
  ] : [];

  const QUICK_ACTIONS = [
    { icon: '➕', label: 'Tạo kỳ thi mới',   path: '/admin/exams',   color: '#009688' },
    { icon: '👥', label: 'Thêm người dùng',  path: '/admin/users',   color: '#3b82f6' },
    { icon: '📋', label: 'Xem nhật ký',      path: '/admin/logs',    color: '#f59e0b' },
    { icon: '⚙️',  label: 'Cấu hình hệ thống', path: '/admin/settings', color: '#6b7280' },
  ];

  return (
    <AdminLayout>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1a202c', margin: '0 0 6px' }}>
          Xin chào, {user?.fullName?.split(' ').slice(-1)[0] || 'Admin'} 👋
        </h1>
        <p style={{ color: '#888', fontSize: 14, margin: 0 }}>
          Bảng điều khiển quản trị hệ thống HUMG Olympic
        </p>
      </div>

      {/* Stats */}
      {loading ? <Spinner /> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
          {CARDS.map(c => (
            <StatCard key={c.label} {...c} onClick={() => navigate(c.path)} />
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <div style={{ background: '#fff', borderRadius: 16, padding: '22px 24px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', marginBottom: 24 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1a202c', margin: '0 0 16px' }}>⚡ Thao tác nhanh</h3>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {QUICK_ACTIONS.map(a => (
            <button key={a.label} onClick={() => navigate(a.path)} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 18px', background: a.color + '12',
              border: `1.5px solid ${a.color}30`, borderRadius: 10,
              color: a.color, fontSize: 13, fontWeight: 700,
              cursor: 'pointer', fontFamily: 'inherit',
              transition: 'all 0.15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = a.color; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.background = a.color + '12'; e.currentTarget.style.color = a.color; }}
            >
              {a.icon} {a.label}
            </button>
          ))}
        </div>
      </div>

      {/* Module cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
        {[
          { icon: '👥', label: 'Quản lý người dùng', desc: 'Thêm, khóa, phân quyền tài khoản', path: '/admin/users', color: '#3b82f6' },
          { icon: '🎓', label: 'Quản lý kỳ thi',     desc: 'Tạo, công bố và theo dõi kỳ thi',   path: '/admin/exams', color: '#10b981' },
          { icon: '📋', label: 'Nhật ký hệ thống',   desc: 'Lịch sử hoạt động người dùng',        path: '/admin/logs',  color: '#f59e0b' },
          { icon: '⚙️',  label: 'Cấu hình',           desc: 'Thiết lập tham số hệ thống',           path: '/admin/settings', color: '#8b5cf6' },
        ].map(c => (
          <div key={c.path} onClick={() => navigate(c.path)} style={{
            background: '#fff', borderRadius: 14, padding: '20px',
            cursor: 'pointer', boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
            border: '1.5px solid #f0f0f0', transition: 'transform 0.15s, box-shadow 0.15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.06)'; }}
          >
            <div style={{ fontSize: 28, marginBottom: 10 }}>{c.icon}</div>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#1a202c', margin: '0 0 4px' }}>{c.label}</p>
            <p style={{ fontSize: 12, color: '#888', margin: 0 }}>{c.desc}</p>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}