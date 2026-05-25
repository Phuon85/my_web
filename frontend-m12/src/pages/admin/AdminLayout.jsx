import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const MENU = [
  { icon: '📊', label: 'Tổng quan',   path: '/admin' },
  { icon: '👥', label: 'Người dùng',  path: '/admin/users' },
  { icon: '🏆', label: 'Đội tuyển',   path: '/admin/teams' },
  { icon: '🎓', label: 'Kỳ thi',      path: '/admin/exams' },
  { icon: '📋', label: 'Logs',        path: '/admin/logs' },
  { icon: '⚙️',  label: 'Cấu hình',  path: '/admin/settings' },
];

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div style={{
      display: 'flex', minHeight: '100vh',
      background: '#f5e6e8',
      fontFamily: "'Be Vietnam Pro', 'Segoe UI', sans-serif",
    }}>
      {/* Sidebar */}
      <aside style={{
        width: 200, flexShrink: 0,
        background: '#1a2236',
        display: 'flex', flexDirection: 'column',
        padding: '24px 0 16px',
        position: 'sticky', top: 0, height: '100vh',
      }}>
        {/* Brand */}
        <div style={{ padding: '0 20px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <p style={{ color: '#fff', fontWeight: 800, fontSize: 15, margin: 0, letterSpacing: 0.5 }}>
            HUMG OLYMPIC
          </p>
          <p style={{ color: '#6ee7b7', fontSize: 11, margin: '4px 0 0', fontWeight: 500 }}>
            Admin Mode
          </p>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '16px 10px' }}>
          {MENU.map(item => {
            const active = item.path === '/admin'
              ? location.pathname === '/admin'
              : location.pathname.startsWith(item.path);
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  width: '100%', padding: '10px 12px',
                  background: active ? '#009688' : 'none',
                  border: 'none', borderRadius: 8,
                  color: active ? '#fff' : 'rgba(255,255,255,0.65)',
                  fontSize: 13.5, fontWeight: active ? 700 : 400,
                  cursor: 'pointer', textAlign: 'left',
                  fontFamily: 'inherit', marginBottom: 2,
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'none'; }}
              >
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* User footer */}
        <div style={{
          padding: '14px 16px',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{
            width: 34, height: 34, borderRadius: '50%',
            background: 'rgba(255,255,255,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, overflow: 'hidden', flexShrink: 0,
          }}>
            {user?.avatarUrl
              ? <img src={user.avatarUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
              : '👤'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ color: '#fff', fontSize: 12, fontWeight: 600, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.fullName || 'Admin'}
            </p>
            <p style={{ color: '#6ee7b7', fontSize: 10, margin: '1px 0 0' }}>Đang hoạt động</p>
          </div>
          <button
            onClick={() => { logout(); navigate('/login'); }}
            title="Đăng xuất"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'rgba(255,255,255,0.5)', fontSize: 16, padding: 4,
              flexShrink: 0,
            }}
          >
            🚪
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, overflowX: 'hidden', padding: '28px 32px' }}>
        {children}
      </main>
    </div>
  );
}