import React from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import { useAuth } from '../../context/AuthContext';

export default function AdminOverviewPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const cards = [
    { icon: '👥', label: 'Quản lý người dùng', desc: 'Xem, chỉnh sửa, khóa tài khoản', path: '/admin/users', color: '#3b82f6' },
    { icon: '🎓', label: 'Quản lý kỳ thi',     desc: 'Tạo và giám sát các kỳ thi',    path: '/admin/exams', color: '#10b981' },
    { icon: '📋', label: 'Nhật ký hệ thống',   desc: 'Theo dõi hoạt động người dùng', path: '/admin/logs',  color: '#f59e0b' },
    { icon: '⚙️',  label: 'Cấu hình',          desc: 'Cài đặt hệ thống',              path: '/admin/settings', color: '#8b5cf6' },
  ];

  return (
    <AdminLayout>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1a202c', margin: '0 0 6px' }}>
          Xin chào, {user?.fullName?.split(' ').slice(-1)[0] || 'Admin'} 👋
        </h1>
        <p style={{ color: '#888', fontSize: 14, margin: 0 }}>Đây là bảng điều khiển quản trị hệ thống HUMG Olympic.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 18 }}>
        {cards.map(c => (
          <div
            key={c.path}
            onClick={() => navigate(c.path)}
            style={{
              background: '#fff', borderRadius: 14,
              padding: '22px 20px', cursor: 'pointer',
              boxShadow: '0 2px 10px rgba(0,0,0,0.07)',
              border: '1.5px solid #f0f0f0',
              transition: 'transform 0.15s, box-shadow 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.07)'; }}
          >
            <div style={{ fontSize: 30, marginBottom: 12 }}>{c.icon}</div>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#1a202c', margin: '0 0 4px' }}>{c.label}</p>
            <p style={{ fontSize: 12, color: '#888', margin: 0 }}>{c.desc}</p>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}
