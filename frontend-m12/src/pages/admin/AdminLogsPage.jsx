import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from './AdminLayout';
import { adminAPI } from '../../api/axios';
import { Spinner } from '../../components/ui';

const ACTION_META = {
  LOGIN:             { label: 'Đăng nhập',        icon: '🔑', color: '#3b82f6' },
  LOGOUT:            { label: 'Đăng xuất',         icon: '🚪', color: '#6b7280' },
  REGISTER:          { label: 'Đăng ký',           icon: '📝', color: '#10b981' },
  CONTEST_REGISTER:  { label: 'Đăng ký thi',       icon: '🎓', color: '#8b5cf6' },
  FILE_UPLOAD:       { label: 'Tải file lên',      icon: '📤', color: '#f59e0b' },
  FILE_DOWNLOAD:     { label: 'Tải file xuống',    icon: '📥', color: '#06b6d4' },
  USER_LOCK:         { label: 'Khóa tài khoản',    icon: '🔒', color: '#ef4444' },
  USER_UNLOCK:       { label: 'Mở khóa',           icon: '🔓', color: '#10b981' },
  CONTEST_CREATE:    { label: 'Tạo kỳ thi',        icon: '🏆', color: '#f59e0b' },
  CONTEST_PUBLISH:   { label: 'Công bố kỳ thi',    icon: '📢', color: '#10b981' },
};

function ActionBadge({ action }) {
  const m = ACTION_META[action] || { label: action, icon: '📋', color: '#6b7280' };
  return (
    <span style={{ background: m.color + '15', color: m.color, fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 16, display: 'inline-flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap' }}>
      {m.icon} {m.label}
    </span>
  );
}

function timeAgo(dt) {
  if (!dt) return '—';
  const d = new Date(dt);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60)    return 'Vừa xong';
  if (diff < 3600)  return `${Math.floor(diff/60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff/3600)} giờ trước`;
  return d.toLocaleDateString('vi-VN') + ' ' + d.toLocaleTimeString('vi-VN', {hour:'2-digit',minute:'2-digit'});
}

const PAGE_SIZE = 20;

export default function AdminLogsPage() {
  const [logs, setLogs]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [actionF, setActionF]   = useState('');
  const [page, setPage]         = useState(0);
  const [hasMore, setHasMore]   = useState(true);

  const load = useCallback(async (p = 0, reset = true) => {
    setLoading(true);
    try {
      const res = await adminAPI.logs({ action: actionF || undefined, search: search.trim() || undefined, page: p, size: PAGE_SIZE });
      const data = res.data || [];
      if (reset) setLogs(data);
      else setLogs(prev => [...prev, ...data]);
      setHasMore(data.length === PAGE_SIZE);
      setPage(p);
    } catch {} finally { setLoading(false); }
  }, [search, actionF]);

  useEffect(() => { load(0, true); }, [load]);

  return (
    <AdminLayout>
      <p style={{ color: '#888', fontSize: 13, margin: '0 0 18px' }}>Nhật ký hệ thống</p>

      <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.07)', padding: '24px 28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
          <div style={{ width: 44, height: 44, background: '#fff8e1', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>📋</div>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1a202c', margin: 0 }}>Nhật ký hoạt động</h2>
            <p style={{ color: '#888', fontSize: 13, margin: '3px 0 0' }}>Theo dõi lịch sử hoạt động người dùng trong hệ thống</p>
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#aaa' }}>🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm theo tên, email..."
              style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px 9px 36px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', outline: 'none', background: '#fafafa' }} />
          </div>
          <select value={actionF} onChange={e => setActionF(e.target.value)}
            style={{ padding: '9px 12px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', background: '#fafafa', cursor: 'pointer', outline: 'none', minWidth: 170 }}>
            <option value="">Hành động: Tất cả</option>
            {Object.entries(ACTION_META).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
          </select>
        </div>

        {/* Table */}
        {loading && logs.length === 0 ? <Spinner /> : logs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#aaa' }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>📋</div>
            <p>Không có nhật ký nào.</p>
          </div>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #f0f0f0' }}>
                    {['Thời gian', 'Người dùng', 'Hành động', 'Chi tiết', 'IP'].map(h => (
                      <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#888', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {logs.map(l => (
                    <tr key={l.id} style={{ borderBottom: '1px solid #f7f7f7' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '11px 12px', fontSize: 12, color: '#888', whiteSpace: 'nowrap' }}>{timeAgo(l.createdAt)}</td>
                      <td style={{ padding: '11px 12px' }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: '#1a202c', margin: 0 }}>{l.userName}</p>
                        <p style={{ fontSize: 11, color: '#888', margin: '1px 0 0' }}>{l.userEmail}</p>
                      </td>
                      <td style={{ padding: '11px 12px' }}><ActionBadge action={l.action} /></td>
                      <td style={{ padding: '11px 12px', fontSize: 13, color: '#555', maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.detail || '—'}</td>
                      <td style={{ padding: '11px 12px', fontSize: 12, color: '#aaa', whiteSpace: 'nowrap' }}>{l.ipAddress || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {hasMore && (
              <div style={{ textAlign: 'center', marginTop: 16 }}>
                <button onClick={() => load(page + 1, false)} disabled={loading}
                  style={{ padding: '10px 24px', background: '#f0fdf4', color: '#166534', border: '1.5px solid #86efac', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
                  {loading ? 'Đang tải...' : 'Xem thêm'}
                </button>
              </div>
            )}
            <p style={{ textAlign: 'center', fontSize: 12, color: '#aaa', marginTop: 8 }}>Hiển thị {logs.length} bản ghi</p>
          </>
        )}
      </div>
    </AdminLayout>
  );
}