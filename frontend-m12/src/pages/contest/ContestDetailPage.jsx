import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import { Card, Spinner, PageContainer, Btn, Toast } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { contestAPI } from '../../api/axios';

const TABS = ['Giới thiệu', 'Thể lệ & Cấu trúc', 'Giải thưởng', 'Danh sách thí sinh'];

function formatDate(dt) {
  if (!dt) return '—';
  return new Date(dt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function CountdownBox({ targetDate }) {
  const [left, setLeft] = useState('');
  useEffect(() => {
    if (!targetDate) return;
    const tick = () => {
      const diff = new Date(targetDate) - Date.now();
      if (diff <= 0) { setLeft('Đã bắt đầu'); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setLeft(`${d} ngày ${h} giờ ${m} phút`);
    };
    tick();
    const t = setInterval(tick, 60000);
    return () => clearInterval(t);
  }, [targetDate]);
  return <span>{left}</span>;
}

const TAG_COLORS = [['#e0f2fe','#0369a1'],['#fef3c7','#92400e'],['#f0fdf4','#166534'],['#ede9fe','#5b21b6'],['#fce7f3','#9d174d']];

export default function ContestDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [contest, setContest]         = useState(null);
  const [participants, setParticipants] = useState([]);
  const [fetching, setFetching]       = useState(true);
  const [tab, setTab]                 = useState(0);
  const [registered, setRegistered]   = useState(false);
  const [registering, setRegistering] = useState(false);
  const [toast, setToast]             = useState({ msg: '', type: 'success' });

  const notify = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast({ msg: '', type: 'success' }), 3000); };

  useEffect(() => {
    setFetching(true);
    Promise.all([
      contestAPI.getById(id),
      contestAPI.getParticipants(id),
    ]).then(([cr, pr]) => {
      setContest(cr.data);
      const parts = pr.data || [];
      setParticipants(parts);
      if (user) setRegistered(parts.some(p => p.userId === user.id));
    }).catch(() => {}).finally(() => setFetching(false));
  }, [id]);

  const handleRegister = async () => {
    setRegistering(true);
    try {
      await contestAPI.register(id);
      setRegistered(true);
      notify('Đăng ký tham dự thành công!');
      const pr = await contestAPI.getParticipants(id);
      setParticipants(pr.data || []);
    } catch (e) {
      notify(e?.response?.data?.message || 'Đăng ký thất bại!', 'error');
    } finally { setRegistering(false); }
  };

  if (fetching) return (
    <div style={{ minHeight: '100vh', background: '#f5f6fa' }}>
      <Navbar /><Spinner />
    </div>
  );
  if (!contest) return (
    <div style={{ minHeight: '100vh', background: '#f5f6fa' }}>
      <Navbar />
      <PageContainer><div style={{ textAlign: 'center', padding: 60, color: '#aaa' }}><div style={{ fontSize: 48 }}>😕</div><p>Không tìm thấy kỳ thi này.</p></div></PageContainer>
    </div>
  );

  const c = contest;
  const prizes = [
    c.prizeFirst  && { rank: '🥇 Giải Nhất', amount: c.prizeFirst,  color: '#f59e0b' },
    c.prizeSecond && { rank: '🥈 Giải Nhì',  amount: c.prizeSecond, color: '#9ca3af' },
    c.prizeThird  && { rank: '🥉 Giải Ba',   amount: c.prizeThird,  color: '#cd7c2f' },
  ].filter(Boolean);

  const canRegister = c.isPublished && c.status !== 'ENDED' && c.status !== 'DELETED';
  const isLive = c.status === 'LIVE';

  return (
    <div style={{ minHeight: '100vh', background: '#f5f6fa', fontFamily: "'Be Vietnam Pro',sans-serif" }}>
      <Navbar />

      {/* Toast */}
      {toast.msg && (
        <div style={{ position: 'fixed', top: 80, right: 24, zIndex: 3000, background: toast.type === 'success' ? '#f0fdf4' : '#fef2f2', border: `1px solid ${toast.type === 'success' ? '#86efac' : '#fca5a5'}`, color: toast.type === 'success' ? '#166534' : '#991b1b', borderRadius: 10, padding: '12px 18px', fontSize: 14, boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
          {toast.type === 'success' ? '✅' : '❌'} {toast.msg}
        </div>
      )}

      {/* Breadcrumb */}
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '16px 24px 0' }}>
        <span style={{ color: '#888', fontSize: 13, cursor: 'pointer' }} onClick={() => navigate('/contests')}>Cuộc thi</span>
        <span style={{ color: '#888', fontSize: 13 }}> › {c.title}</span>
      </div>

      {/* Hero */}
      <div style={{ maxWidth: 1000, margin: '12px auto 0', padding: '0 24px' }}>
        <div style={{ background: 'linear-gradient(135deg,#0f2a6e 0%,#1a7a4a 100%)', borderRadius: 16, padding: '40px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 24, flexWrap: 'wrap', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
          <div style={{ flex: 1, minWidth: 260 }}>
            {isLive && <span style={{ background: '#ef4444', color: '#fff', fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 20, display: 'inline-block', marginBottom: 10 }}>🔴 ĐANG DIỄN RA</span>}
            <h1 style={{ color: '#fff', fontSize: 28, fontWeight: 900, margin: '0 0 8px' }}>{c.title}</h1>
            {c.subject && <p style={{ color: '#f59e0b', fontSize: 15, fontWeight: 700, margin: '0 0 12px' }}>{c.subject}</p>}
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, margin: '0 0 20px', lineHeight: 1.6, maxWidth: 500 }}>
              {c.description || 'Kỳ thi học thuật uy tín dành cho sinh viên HUMG.'}
            </p>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
              {[
                ['📅', `Bắt đầu: ${formatDate(c.startTime)}`],
                ['⏱️', `${c.durationMinutes || '—'} phút`],
                ['👥', `${c.registrantCount || 0} đã đăng ký`],
              ].map(([icon, text]) => (
                <span key={text} style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>{icon} {text}</span>
              ))}
            </div>
            {prizes.length > 0 && (
              <span style={{ background: '#f59e0b', color: '#fff', fontSize: 13, fontWeight: 700, padding: '7px 16px', borderRadius: 20 }}>
                🏆 Giải Nhất: {prizes[0].amount}
              </span>
            )}
          </div>

          {/* Register box */}
          <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 14, padding: '24px 28px', backdropFilter: 'blur(10px)', textAlign: 'center', minWidth: 210 }}>
            {c.startTime && !isLive && (
              <>
                <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12, margin: '0 0 6px' }}>Còn lại:</p>
                <p style={{ color: '#f59e0b', fontWeight: 800, fontSize: 14, margin: '0 0 16px' }}><CountdownBox targetDate={c.startTime} /></p>
              </>
            )}
            <button onClick={handleRegister} disabled={!canRegister || registered || registering}
              style={{ width: '100%', padding: 12, background: registered ? '#10b981' : canRegister ? '#f59e0b' : 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 13, fontWeight: 800, cursor: (!canRegister || registered) ? 'default' : 'pointer', fontFamily: 'inherit' }}>
              {registering ? '⏳ Đang xử lý...' : registered ? '✅ ĐÃ ĐĂNG KÝ' : canRegister ? 'ĐĂNG KÝ THAM GIA' : 'CHƯA MỞ ĐĂNG KÝ'}
            </button>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, margin: '10px 0 0' }}>
              👥 {c.registrantCount || 0} sinh viên đã đăng ký
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 24px 48px' }}>
        <div style={{ display: 'flex', borderBottom: '1.5px solid #e8ecf0', marginTop: 24 }}>
          {TABS.map((t, i) => (
            <button key={i} onClick={() => setTab(i)}
              style={{ padding: '12px 20px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, fontFamily: 'inherit', fontWeight: tab===i?700:400, color: tab===i?'#1a3a8f':'#718096', borderBottom: tab===i?'2px solid #1a3a8f':'2px solid transparent', marginBottom: -2 }}>
              {t}
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 24, marginTop: 24 }}>
          <div>
            {tab === 0 && (
              <Card>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1a202c', margin: '0 0 14px' }}>Về kỳ thi</h3>
                <p style={{ color: '#555', fontSize: 14, lineHeight: 1.7, margin: '0 0 16px' }}>
                  {c.description || 'Kỳ thi học thuật uy tín nhất tại Trường Đại học Mỏ – Địa chất Hà Nội.'}
                </p>
                {c.creatorName && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#f8f9fa', borderRadius: 10, padding: '12px 16px' }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#e8ecf0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>👨‍🏫</div>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: 14, color: '#1a202c', margin: 0 }}>{c.creatorName}</p>
                      <p style={{ color: '#10b981', fontSize: 12, margin: '2px 0 0' }}>Người tạo kỳ thi</p>
                    </div>
                  </div>
                )}
              </Card>
            )}

            {tab === 1 && (
              <Card>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1a202c', margin: '0 0 16px' }}>📋 Thông tin thể lệ</h3>
                {[
                  ['Thời gian thi', c.durationMinutes ? `${c.durationMinutes} phút` : '—'],
                  ['Bắt đầu',       formatDate(c.startTime)],
                  ['Kết thúc',      formatDate(c.endTime)],
                  ['Môn thi',       c.subject || '—'],
                  ['Trạng thái',    c.status],
                ].map(([l, v], i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f0f4f8' }}>
                    <span style={{ color: '#888', fontSize: 14 }}>{l}</span>
                    <span style={{ fontWeight: 600, fontSize: 14, color: '#1a202c' }}>{v}</span>
                  </div>
                ))}
              </Card>
            )}

            {tab === 2 && (
              <Card>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1a202c', margin: '0 0 20px' }}>🏆 Giải thưởng</h3>
                {prizes.length === 0 ? (
                  <p style={{ color: '#aaa', fontSize: 14 }}>Chưa có thông tin giải thưởng.</p>
                ) : prizes.map((p, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: p.color + '0f', borderRadius: 10, marginBottom: 10, border: `1.5px solid ${p.color}30` }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: '#1a202c' }}>{p.rank}</span>
                    <span style={{ fontSize: 18, fontWeight: 900, color: p.color }}>{p.amount}</span>
                  </div>
                ))}
              </Card>
            )}

            {tab === 3 && (
              <Card>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1a202c', margin: '0 0 20px' }}>👥 Danh sách thí sinh ({participants.length})</h3>
                {participants.length === 0 ? (
                  <p style={{ color: '#aaa', fontSize: 14 }}>Chưa có thí sinh đăng ký.</p>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #e8ecf0' }}>
                        {['#', 'Họ và tên', 'MSSV', 'Khoa', 'Điểm'].map(h => (
                          <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 13, color: '#888', fontWeight: 600 }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {participants.map((p, i) => (
                        <tr key={p.id} style={{ borderBottom: '1px solid #f0f4f8' }}>
                          <td style={{ padding: '12px 14px', fontWeight: 800, color: ['#f59e0b','#9ca3af','#cd7c2f'][i] || '#888', fontSize: 14 }}>#{i+1}</td>
                          <td style={{ padding: '12px 14px', fontWeight: 600, fontSize: 14, color: '#1a202c' }}>{p.fullName}</td>
                          <td style={{ padding: '12px 14px', fontSize: 13, color: '#888' }}>{p.mssv || '—'}</td>
                          <td style={{ padding: '12px 14px', fontSize: 13, color: '#888' }}>{p.khoa || '—'}</td>
                          <td style={{ padding: '12px 14px', fontSize: 14, fontWeight: 700, color: p.score ? '#1a3a8f' : '#ccc' }}>{p.score ?? '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div>
            <Card style={{ marginBottom: 16 }}>
              <h4 style={{ fontSize: 14, fontWeight: 700, color: '#1a202c', margin: '0 0 14px' }}>ℹ️ Thông tin kỳ thi</h4>
              {[
                ['Thời gian thi', c.durationMinutes ? `${c.durationMinutes} phút` : '—'],
                ['Môn thi', c.subject || '—'],
                ['Ngày thi', formatDate(c.startTime)],
                ['Người tạo', c.creatorName || '—'],
              ].map(([l, v], i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: i<3?'1px solid #f0f4f8':'none', gap: 12 }}>
                  <span style={{ color: '#888', fontSize: 13 }}>{l}</span>
                  <span style={{ fontWeight: 600, fontSize: 13, color: '#1a202c', textAlign: 'right' }}>{v}</span>
                </div>
              ))}
            </Card>

            {prizes.length > 0 && (
              <div style={{ background: '#fffbeb', borderRadius: 14, padding: '20px', border: '1.5px solid #fde68a' }}>
                <h4 style={{ fontSize: 14, fontWeight: 700, color: '#92400e', margin: '0 0 12px' }}>🏆 Giải thưởng</h4>
                {prizes.map((p, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: i<prizes.length-1?'1px solid #fde68a':'none' }}>
                    <span style={{ fontSize: 12, color: '#92400e' }}>{p.rank}</span>
                    <span style={{ fontWeight: 700, fontSize: 13, color: p.color }}>{p.amount}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}