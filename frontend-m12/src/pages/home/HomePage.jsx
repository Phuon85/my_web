import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import { Card, Spinner, PageContainer, SectionTitle } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { userAPI, contestAPI, newsAPI  } from '../../api/axios';

const NOTIF_TABS = ['Tất cả', 'Quan trọng', 'Hệ thống'];

export default function HomePage() {
  const { user } = useAuth();
  const navigate  = useNavigate();

  // ── State ────────────────────────────────────────────────────────────────
  const [leaderboard, setLeaderboard]   = useState([]);
  const [contests,    setContests]      = useState([]);
  const [loadingLB,   setLoadingLB]     = useState(true);
  const [loadingCon,  setLoadingCon]    = useState(true);
  const [notifTab,    setNotifTab]      = useState('Tất cả');

  const [notifs, setNotifs] = useState([]);
  const [loadingNotif, setLoadingNotif] = useState(true);
  const unread = notifs.filter(n => !n.read).length;

  // ── Fetch leaderboard từ API thật ────────────────────────────────────────
  useEffect(() => {
    setLoadingLB(true);
    userAPI.leaderboard(5)
      .then(r => setLeaderboard(r.data || []))
      .catch(() => setLeaderboard([]))
      .finally(() => setLoadingLB(false));
  }, []);

  // ── Fetch danh sách cuộc thi sắp tới từ API thật ────────────────────────
  useEffect(() => {
    setLoadingCon(true);
    contestAPI.getAll({ size: 3 })
      .then(r => {
        const list = Array.isArray(r.data) ? r.data : (r.data?.content || []);
        setContests(list.slice(0, 3));
      })
      .catch(() => setContests([]))
      .finally(() => setLoadingCon(false));
  }, []);

  useEffect(() => {
  setLoadingNotif(true);
  // Gọi API lấy tin tức mới nhất (ví dụ lấy 5 tin)
  newsAPI.getAll({ page: 0, size: 5 }) 
    .then(r => {
      const list = Array.isArray(r.data) ? r.data : (r.data?.content || []);
      const mappedNotifs = list.map(news => ({
        id: news.id,
        type: news.category === 'Hệ thống' ? 'system' : (news.isFeatured ? 'important' : 'info'),
        title: news.title,
        body: news.summary || '',
        time: news.createdAtFormatted || new Date(news.createdAt).toLocaleDateString(),
        read: true
      }));
      setNotifs(mappedNotifs);
    })
    .catch(err => console.error("Lỗi tải tin tức:", err))
    .finally(() => setLoadingNotif(false));
}, []);

  const markRead = id =>
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));

  const filteredNotifs = notifs.filter(n =>
    notifTab === 'Tất cả'     ? true :
    notifTab === 'Quan trọng' ? n.type === 'important' :
    n.type === 'system'
  );

  // ── Tính ngày còn lại ────────────────────────────────────────────────────
  const daysLeft = (dateStr) => {
    if (!dateStr) return null;
    const diff = Math.ceil(
      (new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24)
    );
    return diff > 0 ? diff : null;
  };

  const EVENT_COLORS = ['#e53e3e', '#dd6b20', '#2b6cb0', '#6b46c1', '#276749'];

  return (
    <div style={{ minHeight:'100vh', background:'#f5f6fa', fontFamily:"'Be Vietnam Pro',sans-serif" }}>
      <Navbar unreadCount={unread} />

      <PageContainer>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 310px', gap:24 }}>

          {/* ── LEFT ──────────────────────────────────────────────────── */}
          <div>
            {/* Welcome Banner — dùng dữ liệu thật từ user */}
            <div style={{
              background:'linear-gradient(135deg,#1a7a4a 0%,#1d8a55 60%,#0f6e40 100%)',
              borderRadius:16, padding:'28px 32px', marginBottom:24,
              display:'flex', alignItems:'center', justifyContent:'space-between',
              boxShadow:'0 6px 24px rgba(26,122,74,0.25)',
            }}>
              <div>
                <h2 style={{ color:'#fff', fontSize:22, fontWeight:800, margin:'0 0 6px' }}>
                  Chào mừng trở lại, {user?.fullName || 'bạn'}! 👋
                </h2>
                <p style={{ color:'rgba(255,255,255,0.8)', fontSize:14, margin:'0 0 18px' }}>
                  Hôm nay là ngày tuyệt vời để chinh phục tri thức!
                </p>
                <div style={{ display:'flex', gap:12 }}>
                  {[
                    ['Điểm số', (user?.totalScore ?? 0).toLocaleString()],
                    ['Xếp hạng', user?.rank ? `#${user.rank}` : '—'],
                  ].map(([label, val]) => (
                    <div key={label} style={{
                      background:'rgba(255,255,255,0.15)', borderRadius:8,
                      padding:'8px 16px', display:'flex', alignItems:'center', gap:8,
                    }}>
                      <span style={{ color:'rgba(255,255,255,0.75)', fontSize:12 }}>{label}</span>
                      <span style={{ color:'#f59e0b', fontWeight:900, fontSize:18 }}>{val}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ fontSize:64, opacity:0.5 }}>🏆</div>
            </div>

            {/* Thông báo */}
            <Card style={{ padding:'20px 24px' }}>
              <SectionTitle>📣 Bảng Thông Báo & Tin Tức</SectionTitle>
              <div style={{ display:'flex', gap:4, borderBottom:'1.5px solid #e8ecf0', marginBottom:16 }}>
                {NOTIF_TABS.map(tab => (
                  <button key={tab} onClick={() => setNotifTab(tab)}
                    style={{
                      background:'none', border:'none', cursor:'pointer',
                      padding:'8px 14px', fontSize:13, fontFamily:'inherit',
                      fontWeight: notifTab===tab ? 700 : 400,
                      color: notifTab===tab ? '#1a3a8f' : '#718096',
                      borderBottom: notifTab===tab ? '2px solid #1a3a8f' : '2px solid transparent',
                      marginBottom:-2, display:'flex', alignItems:'center', gap:5,
                    }}>
                    {tab}
                    {tab==='Quan trọng' && unread > 0 && (
                      <span style={{ background:'#e53e3e', color:'#fff', fontSize:10, fontWeight:700, borderRadius:'50%', width:16, height:16, display:'inline-flex', alignItems:'center', justifyContent:'center' }}>{unread}</span>
                    )}
                  </button>
                ))}
              </div>

              {/* Thêm cờ loadingNotif vào đây */}
              {loadingNotif ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '30px 0' }}>
                  <Spinner size={24} />
                </div>
              ) : filteredNotifs.length === 0 ? (
                <p style={{ textAlign:'center', color:'#aaa', fontSize:14, padding:'24px 0' }}>
                  Không có thông báo
                </p>
              ) : (
                filteredNotifs.map((n, i) => (
                  <div key={n.id} onClick={() => markRead(n.id)}
                    style={{
                      display:'flex', gap:14, padding:'13px 0',
                      borderBottom: i < filteredNotifs.length-1 ? '1px solid #f0f4f8' : 'none',
                      cursor:'pointer',
                      background: n.read ? 'transparent' : '#fffbf0',
                      borderRadius:6, paddingLeft: n.read ? 0 : 10,
                    }}>
                    <span style={{ fontSize:18, flexShrink:0, marginTop:2 }}>
                      {n.type==='important' ? '⚠️' : n.type==='system' ? '🔧' : '📢'}
                    </span>
                    <div style={{ flex:1 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
                        <p style={{ fontWeight: n.read ? 500 : 700, fontSize:14, color:'#1a202c', margin:0 }}>{n.title}</p>
                        <span style={{ color:'#a0aec0', fontSize:12, flexShrink:0, marginLeft:12 }}>{n.time}</span>
                      </div>
                      <p style={{ color:'#718096', fontSize:13, margin:0, lineHeight:1.5 }}>{n.body}</p>
                    </div>
                  </div>
                ))
              )}
            </Card>
          </div>

          {/* ── RIGHT ─────────────────────────────────────────────────── */}
          <div>
            {/* Leaderboard — API thật */}
            <Card style={{ marginBottom:20 }}>
              <SectionTitle>🏆 Bảng xếp hạng</SectionTitle>
              {loadingLB ? <Spinner size={28} /> : leaderboard.length === 0 ? (
                <p style={{ textAlign:'center', color:'#aaa', fontSize:13, padding:'16px 0' }}>Chưa có dữ liệu</p>
              ) : leaderboard.map((u, i) => (
                <div key={u.id || i}
                  style={{
                    display:'flex', alignItems:'center', gap:10,
                    padding:'10px 12px', borderRadius:10, marginBottom:6,
                    background: u.email === user?.email ? '#eff6ff' : 'transparent',
                    border: u.email === user?.email ? '1.5px solid #bfdbfe' : '1.5px solid transparent',
                  }}>
                  <span style={{
                    width:26, height:26, borderRadius:'50%', flexShrink:0,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:12, fontWeight:800,
                    background: i===0?'#f59e0b':i===1?'#9ca3af':i===2?'#cd7c2f':'#e5e7eb',
                    color: i<3 ? '#fff' : '#6b7280',
                  }}>{i+1}</span>
                  <div style={{
                    width:32, height:32, borderRadius:'50%', flexShrink:0,
                    background:`hsl(${(u.id*53)%360},55%,65%)`,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:14, fontWeight:700, color:'#fff',
                  }}>
                    {u.avatarUrl
                      ? <img src={u.avatarUrl} style={{ width:'100%', height:'100%', borderRadius:'50%', objectFit:'cover' }} alt="" />
                      : u.fullName?.charAt(0)?.toUpperCase()}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontWeight: u.email===user?.email ? 700 : 500, fontSize:13, color:'#1a202c', margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {u.fullName}
                    </p>
                    <p style={{ color:'#a0aec0', fontSize:11, margin:0 }}>
                      {(u.totalScore || 0).toLocaleString()} điểm
                    </p>
                  </div>
                  {i < 3 && <span>{['🥇','🥈','🥉'][i]}</span>}
                </div>
              ))}
            </Card>

            {/* Sự kiện sắp tới — API thật */}
            <Card>
              <SectionTitle>📅 Sự kiện sắp tới</SectionTitle>
              {loadingCon ? <Spinner size={24} /> : contests.length === 0 ? (
                <p style={{ textAlign:'center', color:'#aaa', fontSize:13, padding:'16px 0' }}>Không có sự kiện nào</p>
              ) : contests.map((c, i) => {
                const days = daysLeft(c.startTime);
                return (
                  <div key={c.id}
                    style={{ display:'flex', gap:12, padding:'12px 0', borderBottom: i<contests.length-1 ? '1px solid #f0f4f8' : 'none', cursor:'pointer' }}
                    onClick={() => navigate(`/contests/${c.id}`)}>
                    <div style={{ width:3, flexShrink:0, borderRadius:2, background: EVENT_COLORS[i % EVENT_COLORS.length], marginTop:4 }} />
                    <div>
                      <p style={{ fontWeight:600, fontSize:13, color:'#1a202c', margin:'0 0 3px' }}>{c.title}</p>
                      <p style={{ color:'#718096', fontSize:12, margin:'0 0 4px' }}>
                        {c.startTime ? new Date(c.startTime).toLocaleString('vi-VN') : '—'}
                      </p>
                      {days !== null && (
                        <span style={{ color: EVENT_COLORS[i % EVENT_COLORS.length], fontSize:11, fontWeight:700 }}>
                          Còn {days} ngày
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
              <button onClick={() => navigate('/contests')}
                style={{ width:'100%', marginTop:14, padding:11, background:'linear-gradient(90deg,#1a7a4a,#1d8a55)', border:'none', borderRadius:8, cursor:'pointer', color:'#fff', fontSize:13, fontWeight:700, fontFamily:'inherit' }}>
                Xem lịch đầy đủ
              </button>
            </Card>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}