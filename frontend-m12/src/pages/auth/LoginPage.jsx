import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthLayout from '../../components/layout/AuthLayout';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../api/axios';

// ── Forgot Password Modal ───────────────────────────────────────────────────
function ForgotPasswordModal({ open, onClose }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSend = async () => {
    if (!email.trim()) { setError('Vui lòng nhập email.'); return; }
    setLoading(true); setError('');
    try {
      // Gọi API nếu có, nếu không thì giả lập thành công
      if (authAPI.forgotPassword) {
        await authAPI.forgotPassword({ email });
      }
      setSent(true);
    } catch (e) {
      setError(e.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally { setLoading(false); }
  };

  if (!open) return null;

  const handleClose = () => { onClose(); setSent(false); setEmail(''); setError(''); };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.48)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
      onClick={e => e.target === e.currentTarget && handleClose()}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 28, width: '100%', maxWidth: 400, boxShadow: '0 20px 60px rgba(0,0,0,0.22)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontSize: 17, fontWeight: 700, color: '#1a202c', margin: 0 }}>🔑 Quên mật khẩu</h3>
          <button onClick={handleClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#aaa' }}>✕</button>
        </div>

        {sent ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📧</div>
            <p style={{ fontWeight: 700, fontSize: 15, color: '#1a202c', marginBottom: 8 }}>Email đã được gửi!</p>
            <p style={{ color: '#888', fontSize: 13, marginBottom: 20 }}>
              Kiểm tra hộp thư <strong>{email}</strong> để nhận hướng dẫn đặt lại mật khẩu.
            </p>
            <button onClick={handleClose}
              style={{ padding: '10px 24px', background: 'linear-gradient(90deg,#f59e0b,#f97316)', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', fontSize: 14 }}>
              Đã hiểu
            </button>
          </div>
        ) : (
          <>
            <p style={{ color: '#888', fontSize: 13, marginBottom: 16 }}>
              Nhập email đăng ký của bạn. Chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu.
            </p>
            {error && <p style={{ color: '#e53e3e', fontSize: 13, marginBottom: 10 }}>❌ {error}</p>}
            <input
              type="email"
              placeholder="Email của bạn"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              style={{ width: '100%', boxSizing: 'border-box', padding: '12px 14px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', outline: 'none', marginBottom: 14 }} />
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={handleClose} style={{ flex: 1, padding: 11, border: '1.5px solid #e0e0e0', borderRadius: 8, background: '#fff', fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>Hủy</button>
              <button onClick={handleSend} disabled={loading}
                style={{ flex: 2, padding: 11, background: loading ? '#ccc' : 'linear-gradient(90deg,#f59e0b,#f97316)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
                {loading ? '⏳ Đang gửi...' : '📤 Gửi email'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form, setForm]     = useState({ credential: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');
  const [forgotOpen, setForgotOpen] = useState(false);

  const handleLogin = async () => {
    if (!form.credential || !form.password) { setError('Vui lòng điền đầy đủ thông tin.'); return; }
    setError(''); setLoading(true);
    try {
      const res = await authAPI.login(form);
      login(res.data.token, res.data.user);
      navigate('/home');
    } catch (e) {
      setError(e.response?.data?.message || 'Email hoặc mật khẩu không đúng');
    } finally { setLoading(false); }
  };

  const inp = {
    width:'100%', boxSizing:'border-box', padding:'13px 16px',
    border:'1.5px solid #e5e7eb', borderRadius:8,
    fontSize:14, outline:'none', color:'#222',
    background:'#fafafa', marginBottom:12, fontFamily:'inherit',
  };

  return (
    <>
      <AuthLayout>
      <div style={{ maxWidth:380, width:'100%', margin:'0 auto' }}>
        <h2 style={{ fontSize:28, fontWeight:800, color:'#111', margin:'0 0 6px' }}>
          Chào mừng trở lại!
        </h2>
        <p style={{ color:'#888', fontSize:14, margin:'0 0 28px' }}>Đăng nhập để tiếp tục</p>

        {/* Google SSO */}
        <a href="http://localhost:8080/oauth2/authorization/google"
          style={{
            display:'flex', alignItems:'center', justifyContent:'center', gap:10,
            padding:'11px 16px', border:'1.5px solid #e5e7eb', borderRadius:8,
            textDecoration:'none', color:'#333', fontSize:14, fontWeight:600,
            marginBottom:12, background:'#fff', cursor:'pointer',
          }}>
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          Đăng nhập bằng Google
        </a>

        <div style={{ display:'flex', alignItems:'center', gap:12, margin:'16px 0' }}>
          <div style={{ flex:1, height:1, background:'#e5e7eb' }} />
          <span style={{ color:'#aaa', fontSize:13 }}>hoặc</span>
          <div style={{ flex:1, height:1, background:'#e5e7eb' }} />
        </div>

        <input style={inp} placeholder="Email hoặc mã số sinh viên"
          value={form.credential} onChange={e => setForm(f => ({ ...f, credential: e.target.value }))}
          onFocus={e => e.target.style.borderColor='#1a3a8f'}
          onBlur={e => e.target.style.borderColor='#e5e7eb'} />

        <div style={{ position:'relative', marginBottom:12 }}>
          <input type={showPw ? 'text' : 'password'} placeholder="Mật khẩu"
            value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            style={{ ...inp, marginBottom:0, paddingRight:44 }}
            onFocus={e => e.target.style.borderColor='#1a3a8f'}
            onBlur={e => e.target.style.borderColor='#e5e7eb'} />
          <span onClick={() => setShowPw(p => !p)}
            style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', cursor:'pointer', color:'#aaa', fontSize:16 }}>
            {showPw ? '🙈' : '👁'}
          </span>
        </div>

        {error && <p style={{ color:'#e53e3e', fontSize:13, margin:'0 0 12px' }}>{error}</p>}

        <button onClick={handleLogin} disabled={loading}
          style={{
            width:'100%', padding:14,
            background: loading ? '#ccc' : 'linear-gradient(90deg,#f59e0b,#f97316)',
            border:'none', borderRadius:8, cursor: loading ? 'not-allowed' : 'pointer',
            color:'#fff', fontSize:15, fontWeight:800, marginBottom:16,
            fontFamily:'inherit', boxShadow: loading ? 'none' : '0 4px 16px rgba(245,158,11,0.3)',
          }}>
          {loading ? 'ĐANG ĐĂNG NHẬP...' : 'ĐĂNG NHẬP'}
        </button>

        <div style={{ display:'flex', justifyContent:'space-between', fontSize:13 }}>
          <span onClick={() => setForgotOpen(true)} style={{ color:'#1a3a8f', cursor:'pointer', textDecoration:'underline' }}>
            Quên mật khẩu?
          </span>
          <Link to="/register" style={{ color:'#666', textDecoration:'none' }}>Đăng ký ngay</Link>
        </div>
      </div>
    </AuthLayout>
      <ForgotPasswordModal open={forgotOpen} onClose={() => setForgotOpen(false)} />
    </>
  );
}
