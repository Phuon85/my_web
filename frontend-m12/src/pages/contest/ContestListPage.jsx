import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import { Spinner, Empty, PageContainer } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { contestAPI } from '../../api/axios';

const STATUS_MAP = {
  LIVE:      { label:'🔴 LIVE NOW',   color:'#e53e3e', btnLabel:'Vào thi ngay',  btnColor:'#e53e3e' },
  PUBLISHED: { label:'Mở đăng ký',   color:'#10b981', btnLabel:'Đăng ký',       btnColor:'#10b981' },
  UPCOMING:  { label:'Sắp diễn ra',  color:'#3b82f6', btnLabel:'Chi tiết',      btnColor:'#6b7280' },
  ENDED:     { label:'Đã kết thúc',  color:'#9ca3af', btnLabel:'Xem kết quả',   btnColor:'#6b7280' },
  DRAFT:     { label:'Chưa mở',      color:'#9ca3af', btnLabel:'Chưa mở',       btnColor:'#9ca3af' },
};
const FILTERS  = ['Tất cả','Sắp diễn ra','Đang diễn ra','Lịch sử'];
const SUBJECTS = ['Tất cả môn','Toán học','Vật lý','Hóa học','Ngoại ngữ','CNTT'];

function formatDuration(mins) {
  if (!mins) return '—';
  if (mins < 60)   return `${mins} phút`;
  if (mins >= 1440) return `${Math.round(mins/60)} giờ`;
  return `${mins} phút`;
}

function formatDate(dt) {
  if (!dt) return '—';
  return new Date(dt).toLocaleDateString('vi-VN', { day:'2-digit', month:'2-digit', year:'numeric' });
}

export default function ContestListPage() {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const [contests,  setContests]  = useState([]);
  const [featured,  setFeatured]  = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [filter,    setFilter]    = useState('Tất cả');
  const [subject,   setSubject]   = useState('Tất cả môn');
  const [registering, setRegistering] = useState(null); // id đang đăng ký
  const [toast, setToast] = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  // ── Fetch contests từ API thật ──────────────────────────────────────────
  useEffect(() => {
    setLoading(true);
    const params = {
      subject:  subject !== 'Tất cả môn' ? subject : undefined,
      status:   filter === 'Đang diễn ra' ? 'LIVE'
              : filter === 'Sắp diễn ra'  ? 'PUBLISHED'
              : filter === 'Lịch sử'       ? 'ENDED'
              : undefined,
    };
    contestAPI.getAll(params)
      .then(r => {
        const list = Array.isArray(r.data) ? r.data : (r.data?.content || []);
        setContests(list);
        // Featured = cuộc thi PUBLISHED có nhiều người đăng ký nhất
        const feat = list.find(c => c.isPublished && c.status !== 'ENDED' && c.status !== 'DRAFT');
        setFeatured(feat || list[0] || null);
      })
      .catch(() => setContests([]))
      .finally(() => setLoading(false));
  }, [filter, subject]);

  // ── Đăng ký thi ─────────────────────────────────────────────────────────
  const handleRegister = async (e, contestId) => {
    e.stopPropagation();
    setRegistering(contestId);
    try {
      await contestAPI.register(contestId);
      showToast('Đăng ký tham dự thành công!');
      // Reload lại danh sách
      setContests(prev => prev.map(c =>
        c.id === contestId
          ? { ...c, registrantCount: (c.registrantCount || 0) + 1, registered: true }
          : c
      ));
    } catch (e) {
      showToast(e.response?.data?.message || 'Đăng ký thất bại!');
    } finally { setRegistering(null); }
  };

  return (
    <div style={{ minHeight:'100vh', background:'#f5f6fa', fontFamily:"'Be Vietnam Pro',sans-serif" }}>
      <Navbar />

      {toast && (
        <div style={{ position:'fixed', top:80, right:24, background:'#1a202c', color:'#fff', padding:'12px 20px', borderRadius:10, fontSize:14, fontWeight:500, zIndex:3000, boxShadow:'0 8px 24px rgba(0,0,0,0.2)' }}>
          ✅ {toast}
        </div>
      )}

      <PageContainer maxWidth={1100}>
        {/* Featured Banner — dữ liệu thật */}
        {featured && (
          <div style={{
            background:'linear-gradient(135deg,#0f2a6e 0%,#1a4298 50%,#1a7a4a 100%)',
            borderRadius:16, padding:'40px 48px', marginBottom:32,
            display:'flex', justifyContent:'space-between', alignItems:'center',
            boxShadow:'0 8px 32px rgba(0,0,0,0.2)', position:'relative', overflow:'hidden',
          }}>
            <div style={{ position:'absolute', top:-40, right:200, width:200, height:200, borderRadius:'50%', background:'rgba(255,255,255,0.04)' }} />
            <div style={{ zIndex:1 }}>
              <div style={{ display:'flex', gap:10, marginBottom:14 }}>
                <span style={{ background:'#f59e0b', color:'#fff', fontSize:11, fontWeight:800, padding:'3px 10px', borderRadius:20 }}>FEATURED</span>
                {featured.status === 'PUBLISHED' && (
                  <span style={{ background:'#10b981', color:'#fff', fontSize:11, fontWeight:800, padding:'3px 10px', borderRadius:20 }}>Đang mở đăng ký</span>
                )}
              </div>
              <h1 style={{ color:'#fff', fontSize:26, fontWeight:900, margin:'0 0 10px' }}>{featured.title}</h1>
              <p style={{ color:'rgba(255,255,255,0.78)', fontSize:14, margin:'0 0 20px', maxWidth:500 }}>
                {featured.description || 'Cuộc thi học thuật uy tín dành cho sinh viên HUMG.'}
              </p>
              <div style={{ display:'flex', gap:20, marginBottom:24 }}>
                {[
                  ['📅', formatDate(featured.startTime)],
                  ['⏱️', formatDuration(featured.durationMinutes)],
                  ['👥', `${featured.registrantCount || 0} đã đăng ký`],
                ].map(([icon,text]) => (
                  <span key={text} style={{ color:'rgba(255,255,255,0.8)', fontSize:13, display:'flex', alignItems:'center', gap:6 }}>
                    {icon} {text}
                  </span>
                ))}
              </div>
              <button onClick={(e) => handleRegister(e, featured.id)}
                disabled={!!registering}
                style={{ background:'#f59e0b', color:'#fff', border:'none', padding:'13px 28px', borderRadius:10, fontSize:15, fontWeight:800, cursor:'pointer', fontFamily:'inherit', boxShadow:'0 4px 16px rgba(245,158,11,0.4)' }}>
                Đăng ký tham gia
              </button>
            </div>
            <div style={{ fontSize:100, opacity:0.2, zIndex:0 }}>🏆</div>
          </div>
        )}

        {/* Filters */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24, flexWrap:'wrap', gap:12 }}>
          <div style={{ display:'flex', gap:8 }}>
            {FILTERS.map(f => (
              <button key={f} onClick={() => setFilter(f)}
                style={{ padding:'8px 18px', borderRadius:24, cursor:'pointer', fontFamily:'inherit', border: filter===f?'none':'1.5px solid #e0e0e0', background: filter===f?'#1a3a8f':'#fff', color: filter===f?'#fff':'#555', fontSize:13, fontWeight: filter===f?700:400 }}>
                {f}
              </button>
            ))}
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <span style={{ fontSize:13, color:'#888' }}>Môn thi:</span>
            <select value={subject} onChange={e => setSubject(e.target.value)}
              style={{ padding:'8px 14px', borderRadius:8, border:'1.5px solid #e0e0e0', fontSize:13, fontFamily:'inherit', outline:'none', cursor:'pointer', background:'#fff' }}>
              {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Grid */}
        {loading ? <Spinner /> : contests.length === 0 ? (
          <Empty icon="🏆" message="Không có cuộc thi nào phù hợp" />
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:20 }}>
            {contests.map(c => {
              const sm = STATUS_MAP[c.status] || STATUS_MAP.DRAFT;
              const isDisabled = c.status === 'DRAFT' || c.registered;
              return (
                <div key={c.id}
                  onClick={() => navigate(`/contests/${c.id}`)}
                  style={{ background:'#fff', borderRadius:14, padding:'20px', border: c.status==='LIVE'?'2px solid #e53e3e':'1.5px solid #e8ecf0', cursor:'pointer', position:'relative', overflow:'hidden', boxShadow:'0 1px 4px rgba(0,0,0,0.06)', transition:'box-shadow 0.15s,transform 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow='0 8px 24px rgba(0,0,0,0.12)'; e.currentTarget.style.transform='translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow='0 1px 4px rgba(0,0,0,0.06)'; e.currentTarget.style.transform='none'; }}>

                  {c.status==='LIVE' && <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:'#e53e3e' }} />}

                  <div style={{ marginBottom:12 }}>
                    <span style={{ background:`${sm.color}18`, color:sm.color, fontSize:11, fontWeight:700, padding:'4px 10px', borderRadius:16, display:'inline-flex', alignItems:'center', gap:4 }}>
                      {c.status==='LIVE' && <span style={{ width:6, height:6, borderRadius:'50%', background:'#e53e3e', display:'inline-block' }} />}
                      {sm.label}
                    </span>
                  </div>

                  <h3 style={{ fontSize:15, fontWeight:700, color:'#1a202c', margin:'0 0 8px', lineHeight:1.3 }}>{c.title}</h3>
                  <p style={{ color:'#718096', fontSize:13, margin:'0 0 16px', lineHeight:1.5, overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>
                    {c.description || `Cuộc thi môn ${c.subject}`}
                  </p>

                  <div style={{ display:'flex', flexDirection:'column', gap:5, marginBottom:16 }}>
                    {[
                      ['📅', formatDate(c.startTime)],
                      ['⏱️', formatDuration(c.durationMinutes)],
                      ['👥', `${c.registrantCount || 0} đăng thi`],
                    ].map(([icon,text]) => (
                      <span key={text} style={{ fontSize:12, color:'#888', display:'flex', alignItems:'center', gap:6 }}>
                        {icon} {text}
                      </span>
                    ))}
                  </div>

                  <button
                    disabled={isDisabled || registering === c.id}
                    onClick={e => {
                      e.stopPropagation();
                      if (c.status === 'ENDED') navigate(`/contests/${c.id}`);
                      else handleRegister(e, c.id);
                    }}
                    style={{ width:'100%', padding:'10px', borderRadius:8, background: isDisabled?'#f0f0f0':sm.btnColor, color: isDisabled?'#999':'#fff', border:'none', fontSize:13, fontWeight:700, cursor: isDisabled?'not-allowed':'pointer', fontFamily:'inherit' }}>
                    {registering===c.id ? '⏳ Đang đăng ký...' : c.registered ? '✅ Đã đăng ký' : sm.btnLabel}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>

        <div style={{ borderTop:'1px solid #e8ecf0', marginTop:48, padding:'20px 0', display:'flex', justifyContent:'space-between' }}>
          <span style={{ fontSize:13, color:'#888' }}>🏆 HUMG Olympic Platform</span>
          <span style={{ fontSize:12, color:'#aaa' }}>© 2025 Đại học Mỏ – Địa chất Hà Nội</span>
        </div>
      </PageContainer>
    </div>
  );
}