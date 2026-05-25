import React, { useState, useEffect, useCallback } from 'react';
import { teamAPI, userAPI } from '../../api/axios';
import AdminLayout from './AdminLayout';

// ── Helpers ──────────────────────────────────────────────────────────────────
const SUBJECT_EMOJI = {
  'Toán': '📐', 'Tin học': '💻', 'Vật lý': '⚡', 'Hóa học': '🧪', 'Tiếng Anh': '🌍',
};
const subjectEmoji = s => SUBJECT_EMOJI[s] || '🏆';

const SUBJECT_COLORS = {
  'Toán':    { bg: '#eff6ff', text: '#1d4ed8' },
  'Tin học': { bg: '#f0fdf4', text: '#15803d' },
  'Vật lý':  { bg: '#fff7ed', text: '#c2410c' },
  'Hóa học': { bg: '#fdf4ff', text: '#7e22ce' },
  'Tiếng Anh':{ bg: '#fefce8', text: '#a16207' },
};
const subjectStyle = s => SUBJECT_COLORS[s] || { bg: '#f9fafb', text: '#374151' };

function Avatar({ name, url, size = 36 }) {
  const initials = (name || '?').split(' ').slice(-2).map(w => w[0]).join('').toUpperCase();
  const colors   = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4'];
  const color    = colors[name ? name.charCodeAt(0) % colors.length : 0];
  return url ? (
    <img src={url} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} alt="" />
  ) : (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: color, color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.36, fontWeight: 700, flexShrink: 0,
    }}>{initials}</div>
  );
}

function notify(msg, type = 'success') {
  const el = document.createElement('div');
  el.style.cssText = `position:fixed;top:24px;right:24px;z-index:9999;
    background:${type === 'success' ? '#10b981' : '#ef4444'};color:#fff;
    padding:12px 20px;border-radius:10px;font-size:14px;font-weight:600;
    font-family:'Be Vietnam Pro',sans-serif;box-shadow:0 8px 24px rgba(0,0,0,0.2);
    animation:slideIn .2s ease`;
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3000);
}

// ── Team Form Modal ──────────────────────────────────────────────────────────
function TeamFormModal({ open, onClose, editTeam, onSaved }) {
  const [form, setForm] = useState({ name: '', subject: '', description: '', avatarUrl: '', coachId: '' });
  const [users, setUsers] = useState([]);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    userAPI.getAll({ role: 'TEACHER', size: 100 })
      .then(r => setUsers(r.data?.content || r.data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (editTeam) {
      setForm({
        name:        editTeam.name || '',
        subject:     editTeam.subject || '',
        description: editTeam.description || '',
        avatarUrl:   editTeam.avatarUrl || '',
        coachId:     editTeam.coachId || '',
      });
    } else {
      setForm({ name: '', subject: '', description: '', avatarUrl: '', coachId: '' });
    }
    setErr('');
  }, [editTeam, open]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.name.trim()) { setErr('Vui lòng nhập tên đội tuyển.'); return; }
    setSaving(true);
    try {
      const payload = {
        name:        form.name,
        subject:     form.subject || null,
        description: form.description || null,
        avatarUrl:   form.avatarUrl || null,
        coachId:     form.coachId ? Number(form.coachId) : null,
      };
      if (editTeam) {
        await teamAPI.update(editTeam.id, payload);
      } else {
        await teamAPI.create(payload);
      }
      onSaved();
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
      <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 500, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', padding: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontSize: 17, fontWeight: 700, color: '#1a202c', margin: 0 }}>
            {editTeam ? '✏️ Chỉnh sửa đội tuyển' : '➕ Thêm đội tuyển mới'}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#aaa' }}>✕</button>
        </div>

        {err && <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#991b1b', borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 14 }}>{err}</div>}

        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 5 }}>Tên đội tuyển *</label>
          <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Đội tuyển Tin học K68..."
            style={{ width: '100%', boxSizing: 'border-box', padding: '10px 13px', border: '1.5px solid #e0e0e0', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', outline: 'none' }}
            onFocus={e => e.target.style.borderColor = '#009688'} onBlur={e => e.target.style.borderColor = '#e0e0e0'} />
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 5 }}>Môn thi</label>
          <select value={form.subject} onChange={e => set('subject', e.target.value)}
            style={{ width: '100%', padding: '10px 13px', border: '1.5px solid #e0e0e0', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', outline: 'none', background: '#fafafa' }}>
            <option value="">-- Chọn môn --</option>
            {['Toán','Tin học','Vật lý','Hóa học','Tiếng Anh'].map(s => <option key={s} value={s}>{subjectEmoji(s)} {s}</option>)}
          </select>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 5 }}>Huấn luyện viên</label>
          <select value={form.coachId} onChange={e => set('coachId', e.target.value)}
            style={{ width: '100%', padding: '10px 13px', border: '1.5px solid #e0e0e0', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', outline: 'none', background: '#fafafa' }}>
            <option value="">-- Chọn HLV --</option>
            {users.filter(u => u.role === 'TEACHER' || u.role === 'ADMIN' || u.role === 'MANAGER').map(u => (
              <option key={u.id} value={u.id}>{u.fullName} ({u.email})</option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 5 }}>Mô tả</label>
          <textarea value={form.description} onChange={e => set('description', e.target.value)}
            placeholder="Mô tả về đội tuyển..." rows={3}
            style={{ width: '100%', boxSizing: 'border-box', padding: '10px 13px', border: '1.5px solid #e0e0e0', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', outline: 'none', resize: 'vertical' }}
            onFocus={e => e.target.style.borderColor = '#009688'} onBlur={e => e.target.style.borderColor = '#e0e0e0'} />
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '11px', border: '1.5px solid #e0e0e0', borderRadius: 8, background: '#fff', fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', color: '#555' }}>
            Hủy
          </button>
          <button onClick={handleSave} disabled={saving} style={{
            flex: 2, padding: '11px', border: 'none', borderRadius: 8,
            background: '#009688', color: '#fff',
            fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
            opacity: saving ? 0.7 : 1,
          }}>
            {saving ? 'Đang lưu...' : editTeam ? 'Lưu thay đổi' : 'Tạo đội tuyển'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Add Member Modal ─────────────────────────────────────────────────────────
function AddMemberModal({ open, teamId, existingIds, onClose, onAdded }) {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('MEMBER');
  const [selectedId, setSelectedId] = useState('');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!open) return;
    userAPI.getAll({ size: 200 })
      .then(r => setUsers(r.data?.content || r.data || []))
      .catch(() => {});
    setSearch(''); setSelectedId(''); setRole('MEMBER'); setErr('');
  }, [open]);

  const filtered = users.filter(u =>
    !existingIds.includes(u.id) &&
    (u.fullName.toLowerCase().includes(search.toLowerCase()) ||
     (u.mssv || '').includes(search) ||
     u.email.toLowerCase().includes(search.toLowerCase()))
  );

  const handleAdd = async () => {
    if (!selectedId) { setErr('Vui lòng chọn người dùng.'); return; }
    setSaving(true);
    try {
      await teamAPI.addMember(teamId, { userId: Number(selectedId), role });
      onAdded();
      onClose();
    } catch (e) {
      setErr(e?.response?.data?.message || 'Có lỗi xảy ra.');
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 2100, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 480, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', padding: 28, maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1a202c', margin: 0 }}>👤 Thêm thành viên</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#aaa' }}>✕</button>
        </div>

        {err && <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#991b1b', borderRadius: 8, padding: '8px 12px', fontSize: 13, marginBottom: 12 }}>{err}</div>}

        <input value={search} onChange={e => { setSearch(e.target.value); setSelectedId(''); }}
          placeholder="🔍 Tìm theo tên, MSSV, email..."
          style={{ padding: '9px 12px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', outline: 'none', marginBottom: 12 }}
          onFocus={e => e.target.style.borderColor = '#009688'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />

        <div style={{ flex: 1, overflowY: 'auto', marginBottom: 14, maxHeight: 300 }}>
          {filtered.slice(0, 30).map(u => (
            <div key={u.id} onClick={() => setSelectedId(String(u.id))}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', borderRadius: 8, cursor: 'pointer',
                background: selectedId === String(u.id) ? '#f0fdfa' : 'transparent',
                border: selectedId === String(u.id) ? '1.5px solid #009688' : '1.5px solid transparent',
                marginBottom: 4, transition: 'all 0.1s',
              }}>
              <Avatar name={u.fullName} url={u.avatarUrl} size={34} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#1a202c' }}>{u.fullName}</div>
                <div style={{ fontSize: 11, color: '#888' }}>{u.mssv ? `${u.mssv} · ` : ''}{u.email}</div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '20px 0', color: '#aaa', fontSize: 13 }}>Không tìm thấy.</div>
          )}
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 5 }}>Vai trò trong đội</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {['MEMBER', 'CAPTAIN'].map(r => (
              <button key={r} onClick={() => setRole(r)} style={{
                flex: 1, padding: '9px', border: `1.5px solid ${role === r ? '#009688' : '#e5e7eb'}`,
                borderRadius: 8, background: role === r ? '#009688' : '#fff',
                color: role === r ? '#fff' : '#555', fontSize: 13, fontWeight: role === r ? 700 : 400,
                cursor: 'pointer', fontFamily: 'inherit',
              }}>
                {r === 'CAPTAIN' ? '⭐ Đội trưởng' : '👤 Thành viên'}
              </button>
            ))}
          </div>
        </div>

        <button onClick={handleAdd} disabled={saving || !selectedId} style={{
          width: '100%', padding: '11px', border: 'none', borderRadius: 8,
          background: selectedId ? '#009688' : '#e5e7eb',
          color: selectedId ? '#fff' : '#aaa',
          fontSize: 14, fontWeight: 700, cursor: selectedId ? 'pointer' : 'not-allowed',
          fontFamily: 'inherit',
        }}>
          {saving ? 'Đang thêm...' : '✅ Thêm vào đội'}
        </button>
      </div>
    </div>
  );
}

// ── Team Detail Panel ────────────────────────────────────────────────────────
function TeamDetailPanel({ team, onClose, onRefresh }) {
  const [members, setMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);

  const loadMembers = useCallback(() => {
    if (!team) return;
    setLoadingMembers(true);
    teamAPI.getById(team.id)
      .then(r => setMembers(r.data?.members || []))
      .catch(console.error)
      .finally(() => setLoadingMembers(false));
  }, [team]);

  useEffect(() => { loadMembers(); }, [loadMembers]);

  const handleRemoveMember = async (userId, name) => {
    if (!window.confirm(`Xóa ${name} khỏi đội tuyển?`)) return;
    try {
      await teamAPI.removeMember(team.id, userId);
      notify(`Đã xóa ${name} khỏi đội.`);
      loadMembers();
      onRefresh();
    } catch (e) {
      notify(e?.response?.data?.message || 'Lỗi!', 'error');
    }
  };

  const handleToggleCaptain = async (m) => {
    const newRole = m.memberRole === 'CAPTAIN' ? 'MEMBER' : 'CAPTAIN';
    try {
      await teamAPI.updateMemberRole(team.id, m.userId, newRole);
      notify(newRole === 'CAPTAIN' ? `Đã bổ nhiệm ${m.fullName} làm đội trưởng.` : `Đã hạ ${m.fullName} thành thành viên.`);
      loadMembers();
    } catch (e) {
      notify('Lỗi khi đổi vai trò!', 'error');
    }
  };

  if (!team) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, right: 0, bottom: 0, width: 420, zIndex: 1500,
      background: '#fff', boxShadow: '-4px 0 24px rgba(0,0,0,0.15)',
      display: 'flex', flexDirection: 'column',
      fontFamily: "'Be Vietnam Pro',sans-serif",
    }}>
      {/* Header */}
      <div style={{
        padding: '20px 20px 16px',
        background: 'linear-gradient(135deg,#0f2a6e,#1a4298)',
        color: '#fff', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ fontSize: 28 }}>{subjectEmoji(team.subject)}</div>
            <div>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, lineHeight: 1.4 }}>{team.name}</h3>
              <span style={{
                display: 'inline-block', marginTop: 4,
                background: 'rgba(255,255,255,0.2)', color: '#fff',
                fontSize: 10, fontWeight: 700, padding: '1px 8px', borderRadius: 20,
              }}>{team.subject || 'Chưa phân loại'}</span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', borderRadius: 8, padding: '4px 10px', cursor: 'pointer', fontSize: 15 }}>✕</button>
        </div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)' }}>
          👥 {members.length} thành viên
          {team.coachName ? ` · 🎓 HLV: ${team.coachName}` : ''}
        </div>
      </div>

      {/* Add member btn */}
      <div style={{ padding: '14px 16px', borderBottom: '1px solid #f0f0f0', flexShrink: 0 }}>
        <button onClick={() => setShowAddMember(true)} style={{
          width: '100%', padding: '9px', border: 'none', borderRadius: 8,
          background: '#009688', color: '#fff',
          fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
        }}>
          ➕ Thêm thành viên
        </button>
      </div>

      {/* Members list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
        {loadingMembers ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#aaa', fontSize: 13 }}>Đang tải...</div>
        ) : members.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#aaa' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>👥</div>
            <p style={{ fontSize: 13 }}>Chưa có thành viên nào.</p>
          </div>
        ) : (
          members.map(m => (
            <div key={m.memberId} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', borderRadius: 10, marginBottom: 8,
              background: m.memberRole === 'CAPTAIN' ? '#eff6ff' : '#f9fafb',
              border: `1px solid ${m.memberRole === 'CAPTAIN' ? '#bfdbfe' : '#f0f0f0'}`,
            }}>
              <Avatar name={m.fullName} url={m.avatarUrl} size={36} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#1a202c' }}>{m.fullName}</span>
                  {m.memberRole === 'CAPTAIN' && (
                    <span style={{ background: '#1d4ed8', color: '#fff', fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 20 }}>ĐT</span>
                  )}
                </div>
                <p style={{ margin: '1px 0 0', fontSize: 11, color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {m.mssv || m.email}
                </p>
              </div>
              <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                <button
                  onClick={() => handleToggleCaptain(m)}
                  title={m.memberRole === 'CAPTAIN' ? 'Hạ xuống thành viên' : 'Bổ nhiệm đội trưởng'}
                  style={{
                    background: m.memberRole === 'CAPTAIN' ? '#dbeafe' : '#f0fdf4',
                    border: 'none', borderRadius: 6, padding: '4px 8px',
                    cursor: 'pointer', fontSize: 12, color: m.memberRole === 'CAPTAIN' ? '#1d4ed8' : '#15803d',
                  }}>
                  {m.memberRole === 'CAPTAIN' ? '👤' : '⭐'}
                </button>
                <button
                  onClick={() => handleRemoveMember(m.userId, m.fullName)}
                  title="Xóa khỏi đội"
                  style={{ background: '#fef2f2', border: 'none', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', fontSize: 12, color: '#dc2626' }}>
                  🗑
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <AddMemberModal
        open={showAddMember}
        teamId={team.id}
        existingIds={members.map(m => m.userId)}
        onClose={() => setShowAddMember(false)}
        onAdded={() => { loadMembers(); onRefresh(); notify('Đã thêm thành viên!'); }}
      />
    </div>
  );
}

// ── Main Admin Teams Page ─────────────────────────────────────────────────────
export default function AdminTeamsPage() {
  const [teams, setTeams]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [showModal, setShowModal]   = useState(false);
  const [editTeam, setEditTeam]     = useState(null);
  const [detailTeam, setDetailTeam] = useState(null);

  const loadTeams = useCallback(() => {
    setLoading(true);
    teamAPI.adminGetAll(search || undefined)
      .then(r => setTeams(r.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [search]);

  useEffect(() => { loadTeams(); }, [loadTeams]);

  const handleToggleActive = async (team) => {
    try {
      await teamAPI.toggleActive(team.id);
      notify(`Đã ${team.isActive ? 'vô hiệu hóa' : 'kích hoạt'} đội tuyển "${team.name}"`);
      loadTeams();
    } catch { notify('Lỗi!', 'error'); }
  };

  const handleDelete = async (team) => {
    if (!window.confirm(`Xóa đội tuyển "${team.name}"? Hành động này không thể hoàn tác.`)) return;
    try {
      await teamAPI.delete(team.id);
      notify(`Đã xóa đội tuyển "${team.name}"`);
      if (detailTeam?.id === team.id) setDetailTeam(null);
      loadTeams();
    } catch { notify('Lỗi khi xóa!', 'error'); }
  };

  const stats = {
    total:  teams.length,
    active: teams.filter(t => t.isActive).length,
    members: teams.reduce((s, t) => s + (t.memberCount || 0), 0),
    subjects: [...new Set(teams.map(t => t.subject).filter(Boolean))].length,
  };

  return (
    <AdminLayout>
      <style>{`@keyframes slideIn{from{transform:translateX(20px);opacity:0}to{transform:none;opacity:1}}`}</style>

      {/* Page header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1a202c', margin: 0 }}>🏆 Quản lý Đội tuyển</h1>
        <p style={{ color: '#888', fontSize: 13, margin: '4px 0 0' }}>Tạo và quản lý các đội tuyển tham gia thi Olympic</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 24, flexWrap: 'wrap' }}>
        {[
          { label: 'Tổng đội tuyển', value: stats.total, color: '#3b82f6', icon: '🏆' },
          { label: 'Đang hoạt động', value: stats.active, color: '#10b981', icon: '✅' },
          { label: 'Tổng thành viên', value: stats.members, color: '#f59e0b', icon: '👥' },
          { label: 'Số môn thi',      value: stats.subjects, color: '#8b5cf6', icon: '📚' },
        ].map(s => (
          <div key={s.label} style={{
            background: '#fff', borderRadius: 12, padding: '14px 20px',
            flex: '1 1 120px', border: '1.5px solid #f0f0f0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          }}>
            <div style={{ fontSize: 20 }}>{s.icon}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: s.color, margin: '4px 0 2px' }}>{s.value}</div>
            <div style={{ fontSize: 11, color: '#888' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#aaa', fontSize: 15 }}>🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Tìm theo tên, môn thi..."
            style={{
              width: '100%', boxSizing: 'border-box',
              padding: '9px 12px 9px 36px',
              border: '1.5px solid #e5e7eb', borderRadius: 8,
              fontSize: 13, fontFamily: 'inherit', outline: 'none', background: '#fafafa',
            }}
            onFocus={e => e.target.style.borderColor = '#009688'}
            onBlur={e => e.target.style.borderColor = '#e5e7eb'}
          />
        </div>
        <button onClick={() => { setEditTeam(null); setShowModal(true); }} style={{
          padding: '9px 18px', border: 'none', borderRadius: 8,
          background: '#009688', color: '#fff',
          fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
          whiteSpace: 'nowrap',
        }}>
          ➕ Thêm đội tuyển
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#aaa' }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>⏳</div>
          <p style={{ fontSize: 14 }}>Đang tải...</p>
        </div>
      ) : teams.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#aaa' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🏆</div>
          <p style={{ fontSize: 15 }}>Chưa có đội tuyển nào.</p>
          <button onClick={() => { setEditTeam(null); setShowModal(true); }} style={{
            marginTop: 12, padding: '9px 20px', border: 'none', borderRadius: 8,
            background: '#009688', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
          }}>
            Tạo đội tuyển đầu tiên
          </button>
        </div>
      ) : (
        <div style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #f0f0f0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f0f0f0' }}>
                  {['Đội tuyển', 'Môn thi', 'HLV', 'Thành viên', 'Trạng thái', 'Hành động'].map(h => (
                    <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#888', letterSpacing: 0.3, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {teams.map(team => {
                  const ss = subjectStyle(team.subject);
                  return (
                    <tr key={team.id}
                      style={{ borderBottom: '1px solid #f7f7f7', opacity: team.isActive ? 1 : 0.6 }}
                      onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      {/* Team name */}
                      <td style={{ padding: '13px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{
                            width: 38, height: 38, borderRadius: 10,
                            background: ss.bg, flexShrink: 0,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
                          }}>{subjectEmoji(team.subject)}</div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: '#1a202c' }}>{team.name}</div>
                            {team.description && (
                              <div style={{ fontSize: 11, color: '#aaa', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {team.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Subject */}
                      <td style={{ padding: '13px 14px' }}>
                        {team.subject ? (
                          <span style={{
                            background: ss.bg, color: ss.text,
                            fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 16,
                          }}>{team.subject}</span>
                        ) : <span style={{ color: '#ccc', fontSize: 13 }}>—</span>}
                      </td>

                      {/* Coach */}
                      <td style={{ padding: '13px 14px', fontSize: 13, color: '#555' }}>
                        {team.coachName || <span style={{ color: '#ccc' }}>—</span>}
                      </td>

                      {/* Members */}
                      <td style={{ padding: '13px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 15, fontWeight: 700, color: '#1a202c' }}>{team.memberCount}</span>
                          <span style={{ fontSize: 12, color: '#aaa' }}>người</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '13px 14px' }}>
                        <span style={{
                          background: team.isActive ? '#f0fdf4' : '#fef2f2',
                          color: team.isActive ? '#166534' : '#991b1b',
                          fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 16,
                        }}>
                          {team.isActive ? '✅ Hoạt động' : '❌ Vô hiệu'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '13px 14px' }}>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          <button
                            onClick={() => setDetailTeam(team)}
                            title="Xem thành viên"
                            style={{ background: '#eff6ff', border: 'none', borderRadius: 6, padding: '5px 10px', cursor: 'pointer', fontSize: 12, color: '#1d4ed8', fontWeight: 600, fontFamily: 'inherit' }}>
                            👥 Thành viên
                          </button>
                          <button
                            onClick={() => { setEditTeam(team); setShowModal(true); }}
                            title="Chỉnh sửa"
                            style={{ background: '#3b82f6', border: 'none', borderRadius: 6, padding: '5px 12px', cursor: 'pointer', fontSize: 12, color: '#fff', fontWeight: 700, fontFamily: 'inherit' }}>
                            Sửa
                          </button>
                          <button
                            onClick={() => handleToggleActive(team)}
                            title={team.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
                            style={{
                              background: team.isActive ? '#fef2f2' : '#f0fdf4',
                              border: 'none', borderRadius: 6, padding: '5px 10px',
                              cursor: 'pointer', fontSize: 12,
                              color: team.isActive ? '#dc2626' : '#16a34a',
                              fontFamily: 'inherit',
                            }}>
                            {team.isActive ? '🔒' : '🔓'}
                          </button>
                          <button
                            onClick={() => handleDelete(team)}
                            title="Xóa"
                            style={{ background: '#fef2f2', border: 'none', borderRadius: 6, padding: '5px 10px', cursor: 'pointer', fontSize: 12, color: '#dc2626', fontFamily: 'inherit' }}>
                            🗑
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      <TeamFormModal
        open={showModal}
        onClose={() => setShowModal(false)}
        editTeam={editTeam}
        onSaved={() => {
          notify(editTeam ? 'Đã cập nhật đội tuyển!' : 'Đã tạo đội tuyển mới!');
          loadTeams();
        }}
      />

      {/* Side panel */}
      {detailTeam && (
        <TeamDetailPanel
          team={detailTeam}
          onClose={() => setDetailTeam(null)}
          onRefresh={loadTeams}
        />
      )}
    </AdminLayout>
  );
}