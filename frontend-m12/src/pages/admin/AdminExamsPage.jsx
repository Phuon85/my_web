import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from './AdminLayout';
import { contestAPI } from '../../api/axios';
import { Spinner, Modal } from '../../components/ui';

const STATUS_META = {
  DRAFT:     { label: 'Bản nháp',     bg: '#f9fafb', text: '#6b7280',  dot: '#9ca3af' },
  PUBLISHED: { label: 'Mở đăng ký',  bg: '#f0fdf4', text: '#166534',  dot: '#10b981' },
  LIVE:      { label: 'Đang diễn ra', bg: '#fef2f2', text: '#991b1b',  dot: '#ef4444' },
  ENDED:     { label: 'Đã kết thúc', bg: '#f9fafb', text: '#6b7280',  dot: '#9ca3af' },
  DELETED:   { label: 'Đã xóa',      bg: '#fef2f2', text: '#991b1b',  dot: '#ef4444' },
};

function StatusBadge({ status }) {
  const m = STATUS_META[status] || STATUS_META.DRAFT;
  return (
    <span style={{ background: m.bg, color: m.text, fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 16, display: 'inline-flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap' }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: m.dot, display: 'inline-block' }} />
      {m.label}
    </span>
  );
}

function fmtDate(dt) {
  if (!dt) return '—';
  const d = new Date(dt);
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' ' +
    d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

function ContestFormModal({ open, onClose, editContest, onSaved }) {
  const emptyForm = { title: '', description: '', subject: '', startTime: '', endTime: '', durationMinutes: '', prizeFirst: '', prizeSecond: '', prizeThird: '' };
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (editContest) {
      const fmt = dt => dt ? new Date(dt).toISOString().slice(0,16) : '';
      setForm({
        title: editContest.title || '', description: editContest.description || '',
        subject: editContest.subject || '', startTime: fmt(editContest.startTime),
        endTime: fmt(editContest.endTime), durationMinutes: editContest.durationMinutes || '',
        prizeFirst: editContest.prizeFirst || '', prizeSecond: editContest.prizeSecond || '',
        prizeThird: editContest.prizeThird || '',
      });
    } else { setForm(emptyForm); }
    setErr('');
  }, [editContest, open]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.title.trim()) { setErr('Vui lòng nhập tên kỳ thi.'); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        startTime: form.startTime || null,
        endTime:   form.endTime   || null,
        durationMinutes: form.durationMinutes ? parseInt(form.durationMinutes) : null,
      };
      if (editContest) await contestAPI.update(editContest.id, payload);
      else             await contestAPI.create(payload);
      onSaved();
      onClose();
    } catch (e) {
      setErr(e?.response?.data?.message || 'Có lỗi xảy ra.');
    } finally { setSaving(false); }
  };

  if (!open) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', padding: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontSize: 17, fontWeight: 700, color: '#1a202c', margin: 0 }}>
            {editContest ? 'Chỉnh sửa kỳ thi' : 'Tạo kỳ thi mới'}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#aaa' }}>✕</button>
        </div>

        {err && <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#991b1b', borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 14 }}>{err}</div>}

        {/* Fields */}
        {[
          { key: 'title',       label: 'Tên kỳ thi *',    placeholder: 'Olympic Toán 2025', full: true },
          { key: 'subject',     label: 'Môn thi',          placeholder: 'Toán học, Vật lý, CNTT...' },
          { key: 'description', label: 'Mô tả',            placeholder: 'Mô tả ngắn về kỳ thi...', area: true },
        ].map(({ key, label, placeholder, full, area }) => (
          <div key={key} style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 5 }}>{label}</label>
            {area ? (
              <textarea value={form[key]} onChange={e => set(key, e.target.value)} placeholder={placeholder} rows={3}
                style={{ width: '100%', boxSizing: 'border-box', padding: '10px 13px', border: '1.5px solid #e0e0e0', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', outline: 'none', resize: 'vertical' }} />
            ) : (
              <input value={form[key]} onChange={e => set(key, e.target.value)} placeholder={placeholder}
                style={{ width: '100%', boxSizing: 'border-box', padding: '10px 13px', border: '1.5px solid #e0e0e0', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', outline: 'none' }} />
            )}
          </div>
        ))}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
          {[{ key: 'startTime', label: 'Thời gian bắt đầu', type: 'datetime-local' },
            { key: 'endTime',   label: 'Thời gian kết thúc', type: 'datetime-local' }].map(({ key, label, type }) => (
            <div key={key}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 5 }}>{label}</label>
              <input type={type} value={form[key]} onChange={e => set(key, e.target.value)}
                style={{ width: '100%', boxSizing: 'border-box', padding: '10px 13px', border: '1.5px solid #e0e0e0', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', outline: 'none' }} />
            </div>
          ))}
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 5 }}>Thời lượng (phút)</label>
          <input type="number" value={form.durationMinutes} onChange={e => set('durationMinutes', e.target.value)} placeholder="90"
            style={{ width: '100%', boxSizing: 'border-box', padding: '10px 13px', border: '1.5px solid #e0e0e0', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', outline: 'none' }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 20 }}>
          {[{ key: 'prizeFirst', label: '🥇 Giải Nhất' }, { key: 'prizeSecond', label: '🥈 Giải Nhì' }, { key: 'prizeThird', label: '🥉 Giải Ba' }].map(({ key, label }) => (
            <div key={key}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 5 }}>{label}</label>
              <input value={form[key]} onChange={e => set(key, e.target.value)} placeholder="500.000 VND"
                style={{ width: '100%', boxSizing: 'border-box', padding: '10px 8px', border: '1.5px solid #e0e0e0', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', outline: 'none' }} />
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '10px 20px', background: '#f5f5f5', border: 'none', borderRadius: 8, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>Hủy</button>
          <button onClick={handleSave} disabled={saving}
            style={{ padding: '10px 22px', background: saving ? '#ccc' : '#009688', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
            {saving ? 'Đang lưu...' : (editContest ? 'Cập nhật' : 'Tạo kỳ thi')}
          </button>
        </div>
      </div>
    </div>
  );
}

const PAGE_SIZE = 10;

export default function AdminExamsPage() {
  const [contests, setContests]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [toast, setToast]         = useState({ msg: '', type: 'success' });
  const [search, setSearch]       = useState('');
  const [statusFilter, setStatus] = useState('');
  const [page, setPage]           = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editContest, setEdit]    = useState(null);

  const notify = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: 'success' }), 3000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (statusFilter)  params.status = statusFilter;
      const res = await contestAPI.adminGetAll(params);
      setContests(res.data || []);
      setPage(1);
    } catch { notify('Không thể tải danh sách kỳ thi.', 'error'); }
    finally { setLoading(false); }
  }, [search, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const handlePublish = async (c) => {
    if (!window.confirm(`Công bố "${c.title}"?`)) return;
    try { await contestAPI.publish(c.id); notify('Đã công bố!'); load(); }
    catch (e) { notify(e?.response?.data?.message || 'Lỗi khi công bố.', 'error'); }
  };

  const handleDelete = async (c) => {
    if (!window.confirm(`Xóa kỳ thi "${c.title}"? (Chuyển sang trạng thái đã xóa)`)) return;
    try { await contestAPI.delete(c.id); notify('Đã xóa kỳ thi.'); load(); }
    catch { notify('Lỗi khi xóa.', 'error'); }
  };

  const handleRestore = async (c) => {
    try { await contestAPI.restore(c.id); notify('Đã khôi phục.'); load(); }
    catch { notify('Lỗi khi khôi phục.', 'error'); }
  };

  const totalPages = Math.ceil(contests.length / PAGE_SIZE);
  const paged = contests.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <AdminLayout>
      <p style={{ color: '#888', fontSize: 13, margin: '0 0 18px' }}>Quản lý kỳ thi</p>

      {toast.msg && (
        <div style={{ position: 'fixed', top: 20, right: 24, zIndex: 3000, background: toast.type === 'success' ? '#f0fdf4' : '#fef2f2', border: `1px solid ${toast.type === 'success' ? '#86efac' : '#fca5a5'}`, color: toast.type === 'success' ? '#166534' : '#991b1b', borderRadius: 10, padding: '12px 18px', fontSize: 14, boxShadow: '0 4px 16px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: 8 }}>
          {toast.type === 'success' ? '✅' : '❌'} {toast.msg}
        </div>
      )}

      <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.07)', padding: '24px 28px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, background: '#e0f2f1', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🎓</div>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1a202c', margin: 0 }}>Quản lý Kỳ thi</h2>
              <p style={{ color: '#888', fontSize: 13, margin: '3px 0 0' }}>Quản lý và giám sát các kỳ thi trong hệ thống</p>
            </div>
          </div>
          <button onClick={() => { setEdit(null); setShowModal(true); }}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#009688', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 18px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 3px 10px rgba(0,150,136,0.3)' }}>
            + Tạo kỳ thi mới
          </button>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#aaa' }}>🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm tên kỳ thi..."
              style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px 9px 36px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', outline: 'none', background: '#fafafa' }} />
          </div>
          <select value={statusFilter} onChange={e => setStatus(e.target.value)}
            style={{ padding: '9px 12px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', background: '#fafafa', cursor: 'pointer', outline: 'none', minWidth: 150 }}>
            <option value="">Trạng thái: Tất cả</option>
            {Object.entries(STATUS_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>

        {/* Table */}
        {loading ? <Spinner /> : paged.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#aaa' }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>🎓</div>
            <p>Không có kỳ thi nào.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f0f0f0' }}>
                  {['ID', 'Tên kỳ thi', 'Người tạo', 'Ngày thi', 'Trạng thái', 'Hành động'].map(h => (
                    <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#888', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paged.map(c => (
                  <tr key={c.id} style={{ borderBottom: '1px solid #f7f7f7' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '12px 12px', fontSize: 13, color: '#888', fontWeight: 600 }}>#{String(c.id).padStart(4, '0')}</td>
                    <td style={{ padding: '12px 12px', minWidth: 200 }}>
                      <p style={{ fontSize: 14, fontWeight: 600, color: c.status === 'DELETED' ? '#aaa' : '#1a202c', margin: 0, textDecoration: c.status === 'DELETED' ? 'line-through' : 'none' }}>{c.title}</p>
                      {c.subject && <p style={{ fontSize: 12, color: '#888', margin: '2px 0 0' }}>{c.subject}</p>}
                    </td>
                    <td style={{ padding: '12px 12px', fontSize: 13, color: '#555' }}>{c.creatorName || '—'}</td>
                    <td style={{ padding: '12px 12px', fontSize: 12, color: '#666', whiteSpace: 'nowrap' }}>
                      {c.startTime ? <>{fmtDate(c.startTime)}<br /><span style={{ color: '#aaa' }}>đến {fmtDate(c.endTime)}</span></> : '—'}
                    </td>
                    <td style={{ padding: '12px 12px' }}><StatusBadge status={c.status} /></td>
                    <td style={{ padding: '12px 12px' }}>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {c.status === 'DELETED' ? (
                          <button onClick={() => handleRestore(c)} style={{ background: '#e0f2f1', color: '#009688', border: 'none', borderRadius: 6, padding: '5px 10px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>↩ Khôi phục</button>
                        ) : (
                          <>
                            <button onClick={() => { setEdit(c); setShowModal(true); }} style={{ background: '#eff6ff', color: '#1d4ed8', border: 'none', borderRadius: 6, padding: '5px 10px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>✏️ Sửa</button>
                            {c.status === 'DRAFT' && (
                              <button onClick={() => handlePublish(c)} style={{ background: '#f0fdf4', color: '#166534', border: 'none', borderRadius: 6, padding: '5px 10px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>📢 Công bố</button>
                            )}
                            <button onClick={() => handleDelete(c)} style={{ background: '#fef2f2', color: '#dc2626', border: 'none', borderRadius: 6, padding: '5px 10px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>🗑️ Xóa</button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && contests.length > PAGE_SIZE && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 18 }}>
            <p style={{ fontSize: 13, color: '#888', margin: 0 }}>
              Hiển thị {(page-1)*PAGE_SIZE+1}–{Math.min(page*PAGE_SIZE, contests.length)} / {contests.length} kỳ thi
            </p>
            <div style={{ display: 'flex', gap: 4 }}>
              {['← Trước', ...Array.from({length: Math.min(totalPages,5)},(_,i)=>i+1), 'Sau →'].map((l, i) => {
                const isNum = typeof l === 'number';
                const dis = l === '← Trước' ? page===1 : l === 'Sau →' ? page===totalPages : false;
                const active = l === page;
                return (
                  <button key={i} disabled={dis} onClick={() => {
                    if (l === '← Trước') setPage(p=>p-1);
                    else if (l === 'Sau →') setPage(p=>p+1);
                    else setPage(l);
                  }} style={{ padding: '6px 12px', border: `1.5px solid ${active?'#009688':'#e5e7eb'}`, borderRadius: 7, fontSize: 13, background: active?'#009688':'#fff', color: active?'#fff':dis?'#ccc':'#555', cursor: dis?'not-allowed':'pointer', fontFamily: 'inherit', fontWeight: active?700:400 }}>
                    {l}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <ContestFormModal open={showModal} onClose={() => setShowModal(false)} editContest={editContest} onSaved={() => { notify(editContest ? 'Đã cập nhật kỳ thi.' : 'Đã tạo kỳ thi mới.'); load(); }} />
    </AdminLayout>
  );
}