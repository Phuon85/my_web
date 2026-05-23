import React, { useState, useEffect, useCallback } from 'react';
import { userAPI } from '../../api/axios';
import AdminLayout from './AdminLayout';
import { Spinner, Toast, Modal } from '../../components/ui';

// ── Helpers ─────────────────────────────────────────────────────────────────
const ROLES = [
  { value: '', label: 'Tất cả' },
  { value: 'ADMIN',   label: 'Quản trị viên' },
  { value: 'TEACHER', label: 'Giảng viên' },
  { value: 'STUDENT', label: 'Sinh viên' },
];

const ROLE_COLORS = {
  ADMIN:   { bg: '#fef2f2', text: '#b91c1c', label: 'QUẢN TRỊ VIÊN' },
  TEACHER: { bg: '#f0fdf4', text: '#166534', label: 'GIẢNG VIÊN' },
  STUDENT: { bg: '#eff6ff', text: '#1e40af', label: 'SINH VIÊN' },
  MANAGER: { bg: '#faf5ff', text: '#6b21a8', label: 'MANAGER' },
};

function RoleBadge({ role }) {
  const c = ROLE_COLORS[role] || { bg: '#f9fafb', text: '#6b7280', label: role };
  return (
    <span style={{
      background: c.bg, color: c.text,
      fontSize: 11, fontWeight: 700,
      padding: '3px 10px', borderRadius: 16,
      display: 'inline-block', whiteSpace: 'nowrap',
    }}>{c.label}</span>
  );
}

function StatusBadge({ active }) {
  return active === false
    ? <span style={{ background: '#fef2f2', color: '#991b1b', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 16 }}>ĐÃ KHÓA</span>
    : null;
}

function Avatar({ user, size = 36 }) {
  const initials = (user.fullName || '?').split(' ').slice(-2).map(w => w[0]).join('').toUpperCase();
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
  const color = colors[(user.id || 0) % colors.length];
  return user.avatarUrl ? (
    <img src={user.avatarUrl} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} alt="" />
  ) : (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: color, color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.38, fontWeight: 700, flexShrink: 0,
    }}>{initials}</div>
  );
}

function timeAgo(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return 'Vừa xong';
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  return `${Math.floor(diff / 86400)} ngày trước`;
}

const PAGE_SIZE = 10;

// ── Add/Edit User Modal ──────────────────────────────────────────────────────
function UserFormModal({ open, onClose, editUser, onSaved }) {
  const [form, setForm] = useState({ fullName: '', email: '', mssv: '', khoa: '', role: 'STUDENT', password: '' });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (editUser) {
      setForm({
        fullName: editUser.fullName || '',
        email: editUser.email || '',
        mssv: editUser.mssv || '',
        khoa: editUser.khoa || '',
        role: editUser.role || 'STUDENT',
        password: '',
      });
    } else {
      setForm({ fullName: '', email: '', mssv: '', khoa: '', role: 'STUDENT', password: '' });
    }
    setErr('');
  }, [editUser, open]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.fullName.trim() || !form.email.trim()) {
      setErr('Vui lòng điền đầy đủ họ tên và email.');
      return;
    }
    if (!editUser && !form.password.trim()) {
      setErr('Vui lòng nhập mật khẩu.');
      return;
    }
    setSaving(true);
    try {
      if (editUser) {
        await userAPI.update(editUser.id, {
          fullName: form.fullName,
          email:    form.email,
          mssv:     form.mssv,
          khoa:     form.khoa,
          role:     form.role,
        });
      } else {
        await userAPI.create({
          fullName:   form.fullName,
          email:      form.email,
          password:   form.password,
          mssv:       form.mssv,
          khoa:       form.khoa,
          role:       form.role,
          isInternal: true,
        });
      }
      onSaved(form.fullName);
      onClose();
    } catch (e) {
      setErr(e?.response?.data?.message || 'Có lỗi xảy ra.');
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 480, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', padding: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontSize: 17, fontWeight: 700, color: '#1a202c', margin: 0 }}>
            {editUser ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#aaa' }}>✕</button>
        </div>

        {err && <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#991b1b', borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 14 }}>{err}</div>}

        {[
          { key: 'fullName', label: 'Họ và tên *', placeholder: 'Nguyễn Văn A' },
          { key: 'email',    label: 'Email *',     placeholder: 'email@humg.edu.vn' },
          { key: 'mssv',     label: 'MSSV',        placeholder: '2021xxxxxx' },
          { key: 'khoa',     label: 'Khoa/Viện',   placeholder: 'Khoa Công nghệ Thông tin' },
        ].map(({ key, label, placeholder }) => (
          <div key={key} style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 5 }}>{label}</label>
            <input
              value={form[key]}
              onChange={e => set(key, e.target.value)}
              placeholder={placeholder}
              style={{
                width: '100%', boxSizing: 'border-box',
                padding: '10px 13px', border: '1.5px solid #e0e0e0',
                borderRadius: 8, fontSize: 14, fontFamily: 'inherit', outline: 'none',
              }}
              onFocus={e => e.target.style.borderColor = '#009688'}
              onBlur={e => e.target.style.borderColor = '#e0e0e0'}
            />
          </div>
        ))}

        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 5 }}>Vai trò</label>
          <select
            value={form.role}
            onChange={e => set('role', e.target.value)}
            style={{ width: '100%', padding: '10px 13px', border: '1.5px solid #e0e0e0', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', outline: 'none', background: '#fafafa', cursor: 'pointer' }}
          >
            {ROLES.filter(r => r.value).map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
        </div>

        {!editUser && (
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 5 }}>Mật khẩu *</label>
            <input
              type="password"
              value={form.password}
              onChange={e => set('password', e.target.value)}
              placeholder="Mật khẩu khởi tạo"
              style={{ width: '100%', boxSizing: 'border-box', padding: '10px 13px', border: '1.5px solid #e0e0e0', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', outline: 'none' }}
              onFocus={e => e.target.style.borderColor = '#009688'}
              onBlur={e => e.target.style.borderColor = '#e0e0e0'}
            />
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
          <button onClick={onClose} style={{ padding: '10px 20px', background: '#f5f5f5', border: 'none', borderRadius: 8, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>
            Hủy
          </button>
          <button onClick={handleSave} disabled={saving} style={{ padding: '10px 22px', background: saving ? '#ccc' : '#009688', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
            {saving ? 'Đang lưu...' : (editUser ? 'Cập nhật' : 'Thêm mới')}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Action Dropdown ──────────────────────────────────────────────────────────
function ActionMenu({ user, onEdit, onToggle, onDelete }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#666', padding: '2px 6px', borderRadius: 6 }}
        onMouseEnter={e => e.currentTarget.style.background = '#f0f0f0'}
        onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
      >
        ⋮
      </button>
      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 999 }} onClick={() => setOpen(false)} />
          <div style={{
            position: 'absolute', right: 0, top: '100%',
            background: '#fff', borderRadius: 10,
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            minWidth: 180, zIndex: 1000, overflow: 'hidden',
          }}>
            {[
              { icon: '✏️', label: 'Chỉnh sửa', action: () => { onEdit(); setOpen(false); } },
              {
                icon: user.isActive === false ? '🔓' : '🔒',
                label: user.isActive === false ? 'Mở khóa tài khoản' : 'Khóa tài khoản',
                action: () => { onToggle(); setOpen(false); },
                color: user.isActive === false ? '#166534' : '#dc2626',
              },
              {
                icon: '🗑️', label: 'Xóa người dùng',
                action: () => { onDelete(); setOpen(false); },
                color: '#dc2626',
              },
            ].map(item => (
              <button
                key={item.label}
                onClick={item.action}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  width: '100%', padding: '10px 14px',
                  background: 'none', border: 'none', textAlign: 'left',
                  cursor: 'pointer', fontSize: 13, fontFamily: 'inherit',
                  color: item.color || '#333',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#f8f9fa'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >
                <span>{item.icon}</span> {item.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function AdminUsersPage() {
  const [users, setUsers]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [toast, setToast]         = useState({ msg: '', type: 'success' });
  const [search, setSearch]       = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('active'); // active | all | locked
  const [page, setPage]           = useState(1);
  const [editUser, setEditUser]   = useState(null);
  const [showModal, setShowModal] = useState(false);

  const notify = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: 'success' }), 3000);
  };

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (roleFilter) params.role = roleFilter;
      if (statusFilter === 'active') params.isActive = true;
      if (statusFilter === 'locked') params.isActive = false;
      const res = await userAPI.getAll(params);
      setUsers(res.data || []);
      setPage(1);
    } catch {
      notify('Không thể tải danh sách người dùng.', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, statusFilter]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const handleToggle = async (user) => {
    try {
      const res = await userAPI.toggleActive(user.id);
      notify(res.data?.message || 'Đã cập nhật trạng thái.');
      loadUsers();
    } catch {
      notify('Có lỗi khi thay đổi trạng thái.', 'error');
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Bạn có chắc muốn xóa người dùng "${user.fullName}"?\nHành động này không thể hoàn tác.`)) return;
    try {
      await userAPI.delete(user.id);
      notify(`Đã xóa người dùng ${user.fullName}.`);
      loadUsers();
    } catch {
      notify('Có lỗi khi xóa người dùng.', 'error');
    }
  };

  // Filter & paginate (backend đã lọc theo isActive, chỉ cần paginate)
  const totalPages = Math.ceil(users.length / PAGE_SIZE);
  const paged = users.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Stats từ state riêng (gọi API /users/stats)
  const [stats, setStats] = useState({ total: 0, active: 0, locked: 0, admin: 0, teacher: 0, student: 0 });
  useEffect(() => {
    userAPI.stats().then(r => setStats(r.data)).catch(() => {});
  }, [users]); // reload stats khi users thay đổi

  return (
    <AdminLayout>
      {/* Page title */}
      <p style={{ color: '#888', fontSize: 13, margin: '0 0 18px' }}>Quản lý người dùng</p>

      {/* Toast */}
      {toast.msg && (
        <div style={{
          position: 'fixed', top: 20, right: 24, zIndex: 3000,
          background: toast.type === 'success' ? '#f0fdf4' : '#fef2f2',
          border: `1px solid ${toast.type === 'success' ? '#86efac' : '#fca5a5'}`,
          color: toast.type === 'success' ? '#166534' : '#991b1b',
          borderRadius: 10, padding: '12px 18px', fontSize: 14,
          boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          {toast.type === 'success' ? '✅' : '❌'} {toast.msg}
        </div>
      )}

      {/* Main card */}
      <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.07)', padding: '24px 28px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, background: '#e0f2f1', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
              👥
            </div>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1a202c', margin: 0 }}>Quản lý người dùng</h2>
              <p style={{ color: '#888', fontSize: 13, margin: '3px 0 0' }}>Quản lý thông tin và quyền hạn người dùng</p>
            </div>
          </div>
          <button
            onClick={() => { setEditUser(null); setShowModal(true); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: '#009688', color: '#fff',
              border: 'none', borderRadius: 8, padding: '10px 18px',
              fontSize: 14, fontWeight: 700, cursor: 'pointer',
              fontFamily: 'inherit', boxShadow: '0 3px 10px rgba(0,150,136,0.3)',
            }}
          >
            + Thêm mới
          </button>
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          {[
            { label: 'Tổng số',    value: stats.total,   color: '#3b82f6' },
            { label: 'Đang hoạt động', value: stats.active, color: '#10b981' },
            { label: 'Đã khóa',   value: stats.locked,  color: '#ef4444' },
            { label: 'Admin',     value: stats.admin,   color: '#8b5cf6' },
            { label: 'Giảng viên',value: stats.teacher, color: '#f59e0b' },
            { label: 'Sinh viên', value: stats.student, color: '#6366f1' },
          ].map(s => (
            <div key={s.label} style={{
              background: '#f9fafb', borderRadius: 10, padding: '10px 16px',
              textAlign: 'center', minWidth: 80, flex: '1 1 80px',
              border: `1.5px solid #f0f0f0`,
            }}>
              <p style={{ fontSize: 20, fontWeight: 800, color: s.color, margin: 0 }}>{s.value}</p>
              <p style={{ fontSize: 11, color: '#888', margin: '2px 0 0' }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: '1', minWidth: 200 }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#aaa', fontSize: 15 }}>🔍</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Tìm theo Tên, MSSV, Email..."
              style={{
                width: '100%', boxSizing: 'border-box',
                padding: '9px 12px 9px 36px',
                border: '1.5px solid #e5e7eb', borderRadius: 8,
                fontSize: 13, fontFamily: 'inherit', outline: 'none',
                background: '#fafafa',
              }}
              onFocus={e => e.target.style.borderColor = '#009688'}
              onBlur={e => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          {/* Role filter */}
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            style={{ padding: '9px 12px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', background: '#fafafa', cursor: 'pointer', outline: 'none', minWidth: 130 }}
          >
            {ROLES.map(r => <option key={r.value} value={r.value}>Vai trò: {r.label}</option>)}
          </select>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            style={{ padding: '9px 12px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', background: '#fafafa', cursor: 'pointer', outline: 'none', minWidth: 160 }}
          >
            <option value="active">Trạng thái: Đang hoạt động</option>
            <option value="locked">Trạng thái: Đã khóa</option>
            <option value="all">Trạng thái: Tất cả</option>
          </select>
        </div>

        {/* Table */}
        {loading ? (
          <Spinner />
        ) : paged.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#aaa' }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>👤</div>
            <p style={{ fontSize: 14 }}>Không tìm thấy người dùng nào.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f0f0f0' }}>
                  {['ID', 'Thông tin thành viên', 'Vai trò', 'Khoa/Viện', 'Lần đăng nhập cuối', 'Hành động'].map(h => (
                    <th key={h} style={{
                      padding: '10px 12px', textAlign: 'left',
                      fontSize: 12, fontWeight: 700, color: '#888',
                      letterSpacing: 0.3, whiteSpace: 'nowrap',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paged.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid #f7f7f7', transition: 'background 0.12s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    {/* ID */}
                    <td style={{ padding: '12px 12px', fontSize: 13, color: '#888', fontWeight: 600 }}>
                      #{String(u.id).padStart(3, '0')}
                    </td>

                    {/* Member info */}
                    <td style={{ padding: '12px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Avatar user={u} />
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <p style={{ fontSize: 13, fontWeight: 600, color: '#1a202c', margin: 0 }}>
                              {u.fullName}
                            </p>
                            <StatusBadge active={u.isActive} />
                          </div>
                          <p style={{ fontSize: 12, color: '#888', margin: '2px 0 0' }}>
                            {u.mssv ? `${u.mssv} · ` : ''}{u.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td style={{ padding: '12px 12px' }}>
                      <RoleBadge role={u.role} />
                    </td>

                    {/* Khoa */}
                    <td style={{ padding: '12px 12px', fontSize: 13, color: '#555', maxWidth: 160 }}>
                      {u.khoa || u.truong || '—'}
                    </td>

                    {/* Last login */}
                    <td style={{ padding: '12px 12px', fontSize: 13, color: '#888', whiteSpace: 'nowrap' }}>
                      {timeAgo(u.createdAt)}
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '12px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {u.isActive !== false && u.role !== 'ADMIN' && (
                          <button
                            onClick={() => { setEditUser(u); setShowModal(true); }}
                            style={{
                              background: '#3b82f6', color: '#fff',
                              border: 'none', borderRadius: 6, padding: '5px 12px',
                              fontSize: 12, fontWeight: 700, cursor: 'pointer',
                              fontFamily: 'inherit',
                            }}
                          >
                            Sửa
                          </button>
                        )}
                        <ActionMenu
                          user={u}
                          onEdit={() => { setEditUser(u); setShowModal(true); }}
                          onToggle={() => handleToggle(u)}
                          onDelete={() => handleDelete(u)}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer + Pagination */}
        {!loading && users.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 18, flexWrap: 'wrap', gap: 10 }}>
            <p style={{ fontSize: 13, color: '#888', margin: 0 }}>
              Hiển thị {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, users.length)} trong tổng số {users.length} người dùng
            </p>
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              <PageBtn label="Trước" disabled={page === 1} onClick={() => setPage(p => p - 1)} />
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const n = i + 1;
                return <PageBtn key={n} label={n} active={page === n} onClick={() => setPage(n)} />;
              })}
              {totalPages > 5 && page < totalPages && <span style={{ color: '#aaa', fontSize: 13, padding: '0 4px' }}>…</span>}
              {totalPages > 5 && <PageBtn label={totalPages} active={page === totalPages} onClick={() => setPage(totalPages)} />}
              <PageBtn label="Sau" disabled={page === totalPages || totalPages === 0} onClick={() => setPage(p => p + 1)} />
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <UserFormModal
        open={showModal}
        onClose={() => setShowModal(false)}
        editUser={editUser}
        onSaved={(name) => {
          notify(editUser ? `Đã cập nhật ${name}` : `Đã thêm ${name}`);
          loadUsers();
        }}
      />
    </AdminLayout>
  );
}

function PageBtn({ label, onClick, disabled, active }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: '6px 12px', border: `1.5px solid ${active ? '#009688' : '#e5e7eb'}`,
        borderRadius: 7, fontSize: 13, fontWeight: active ? 700 : 400,
        background: active ? '#009688' : '#fff',
        color: active ? '#fff' : disabled ? '#ccc' : '#555',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: 'inherit', minWidth: 36,
        transition: 'all 0.12s',
      }}
    >
      {label}
    </button>
  );
}
