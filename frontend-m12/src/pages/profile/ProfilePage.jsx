import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import { Card, Btn, Input, Select, Toast, PageContainer } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { userAPI, authAPI } from '../../api/axios';

const KHOAS = [
  'Khoa Khoa học Cơ bản','Khoa Công nghệ Thông tin','Khoa Điện - Điện tử',
  'Khoa Cơ khí','Khoa Xây dựng','Khoa Mỏ','Khoa Địa chất',
  'Khoa Kinh tế','Khoa Môi trường',
].map(k => ({ value: k, label: k }));

// ── Change Password Modal ────────────────────────────────────────────────────
function ChangePasswordModal({ open, onClose, onSuccess }) {
  const [form, setForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);

  useEffect(() => {
    if (!open) { setForm({ oldPassword: '', newPassword: '', confirmPassword: '' }); setError(''); }
  }, [open]);

  if (!open) return null;

  const inp = {
    width: '100%', boxSizing: 'border-box', padding: '10px 14px',
    border: '1.5px solid #e0e0e0', borderRadius: 8,
    fontSize: 14, fontFamily: 'inherit', outline: 'none',
    background: '#fafafa', color: '#222', marginBottom: 12,
  };

  const handleSubmit = async () => {
    if (!form.oldPassword || !form.newPassword || !form.confirmPassword) {
      setError('Vui lòng điền đầy đủ thông tin.'); return;
    }
    if (form.newPassword.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự.'); return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.'); return;
    }
    setLoading(true); setError('');
    try {
      await authAPI.changePassword({ oldPassword: form.oldPassword, newPassword: form.newPassword });
      onSuccess('Đổi mật khẩu thành công!');
      onClose();
    } catch (e) {
      setError(e.response?.data?.message || 'Đổi mật khẩu thất bại. Kiểm tra lại mật khẩu cũ.');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.48)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 28, width: '100%', maxWidth: 420, boxShadow: '0 20px 60px rgba(0,0,0,0.22)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontSize: 17, fontWeight: 700, color: '#1a202c', margin: 0 }}>🔐 Đổi mật khẩu</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#aaa' }}>✕</button>
        </div>

        {error && <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '10px 14px', marginBottom: 12, color: '#991b1b', fontSize: 13 }}>❌ {error}</div>}

        <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>Mật khẩu hiện tại</label>
        <div style={{ position: 'relative', marginBottom: 12 }}>
          <input type={showOld ? 'text' : 'password'} style={{ ...inp, marginBottom: 0, paddingRight: 44 }}
            placeholder="Nhập mật khẩu hiện tại"
            value={form.oldPassword} onChange={e => setForm(f => ({ ...f, oldPassword: e.target.value }))} />
          <span onClick={() => setShowOld(p => !p)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#aaa' }}>{showOld ? '🙈' : '👁'}</span>
        </div>

        <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>Mật khẩu mới</label>
        <div style={{ position: 'relative', marginBottom: 12 }}>
          <input type={showNew ? 'text' : 'password'} style={{ ...inp, marginBottom: 0, paddingRight: 44 }}
            placeholder="Tối thiểu 6 ký tự"
            value={form.newPassword} onChange={e => setForm(f => ({ ...f, newPassword: e.target.value }))} />
          <span onClick={() => setShowNew(p => !p)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#aaa' }}>{showNew ? '🙈' : '👁'}</span>
        </div>

        <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>Xác nhận mật khẩu mới</label>
        <input type="password" style={inp} placeholder="Nhập lại mật khẩu mới"
          value={form.confirmPassword}
          onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()} />

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: 11, border: '1.5px solid #e0e0e0', borderRadius: 8, background: '#fff', fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>Hủy</button>
          <button onClick={handleSubmit} disabled={loading}
            style={{ flex: 2, padding: 11, background: loading ? '#ccc' : 'linear-gradient(90deg,#1a3a8f,#1a7a4a)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
            {loading ? '⏳ Đang xử lý...' : '🔐 Xác nhận đổi mật khẩu'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  // ── State ────────────────────────────────────────────────────────────────
  const [profile,  setProfile]  = useState(null);   // dữ liệu thật từ API
  const [loading,  setLoading]  = useState(true);
  const [editing,  setEditing]  = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [form,     setForm]     = useState({});
  const [toast,    setToast]    = useState({ msg:'', type:'success' });
  const [badges,   setBadges]   = useState([]);
  const [history,  setHistory]  = useState([]);
  const [changePwOpen, setChangePwOpen] = useState(false);

  // ── Fetch profile thật từ API ────────────────────────────────────────────
  useEffect(() => {
    setLoading(true);
    authAPI.me()
      .then(r => {
        setProfile(r.data);
        setForm({
          fullName:  r.data.fullName  || '',
          lop:       r.data.lop       || '',
          khoa:      r.data.khoa      || '',
          avatarUrl: r.data.avatarUrl || '',
        });
        updateUser(r.data); // cập nhật context
      })
      .catch(() => {
        // Nếu API lỗi, dùng data từ context
        if (user) {
          setProfile(user);
          setForm({ fullName: user.fullName||'', lop: user.lop||'', khoa: user.khoa||'', avatarUrl: user.avatarUrl||'' });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  // ── Fetch badges & contest history (mock vì chưa có API riêng) ───────────
  useEffect(() => {
    setBadges([
      { name:'Giải Nhất Toán 2025', icon:'👑', color:'#f59e0b' },
      { name:'Chiến binh Code',     icon:'💻', color:'#6b7280' },
      { name:'Top 10 Hackathon',    icon:'🏅', color:'#ef4444' },
      { name:'Học sinh xuất sắc',   icon:'⭐', color:'#8b5cf6' },
    ]);
    setHistory([
      { name:'Olympic Toán học Quốc gia 2025', date:'15/01/2025', result:'Giải Nhất', score:'95/100 điểm', color:'#f59e0b', icon:'🏆' },
      { name:'Hackathon HUMG 2024',            date:'28/12/2024', result:'Top 10',    score:'8/10 điểm',   color:'#3b82f6', icon:'💻' },
      { name:'Olympic Hóa học 2024',           date:'10/12/2024', result:'Giải Ba',   score:'78/100 điểm', color:'#f97316', icon:'🔬' },
    ]);
  }, []);

  // ── Lưu hồ sơ ────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await userAPI.updateMe({
        fullName:  form.fullName,
        lop:       form.lop,
        khoa:      form.khoa,
        avatarUrl: form.avatarUrl,
      });
      setProfile(res.data);
      updateUser(res.data);
      setEditing(false);
      setToast({ msg:'Cập nhật hồ sơ thành công!', type:'success' });
    } catch (e) {
      setToast({ msg: e.response?.data?.message || 'Cập nhật thất bại', type:'error' });
    } finally { setSaving(false); }
  };

  const showToast = toast.msg;

  if (loading) return (
    <div style={{ minHeight:'100vh', background:'#f5f6fa', fontFamily:"'Be Vietnam Pro',sans-serif" }}>
      <Navbar />
      <div style={{ display:'flex', justifyContent:'center', alignItems:'center', padding:80 }}>
        <div style={{ textAlign:'center' }}>
          <div style={{ fontSize:40, marginBottom:12 }}>⏳</div>
          <p style={{ color:'#888', fontSize:14 }}>Đang tải hồ sơ...</p>
        </div>
      </div>
    </div>
  );

  const p = profile || user;
  if (!p) return null;

  const inp = {
    width:'100%', boxSizing:'border-box', padding:'10px 14px',
    border:'1.5px solid #e0e0e0', borderRadius:8,
    fontSize:14, outline:'none', fontFamily:'inherit',
    background:'#fafafa', color:'#222', marginBottom:10,
  };

  return (
    <div style={{ minHeight:'100vh', background:'#f5f6fa', fontFamily:"'Be Vietnam Pro',sans-serif" }}>
      <Navbar />
      <PageContainer maxWidth={1000}>

        {/* Header banner */}
        <div style={{
          background:'linear-gradient(135deg,#0f2a6e 0%,#1a7a4a 100%)',
          borderRadius:16, marginBottom:24, overflow:'hidden',
          boxShadow:'0 4px 20px rgba(0,0,0,0.15)',
        }}>
          <div style={{ padding:'32px 40px', display:'flex', alignItems:'center', gap:24 }}>
            <div style={{
              width:90, height:90, borderRadius:'50%',
              border:'3px solid rgba(255,255,255,0.6)',
              background:'rgba(255,255,255,0.15)',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:40, overflow:'hidden', flexShrink:0,
            }}>
              {p.avatarUrl
                ? <img src={p.avatarUrl} style={{ width:'100%', height:'100%', objectFit:'cover' }} alt="" />
                : p.fullName?.charAt(0)?.toUpperCase() || '👨‍🎓'}
            </div>
            <div style={{ flex:1 }}>
              <h1 style={{ color:'#fff', fontSize:24, fontWeight:800, margin:'0 0 6px' }}>{p.fullName}</h1>
              <p style={{ color:'rgba(255,255,255,0.75)', fontSize:14, margin:'0 0 6px' }}>
                {p.mssv ? `MSSV: ${p.mssv} · ` : ''}{p.khoa || p.truong || 'HUMG'}
              </p>
              <div style={{ display:'flex', gap:8 }}>
                <span style={{ background:'rgba(255,255,255,0.15)', color:'#fff', fontSize:12, fontWeight:600, padding:'3px 12px', borderRadius:20 }}>
                  {p.role === 'STUDENT' ? '🎓 Sinh viên' : p.role === 'TEACHER' ? '👨‍🏫 Giảng viên' : p.role}
                </span>
                <span style={{ background: p.isInternal ? 'rgba(16,185,129,0.3)' : 'rgba(59,130,246,0.3)', color:'#fff', fontSize:12, fontWeight:600, padding:'3px 12px', borderRadius:20 }}>
                  {p.isInternal ? '🏛️ Trong trường' : '🌐 Ngoài trường'}
                </span>
              </div>
            </div>
            <button onClick={() => setEditing(e => !e)}
              style={{ padding:'9px 18px', border:'1.5px solid rgba(255,255,255,0.7)', borderRadius:8, background:'transparent', color:'#fff', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>
              ✏️ {editing ? 'Hủy' : 'Chỉnh sửa hồ sơ'}
            </button>
          </div>
        </div>

        {showToast && (
          <div style={{ background: toast.type==='success'?'#f0fdf4':'#fef2f2', border:`1px solid ${toast.type==='success'?'#86efac':'#fca5a5'}`, borderRadius:8, padding:'10px 16px', marginBottom:16, color: toast.type==='success'?'#166534':'#991b1b', fontSize:14 }}>
            {toast.type==='success'?'✅':'❌'} {toast.msg}
          </div>
        )}

        <div style={{ display:'grid', gridTemplateColumns:'280px 1fr', gap:20 }}>
          {/* LEFT */}
          <div>
            {/* Thông tin cá nhân */}
            <Card style={{ marginBottom:16 }}>
              <h3 style={{ fontSize:14, fontWeight:700, color:'#1a202c', margin:'0 0 14px' }}>👤 Thông tin cá nhân</h3>
              {editing ? (
                <>
                  <label style={{ fontSize:12, fontWeight:600, color:'#555', display:'block', marginBottom:4 }}>Họ và tên</label>
                  <input style={inp} value={form.fullName} onChange={e => setForm(f=>({...f,fullName:e.target.value}))} />

                  <label style={{ fontSize:12, fontWeight:600, color:'#555', display:'block', marginBottom:4 }}>Email</label>
                  <input style={{ ...inp, background:'#f0f0f0', color:'#888' }} value={p.email} disabled />

                  <label style={{ fontSize:12, fontWeight:600, color:'#555', display:'block', marginBottom:4 }}>Lớp</label>
                  <input style={inp} value={form.lop} onChange={e => setForm(f=>({...f,lop:e.target.value}))} placeholder="VD: CNTT K67" />

                  <label style={{ fontSize:12, fontWeight:600, color:'#555', display:'block', marginBottom:4 }}>Khoa</label>
                  <select style={{ ...inp, cursor:'pointer' }} value={form.khoa} onChange={e => setForm(f=>({...f,khoa:e.target.value}))}>
                    <option value="">Chọn khoa</option>
                    {KHOAS.map(k => <option key={k.value} value={k.value}>{k.label}</option>)}
                  </select>

                  {/* Avatar file picker */}
                  <label style={{ fontSize:12, fontWeight:600, color:'#555', display:'block', marginBottom:6 }}>Ảnh đại diện</label>
                  <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
                    <div style={{ width:52, height:52, borderRadius:'50%', overflow:'hidden', border:'2px solid #e0e0e0', flexShrink:0, background:'#f5f5f5', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>
                      {form.avatarUrl
                        ? <img src={form.avatarUrl} style={{ width:'100%', height:'100%', objectFit:'cover' }} alt="" />
                        : '👨‍🎓'}
                    </div>
                    <div style={{ flex:1 }}>
                      <input
                        id="avatar-file-input"
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        style={{ display:'none' }}
                        onChange={e => {
                          const file = e.target.files[0];
                          if (!file) return;
                          if (file.size > 2 * 1024 * 1024) { alert('Ảnh quá lớn. Vui lòng chọn ảnh dưới 2MB.'); return; }
                          const reader = new FileReader();
                          reader.onload = ev => setForm(f => ({ ...f, avatarUrl: ev.target.result }));
                          reader.readAsDataURL(file);
                        }}
                      />
                      <button type="button"
                        onClick={() => document.getElementById('avatar-file-input').click()}
                        style={{ padding:'7px 14px', border:'1.5px solid #e0e0e0', borderRadius:8, background:'#fff', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit', color:'#555', display:'block', marginBottom:4 }}>
                        📷 Chọn ảnh
                      </button>
                      <p style={{ fontSize:11, color:'#aaa', margin:0 }}>JPG, PNG, WEBP · Tối đa 2MB</p>
                    </div>
                  </div>

                  <button onClick={handleSave} disabled={saving}
                    style={{ width:'100%', padding:11, background: saving?'#e0e0e0':'linear-gradient(90deg,#1a7a4a,#1d8a55)', border:'none', borderRadius:8, color: saving?'#aaa':'#fff', fontWeight:700, cursor: saving?'not-allowed':'pointer', fontFamily:'inherit', fontSize:14 }}>
                    {saving ? '⏳ Đang lưu...' : '💾 Lưu thay đổi'}
                  </button>
                </>
              ) : (
                [
                  ['✉️', p.email],
                  ['🏛️', p.khoa || p.truong || 'Chưa cập nhật'],
                  ['📚', p.lop  || 'Chưa cập nhật'],
                  ['📅', p.createdAt ? `Tham gia: ${new Date(p.createdAt).toLocaleDateString('vi-VN')}` : '—'],
                ].map(([icon, val], i) => (
                  <div key={i} style={{ display:'flex', gap:8, alignItems:'flex-start', marginBottom:10 }}>
                    <span style={{ fontSize:14, flexShrink:0 }}>{icon}</span>
                    <span style={{ fontSize:13, color:'#555', lineHeight:1.4, wordBreak:'break-word' }}>{val}</span>
                  </div>
                ))
              )}
            </Card>

            {/* Thống kê từ API thật */}
            <Card style={{ marginBottom:16 }}>
              <h3 style={{ fontSize:14, fontWeight:700, color:'#1a202c', margin:'0 0 14px' }}>📊 Thống kê</h3>
              {[
                { label:'Tổng điểm',    val: (p.totalScore || 0).toLocaleString(), color:'#3b82f6' },
                { label:'Xếp hạng',     val: p.rank ? `#${p.rank}` : '—',          color:'#1a3a8f' },
                { label:'Trạng thái',   val: p.isActive ? 'Hoạt động' : 'Bị khóa', color: p.isActive?'#10b981':'#e53e3e' },
              ].map((s, i) => (
                <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom: i<2?'1px solid #f0f4f8':'none' }}>
                  <span style={{ fontSize:13, color:'#555' }}>{s.label}</span>
                  <span style={{ fontSize:16, fontWeight:800, color:s.color }}>{s.val}</span>
                </div>
              ))}
            </Card>

            {/* Đổi mật khẩu */}
            <button onClick={() => setChangePwOpen(true)}
              style={{ width:'100%', padding:'11px', border:'1.5px solid #e0e0e0', borderRadius:10, background:'#fff', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit', color:'#555', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
              🔐 Đổi mật khẩu
            </button>
          </div>

          {/* RIGHT */}
          <div>
            {/* Huy hiệu */}
            <Card style={{ marginBottom:20 }}>
              <h3 style={{ fontSize:15, fontWeight:700, color:'#1a202c', margin:'0 0 20px', display:'flex', alignItems:'center', gap:8 }}>
                🏆 Bộ sưu tập Huy hiệu
                <span style={{ background:'#f0f9ff', color:'#0369a1', fontSize:11, fontWeight:600, padding:'2px 8px', borderRadius:12 }}>
                  {badges.length} huy hiệu
                </span>
              </h3>
              {badges.length === 0 ? (
                <p style={{ textAlign:'center', color:'#aaa', fontSize:13, padding:'20px 0' }}>
                  Chưa có huy hiệu nào. Hãy tham gia thi để nhận huy hiệu!
                </p>
              ) : (
                <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16 }}>
                  {badges.map((b, i) => (
                    <div key={i} style={{ textAlign:'center' }} title={b.name}>
                      <div style={{
                        width:60, height:60, borderRadius:'50%',
                        background:`radial-gradient(circle at 35% 35%, ${b.color}dd, ${b.color})`,
                        display:'flex', alignItems:'center', justifyContent:'center',
                        fontSize:26, margin:'0 auto 8px',
                        boxShadow:`0 4px 14px ${b.color}44`,
                        cursor:'pointer', transition:'transform 0.2s',
                      }}
                        onMouseEnter={e => e.currentTarget.style.transform='scale(1.12)'}
                        onMouseLeave={e => e.currentTarget.style.transform='none'}
                      >{b.icon}</div>
                      <p style={{ fontSize:11, color:'#555', margin:0, lineHeight:1.3, fontWeight:500 }}>{b.name}</p>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Lịch sử thi */}
            <Card>
              <h3 style={{ fontSize:15, fontWeight:700, color:'#1a202c', margin:'0 0 20px' }}>
                🕐 Lịch sử thi đấu gần đây
              </h3>
              {history.length === 0 ? (
                <p style={{ textAlign:'center', color:'#aaa', fontSize:13, padding:'20px 0' }}>
                  Chưa có lịch sử thi nào
                </p>
              ) : history.map((h, i) => (
                <div key={i} style={{
                  display:'flex', alignItems:'center', gap:16,
                  padding:'14px 0',
                  borderBottom: i < history.length-1 ? '1px solid #f0f4f8' : 'none',
                }}>
                  <div style={{ width:44, height:44, borderRadius:10, flexShrink:0, background:`${h.color}18`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>
                    {h.icon}
                  </div>
                  <div style={{ flex:1 }}>
                    <p style={{ fontWeight:600, fontSize:14, color:'#1a202c', margin:'0 0 3px' }}>{h.name}</p>
                    <p style={{ color:'#a0aec0', fontSize:12, margin:0 }}>{h.date}</p>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <span style={{ background:`${h.color}20`, color:h.color, fontSize:12, fontWeight:700, padding:'4px 12px', borderRadius:20, display:'block', marginBottom:4 }}>{h.result}</span>
                    <span style={{ color:'#888', fontSize:12 }}>{h.score}</span>
                  </div>
                </div>
              ))}
              <button onClick={() => navigate('/contests')}
                style={{ background:'none', border:'none', cursor:'pointer', color:'#1a3a8f', fontSize:13, fontWeight:600, padding:'12px 0 0', fontFamily:'inherit' }}>
                Xem toàn bộ lịch sử →
              </button>
            </Card>
          </div>
        </div>
      </PageContainer>

      <ChangePasswordModal
        open={changePwOpen}
        onClose={() => setChangePwOpen(false)}
        onSuccess={(msg) => setToast({ msg, type: 'success' })}
      />
    </div>
  );
}