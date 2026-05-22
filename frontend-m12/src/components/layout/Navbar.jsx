import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NAV = [
  { label: 'Trang chủ',    path: '/home' },
  { label: 'Cuộc thi',     path: '/contests' },
  { label: 'Kho tài liệu', path: '/documents' },
  { label: 'Diễn đàn',     path: '/forum' },
  { label: 'Tin tức',      path: '/news' },
  { label: 'Lộ trình',     path: '/roadmap' },
];

export default function Navbar({ unreadCount = 0 }) {
  const { user, logout } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [dropdown, setDropdown] = useState(false);
  const dropRef = useRef(null);

  // Đóng dropdown khi click ngoài
  useEffect(() => {
    const handler = e => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropdown(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  return (
    <nav style={{
      background: 'linear-gradient(90deg,#0f2a6e,#1a4298)',
      height: 62, display: 'flex', alignItems: 'center',
      padding: '0 32px', gap: 8,
      boxShadow: '0 2px 16px rgba(0,0,0,0.2)',
      position: 'sticky', top: 0, zIndex: 1000,
      fontFamily: "'Be Vietnam Pro',sans-serif",
    }}>
      {/* Logo */}
      <div onClick={() => navigate('/home')}
        style={{ display: 'flex', alignItems: 'center', gap: 10, marginRight: 24, cursor: 'pointer', flexShrink: 0 }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          border: '2px solid rgba(255,255,255,0.5)',
          background: 'rgba(255,255,255,0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
        }}></div>
        <span style={{ color: '#fff', fontWeight: 800, fontSize: 15, letterSpacing: 0.5, whiteSpace: 'nowrap' }}>
          HUMG OLYMPIC
        </span>
      </div>

      {/* Nav Links */}
      <div style={{ display: 'flex', gap: 2, flex: 1, overflowX: 'auto' }}>
        {NAV.map(item => {
          const active = location.pathname.startsWith(item.path);
          return (
            <button key={item.path} onClick={() => navigate(item.path)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '8px 12px', borderRadius: 6, whiteSpace: 'nowrap',
                color: active ? '#fff' : 'rgba(255,255,255,0.72)',
                fontSize: 14, fontWeight: active ? 700 : 400,
                fontFamily: 'inherit',
                borderBottom: active ? '2px solid #f59e0b' : '2px solid transparent',
                marginBottom: -2, transition: 'color 0.15s',
              }}>
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        {/* Bell */}
        <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => navigate('/notifications')}>
          <span style={{ fontSize: 20 }}>🔔</span>
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute', top: -5, right: -5,
              background: '#e53e3e', color: '#fff', fontSize: 10,
              fontWeight: 700, borderRadius: '50%', width: 16, height: 16,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>{unreadCount}</span>
          )}
        </div>

        {/* Avatar + Dropdown */}
        <div ref={dropRef} style={{ position: 'relative' }}>
          <div onClick={() => setDropdown(d => !d)}
            style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'rgba(255,255,255,0.18)',
              border: '2px solid rgba(255,255,255,0.45)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, cursor: 'pointer', overflow: 'hidden',
            }}>
            {user?.avatarUrl
              ? <img src={user.avatarUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
              : '👨‍🎓'}
          </div>

          {dropdown && (
            <div style={{
              position: 'absolute', top: 46, right: 0,
              background: '#fff', borderRadius: 12,
              boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
              minWidth: 200, zIndex: 2000, overflow: 'hidden',
            }}>
              {/* User info */}
              <div style={{ padding: '14px 16px', borderBottom: '1px solid #f0f0f0' }}>
                <p style={{ fontWeight: 700, fontSize: 14, color: '#1a202c', margin: '0 0 2px' }}>
                  {user?.fullName || 'Người dùng'}
                </p>
                <p style={{ color: '#888', fontSize: 12, margin: '0 0 4px' }}>{user?.email}</p>
                <span style={{
                  background: user?.role === 'ADMIN' ? '#fef2f2'
                    : user?.role === 'TEACHER' ? '#faf5ff' : '#eff6ff',
                  color: user?.role === 'ADMIN' ? '#991b1b'
                    : user?.role === 'TEACHER' ? '#6b21a8' : '#1e40af',
                  fontSize: 11, fontWeight: 700,
                  padding: '2px 8px', borderRadius: 12,
                }}>{user?.role || 'STUDENT'}</span>
              </div>

              {/* Menu items */}
              {[
                { icon: '👤', label: 'Hồ sơ cá nhân', path: '/profile' },
                isAdmin && { icon: '⚙️', label: 'Quản trị hệ thống', path: '/admin' },
                { icon: '🔔', label: 'Thông báo', path: '/notifications' },
              ].filter(Boolean).map(item => (
                <button key={item.path}
                  onClick={() => { navigate(item.path); setDropdown(false); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    width: '100%', padding: '11px 16px',
                    background: 'none', border: 'none', textAlign: 'left',
                    cursor: 'pointer', fontSize: 13, color: '#333', fontFamily: 'inherit',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f8f9fa'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  <span>{item.icon}</span> {item.label}
                </button>
              ))}

              <button
                onClick={() => { logout(); navigate('/login'); setDropdown(false); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  width: '100%', padding: '11px 16px',
                  background: 'none', border: 'none', textAlign: 'left',
                  cursor: 'pointer', fontSize: 13, color: '#e53e3e',
                  fontFamily: 'inherit', borderTop: '1px solid #f0f0f0',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#fff5f5'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >
                🚪 Đăng xuất
              </button>
            </div>
          )}
        </div>

        {/* Online dot */}
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} title="Online" />
      </div>
    </nav>
  );
}
