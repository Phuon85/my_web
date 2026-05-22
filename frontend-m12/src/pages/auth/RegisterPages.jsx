import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/layout/AuthLayout';
import { authAPI } from '../../api/axios';

// ── Shared input style ────────────────────────────────────────────────────
const inp = {
  width:'100%', boxSizing:'border-box', padding:'12px 16px',
  border:'1.5px solid #e0e0e0', borderRadius:8,
  fontSize:14, outline:'none', color:'#222',
  background:'#fafafa', marginBottom:12, fontFamily:'inherit',
};
const ErrMsg = ({ msg }) => msg ? <p style={{ color:'#e53e3e', fontSize:12, margin:'-8px 0 10px' }}>{msg}</p> : null;

// ════════════════════════════════════════════════════════════════
//  1. Register Selection
// ════════════════════════════════════════════════════════════════
export function RegisterSelectionPage() {
  const navigate = useNavigate();
  const btn = (label, sub, g1, g2, shadow, path) => (
    <button onClick={() => navigate(path)}
      style={{
        width:'100%', display:'flex', alignItems:'center', gap:14,
        padding:'16px 22px', background:`linear-gradient(90deg,${g1},${g2})`,
        border:'none', borderRadius:10, cursor:'pointer',
        color:'#fff', fontSize:15, fontWeight:700, marginBottom:16,
        boxShadow:`0 4px 16px ${shadow}`, fontFamily:'inherit',
      }}>
      <span style={{ width:36, height:36, background:'rgba(255,255,255,0.25)', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>🎓</span>
      <span style={{ flex:1, textAlign:'left', lineHeight:1.35 }}>
        {label}<br /><span style={{ fontWeight:500, opacity:0.9 }}>{sub}</span>
      </span>
      <span style={{ fontSize:20 }}>→</span>
    </button>
  );
  return (
    <AuthLayout>
      <div style={{ maxWidth:380, width:'100%', margin:'0 auto' }}>
        <h2 style={{ fontSize:26, fontWeight:800, color:'#111', margin:'0 0 8px' }}>Đăng ký tài khoản</h2>
        <p style={{ color:'#888', fontSize:14, margin:'0 0 36px' }}>Chọn loại tài khoản phù hợp với bạn</p>
        {btn('Đăng ký tài khoản dành','cho sinh viên trường','#f59e0b','#f97316','rgba(245,158,11,0.35)','/register/internal')}
        {btn('Đăng ký tài khoản dành','cho sinh viên ngoài trường','#10b981','#059669','rgba(16,185,129,0.35)','/register/external')}
        <p style={{ textAlign:'center', fontSize:14, color:'#888' }}>
          Đã có tài khoản?{' '}
          <span onClick={() => navigate('/login')} style={{ color:'#1a3a8f', fontWeight:600, cursor:'pointer', textDecoration:'underline' }}>
            Đăng nhập tại đây
          </span>
        </p>
      </div>
    </AuthLayout>
  );
}

// ════════════════════════════════════════════════════════════════
//  2. Register Internal (SV trong trường)
// ════════════════════════════════════════════════════════════════
const KHOAS = ['Khoa Khoa học Cơ bản','Khoa Công nghệ Thông tin','Khoa Điện - Điện tử','Khoa Cơ khí','Khoa Xây dựng','Khoa Mỏ','Khoa Địa chất','Khoa Kinh tế','Khoa Môi trường'];

export function RegisterInternalPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName:'', email:'', lop:'', khoa:'', password:'', confirm:'', agreed:false });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors]   = useState({});
  const [success, setSuccess] = useState('');

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = 'Vui lòng nhập họ và tên';
    if (!form.email.endsWith('@student.humg.edu.vn')) e.email = 'Email phải có đuôi @student.humg.edu.vn';
    if (!form.lop.trim()) e.lop = 'Vui lòng nhập lớp';
    if (!form.khoa) e.khoa = 'Vui lòng chọn khoa';
    if (form.password.length < 8) e.password = 'Mật khẩu ít nhất 8 ký tự';
    if (form.password !== form.confirm) e.confirm = 'Mật khẩu không khớp';
    if (!form.agreed) e.agreed = 'Vui lòng đồng ý với quy chế';
    return e;
  };

  const submit = async () => {
    const e = validate(); setErrors(e);
    if (Object.keys(e).length) return;
    setLoading(true);
    try {
      await authAPI.registerInternal({ fullName:form.fullName, email:form.email, lop:form.lop, khoa:form.khoa, password:form.password });
      setSuccess('Đăng ký thành công! Đang chuyển đến trang đăng nhập...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setErrors({ api: err.response?.data?.message || err.response?.data?.errors?.[0] || 'Đăng ký thất bại' });
    } finally { setLoading(false); }
  };

  return (
    <AuthLayout>
      <div style={{ maxWidth:400, width:'100%', margin:'0 auto' }}>
        <h2 style={{ fontSize:26, fontWeight:800, color:'#111', margin:'0 0 6px' }}>Tạo tài khoản</h2>
        <p style={{ color:'#888', fontSize:13, margin:'0 0 20px' }}>Dành cho sinh viên trường HUMG</p>

        {success && <div style={{ background:'#f0fdf4', border:'1px solid #86efac', borderRadius:8, padding:'10px 14px', marginBottom:16, color:'#166534', fontSize:14 }}>{success}</div>}
        {errors.api && <div style={{ background:'#fef2f2', border:'1px solid #fca5a5', borderRadius:8, padding:'10px 14px', marginBottom:16, color:'#991b1b', fontSize:14 }}>{errors.api}</div>}

        <input style={inp} placeholder="Họ và tên *" value={form.fullName} onChange={set('fullName')}
          onFocus={e => e.target.style.borderColor='#1a3a8f'} onBlur={e => e.target.style.borderColor='#e0e0e0'} />
        <ErrMsg msg={errors.fullName} />

        <input style={inp} placeholder="Email (mssv@student.humg.edu.vn) *" value={form.email} onChange={set('email')}
          onFocus={e => e.target.style.borderColor='#1a3a8f'} onBlur={e => e.target.style.borderColor='#e0e0e0'} />
        <ErrMsg msg={errors.email} />

        <input style={inp} placeholder="Lớp *" value={form.lop} onChange={set('lop')}
          onFocus={e => e.target.style.borderColor='#1a3a8f'} onBlur={e => e.target.style.borderColor='#e0e0e0'} />
        <ErrMsg msg={errors.lop} />

        <select value={form.khoa} onChange={e => setForm(f => ({ ...f, khoa: e.target.value }))}
          style={{ ...inp, color: form.khoa ? '#222' : '#999', cursor:'pointer' }}>
          <option value="">Chọn khoa *</option>
          {KHOAS.map(k => <option key={k} value={k}>{k}</option>)}
        </select>
        <ErrMsg msg={errors.khoa} />

        <div style={{ position:'relative', marginBottom:12 }}>
          <input type={showPw ? 'text' : 'password'} placeholder="Mật khẩu (tối thiểu 8 ký tự) *"
            value={form.password} onChange={set('password')}
            style={{ ...inp, marginBottom:0, paddingRight:44 }}
            onFocus={e => e.target.style.borderColor='#1a3a8f'} onBlur={e => e.target.style.borderColor='#e0e0e0'} />
          <span onClick={() => setShowPw(p => !p)} style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', cursor:'pointer', color:'#aaa', fontSize:16 }}>{showPw ? '🙈' : '👁'}</span>
        </div>
        <ErrMsg msg={errors.password} />

        <input type="password" placeholder="Xác nhận mật khẩu *" value={form.confirm} onChange={set('confirm')}
          style={inp} onFocus={e => e.target.style.borderColor='#1a3a8f'} onBlur={e => e.target.style.borderColor='#e0e0e0'} />
        <ErrMsg msg={errors.confirm} />

        <label style={{ display:'flex', alignItems:'flex-start', gap:10, marginBottom:20, cursor:'pointer' }}>
          <input type="checkbox" checked={form.agreed} onChange={e => setForm(f => ({ ...f, agreed: e.target.checked }))} style={{ marginTop:3, accentColor:'#1a3a8f' }} />
          <span style={{ fontSize:13, color:'#555', lineHeight:1.5 }}>
            Tôi đồng ý với <span style={{ color:'#f59e0b', textDecoration:'underline' }}>Quy chế và Thể lệ</span> cuộc thi.
          </span>
        </label>
        <ErrMsg msg={errors.agreed} />

        <button onClick={submit} disabled={loading}
          style={{ width:'100%', padding:14, background: loading ? '#ccc' : 'linear-gradient(90deg,#f59e0b,#f97316)', border:'none', borderRadius:8, cursor: loading ? 'not-allowed' : 'pointer', color:'#fff', fontSize:15, fontWeight:800, marginBottom:14, fontFamily:'inherit' }}>
          {loading ? 'ĐANG XỬ LÝ...' : 'ĐĂNG KÝ NGAY'}
        </button>

        <p style={{ textAlign:'center', fontSize:13, color:'#888' }}>
          Đã có tài khoản?{' '}
          <span onClick={() => navigate('/login')} style={{ color:'#1a3a8f', fontWeight:600, cursor:'pointer', textDecoration:'underline' }}>Đăng nhập tại đây</span>
        </p>
      </div>
    </AuthLayout>
  );
}

// ════════════════════════════════════════════════════════════════
//  3. Register External (SV ngoài trường)
// ════════════════════════════════════════════════════════════════
const UNIS = ['Đại học Bách khoa Hà Nội','Đại học Quốc gia Hà Nội','Đại học Kinh tế Quốc dân','Đại học Xây dựng','Đại học Thủy lợi','Đại học Giao thông Vận tải','Học viện KTQS','Khác'];

export function RegisterExternalPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ truong:'', fullName:'', email:'', password:'', confirm:'', agreed:false });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors]   = useState({});
  const [success, setSuccess] = useState('');

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.truong) e.truong = 'Vui lòng chọn trường';
    if (!form.fullName.trim()) e.fullName = 'Vui lòng nhập họ và tên';
    if (!form.email.includes('@')) e.email = 'Email không hợp lệ';
    if (form.password.length < 8) e.password = 'Mật khẩu ít nhất 8 ký tự';
    if (form.password !== form.confirm) e.confirm = 'Mật khẩu không khớp';
    if (!form.agreed) e.agreed = 'Vui lòng đồng ý với quy chế';
    return e;
  };

  const submit = async () => {
    const e = validate(); setErrors(e);
    if (Object.keys(e).length) return;
    setLoading(true);
    try {
      await authAPI.registerExternal({ truong:form.truong, fullName:form.fullName, email:form.email, password:form.password });
      setSuccess('Đăng ký thành công! Đang chuyển đến trang đăng nhập...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setErrors({ api: err.response?.data?.message || 'Đăng ký thất bại' });
    } finally { setLoading(false); }
  };

  return (
    <AuthLayout>
      <div style={{ maxWidth:400, width:'100%', margin:'0 auto' }}>
        <h2 style={{ fontSize:26, fontWeight:800, color:'#111', margin:'0 0 6px' }}>Tạo tài khoản</h2>
        <p style={{ color:'#888', fontSize:13, margin:'0 0 20px' }}>Dành cho sinh viên ngoài trường HUMG</p>

        {success && <div style={{ background:'#f0fdf4', border:'1px solid #86efac', borderRadius:8, padding:'10px 14px', marginBottom:16, color:'#166534', fontSize:14 }}>{success}</div>}
        {errors.api && <div style={{ background:'#fef2f2', border:'1px solid #fca5a5', borderRadius:8, padding:'10px 14px', marginBottom:16, color:'#991b1b', fontSize:14 }}>{errors.api}</div>}

        <select value={form.truong} onChange={e => setForm(f => ({ ...f, truong: e.target.value }))}
          style={{ ...inp, color: form.truong ? '#222' : '#999', cursor:'pointer' }}>
          <option value="">Chọn trường *</option>
          {UNIS.map(u => <option key={u} value={u}>{u}</option>)}
        </select>
        <ErrMsg msg={errors.truong} />

        <input style={inp} placeholder="Họ và tên *" value={form.fullName} onChange={set('fullName')}
          onFocus={e => e.target.style.borderColor='#1a3a8f'} onBlur={e => e.target.style.borderColor='#e0e0e0'} />
        <ErrMsg msg={errors.fullName} />

        <input style={inp} placeholder="Địa chỉ Email *" value={form.email} onChange={set('email')}
          onFocus={e => e.target.style.borderColor='#1a3a8f'} onBlur={e => e.target.style.borderColor='#e0e0e0'} />
        <ErrMsg msg={errors.email} />

        <div style={{ position:'relative', marginBottom:12 }}>
          <input type={showPw ? 'text' : 'password'} placeholder="Mật khẩu (tối thiểu 8 ký tự) *"
            value={form.password} onChange={set('password')}
            style={{ ...inp, marginBottom:0, paddingRight:44 }}
            onFocus={e => e.target.style.borderColor='#1a3a8f'} onBlur={e => e.target.style.borderColor='#e0e0e0'} />
          <span onClick={() => setShowPw(p => !p)} style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', cursor:'pointer', color:'#aaa', fontSize:16 }}>{showPw ? '🙈' : '👁'}</span>
        </div>
        <ErrMsg msg={errors.password} />

        <input type="password" placeholder="Xác nhận mật khẩu *" value={form.confirm} onChange={set('confirm')}
          style={inp} onFocus={e => e.target.style.borderColor='#1a3a8f'} onBlur={e => e.target.style.borderColor='#e0e0e0'} />
        <ErrMsg msg={errors.confirm} />

        <label style={{ display:'flex', alignItems:'flex-start', gap:10, marginBottom:20, cursor:'pointer' }}>
          <input type="checkbox" checked={form.agreed} onChange={e => setForm(f => ({ ...f, agreed: e.target.checked }))} style={{ marginTop:3, accentColor:'#1a3a8f' }} />
          <span style={{ fontSize:13, color:'#555', lineHeight:1.5 }}>
            Tôi đồng ý với <span style={{ color:'#f59e0b', textDecoration:'underline' }}>Quy chế và Thể lệ</span> cuộc thi.
          </span>
        </label>
        <ErrMsg msg={errors.agreed} />

        <button onClick={submit} disabled={loading}
          style={{ width:'100%', padding:14, background: loading ? '#ccc' : 'linear-gradient(90deg,#f59e0b,#f97316)', border:'none', borderRadius:8, cursor: loading ? 'not-allowed' : 'pointer', color:'#fff', fontSize:15, fontWeight:800, marginBottom:14, fontFamily:'inherit' }}>
          {loading ? 'ĐANG XỬ LÝ...' : 'ĐĂNG KÝ NGAY'}
        </button>

        <p style={{ textAlign:'center', fontSize:13, color:'#888' }}>
          Đã có tài khoản?{' '}
          <span onClick={() => navigate('/login')} style={{ color:'#1a3a8f', fontWeight:600, cursor:'pointer', textDecoration:'underline' }}>Đăng nhập tại đây</span>
        </p>
      </div>
    </AuthLayout>
  );
}
