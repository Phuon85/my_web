import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import { Card, Spinner, PageContainer, Btn, Toast } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { useAction } from '../../hooks/useApi';
import { contestAPI } from '../../api/axios';

const TABS = ['Giới thiệu','Thể lệ & Cấu trúc','Giải thưởng','Danh sách thí sinh'];

const MOCK = {
  id:1, title:'Olympic Vật Lý', subtitle:'Cấp Trường – Mùa 2026',
  subject:'Vật lý', duration:90, registrants:150,
  daysLeft:2, hoursLeft:14,
  prize1:'500.000 VND', status:'OPEN',
  teacher:{ name:'TS. Nguyễn Văn A', role:'Trưởng Ban Ra Đề', rating:4.9,
    bio:'Tiến sĩ Vật lý, Trường Đại học Mỏ – Địa chất Hà Nội. Chuyên gia về Cơ học Lượng tử và Vật lý Thống kê.' },
  about:'Olympic Vật lý cấp trường là cuộc thi học thuật uy tín nhất tại Trường Đại học Mỏ – Địa chất Hà Nội, nhằm khuyến khích sinh viên phát triển tư duy khoa học và kỹ năng giải quyết vấn đề phức tạp.',
  objectives:['Nâng cao kiến thức chuyên môn Vật lý','Phát triển kỹ năng tư duy logic và phân tích','Cơ hội nhận học bổng và giải thưởng giá trị','Mở rộng mạng lưới kết nối học thuật'],
  content:['Cơ học','Nhiệt học','Quang học','Điện tử học','Vật lý hiện đại'],
  info:{ questions:5, form:'Offline – Tự luận trên giấy', date:'15/03/2026' },
  prizes:[
    { rank:'🥇 Giải Nhất', amount:'500.000 VND', color:'#f59e0b' },
    { rank:'🥈 Giải Nhì',  amount:'300.000 VND', color:'#9ca3af' },
    { rank:'🥉 Giải Ba',   amount:'200.000 VND', color:'#cd7c2f' },
    { rank:'Giải KK',      amount:'100.000 VND', color:'#6b7280' },
  ],
  steps:[
    { icon:'⏱️', color:'#3b82f6', title:'Phần 1: Trắc nghiệm', time:'30 phút', detail:'40 câu – 4 điểm' },
    { icon:'✏️', color:'#f59e0b', title:'Phần 2: Tự luận',      time:'60 phút', detail:'5 câu – 6 điểm' },
    { icon:'📤', color:'#10b981', title:'Nộp bài & Kết thúc',   time:'Hoàn thành', detail:'Xem kết quả ngay' },
  ],
  examInfo:{ totalTime:90, totalQ:45, totalScore:10, minPass:'≥ 5.0', maxAttempts:'1 lần' },
  topics:['Ma trận & Định thức','Hệ phương trình tuyến tính'],
  related:[{ name:'Olympic Toán học', date:'20/02/2026' },{ name:'Olympic Hóa học', date:'25/02/2026' }],
  participants:[
    { rank:1, name:'Trần Thị B', school:'KTCN K66', score:9.5 },
    { rank:2, name:'Lê Văn C',   school:'CNTT K67', score:9.2 },
    { rank:3, name:'Nguyễn Văn A',school:'DCCT K67',score:8.8 },
    { rank:4, name:'Phạm Thị D', school:'XD K66',   score:8.5 },
    { rank:5, name:'Hoàng Văn E', school:'Mỏ K67',  score:8.0 },
  ],
};

const TAG_COLORS = [
  ['#e0f2fe','#0369a1'],['#fef3c7','#92400e'],['#f0fdf4','#166534'],
  ['#ede9fe','#5b21b6'],['#fce7f3','#9d174d'],
];

export default function ContestDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { loading, error, success, run } = useAction();
  const [contest, setContest] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [tab, setTab] = useState(0);
  const [registered, setRegistered] = useState(false);

  useEffect(() => {
    setFetching(true);
    contestAPI.getById(id)
      .then(r => setContest(r.data))
      .catch(() => setContest(MOCK))
      .finally(() => setFetching(false));
  }, [id]);

  const handleRegister = async () => {
    const res = await run(() => contestAPI.register(id), 'Đăng ký tham dự thành công!');
    if (res.ok) setRegistered(true);
  };

  if (fetching) return <div style={{ minHeight:'100vh', background:'#f5f6fa' }}><Navbar /><Spinner /></div>;
  const c = contest || MOCK;

  return (
    <div style={{ minHeight:'100vh', background:'#f5f6fa', fontFamily:"'Be Vietnam Pro',sans-serif" }}>
      <Navbar />

      <div style={{ maxWidth:1000, margin:'0 auto', padding:'16px 24px 0' }}>
        <span style={{ color:'#888', fontSize:13, cursor:'pointer' }} onClick={() => navigate('/contests')}>Cuộc thi</span>
        <span style={{ color:'#888', fontSize:13 }}> › {c.title}</span>
      </div>

      {/* Hero */}
      <div style={{ maxWidth:1000, margin:'12px auto 0', padding:'0 24px' }}>
        <div style={{
          background:'linear-gradient(135deg,#0f2a6e 0%,#1a7a4a 100%)',
          borderRadius:16, padding:'40px 48px',
          display:'flex', justifyContent:'space-between', alignItems:'center', gap:24, flexWrap:'wrap',
          boxShadow:'0 8px 32px rgba(0,0,0,0.2)',
        }}>
          <div>
            <h1 style={{ color:'#fff', fontSize:32, fontWeight:900, margin:'0 0 6px' }}>{c.title}</h1>
            <h2 style={{ color:'#f59e0b', fontSize:22, fontWeight:800, margin:'0 0 20px' }}>{c.subtitle}</h2>
            <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
              <span style={{ background:'#f59e0b', color:'#fff', fontSize:13, fontWeight:700, padding:'7px 16px', borderRadius:20 }}>
                🏆 Giải Nhất: {c.prize1}
              </span>
              <span style={{ background:'rgba(255,255,255,0.15)', color:'#fff', fontSize:13, fontWeight:600, padding:'7px 16px', borderRadius:20 }}>
                ⏱️ {c.duration} Phút
              </span>
            </div>
          </div>

          {/* Countdown + Register */}
          <div style={{ background:'rgba(255,255,255,0.1)', borderRadius:14, padding:'24px 28px', backdropFilter:'blur(10px)', textAlign:'center', minWidth:210 }}>
            <p style={{ color:'rgba(255,255,255,0.75)', fontSize:13, margin:'0 0 12px' }}>Đăng ký đóng sau:</p>
            <div style={{ display:'flex', gap:8, justifyContent:'center', marginBottom:16 }}>
              {[['02','ngày'],[c.hoursLeft,'giờ']].map(([val,unit]) => (
                <div key={unit} style={{ textAlign:'center' }}>
                  <div style={{ background:'#1a3a8f', color:'#fff', borderRadius:8, padding:'10px 16px', fontSize:22, fontWeight:800, minWidth:52 }}>{val}</div>
                  <span style={{ color:'rgba(255,255,255,0.6)', fontSize:12 }}>{unit}</span>
                </div>
              ))}
            </div>
            <button onClick={handleRegister} disabled={loading || registered}
              style={{
                width:'100%', padding:12,
                background: registered ? '#10b981' : '#f59e0b',
                border:'none', borderRadius:8, color:'#fff',
                fontSize:13, fontWeight:800, cursor: registered ? 'default' : 'pointer',
                fontFamily:'inherit',
              }}>
              {loading ? 'Đang xử lý...' : registered ? '✅ ĐÃ ĐĂNG KÝ' : 'ĐĂNG KÝ THAM GIA NGAY'}
            </button>
            <p style={{ color:'rgba(255,255,255,0.6)', fontSize:12, margin:'10px 0 0' }}>
              👥 {c.registrants} sinh viên đã đăng ký
            </p>
          </div>
        </div>
      </div>

      {/* Tabs + Content */}
      <div style={{ maxWidth:1000, margin:'0 auto', padding:'0 24px' }}>
        <Toast msg={success} type="success" />
        <Toast msg={error}   type="error" />

        <div style={{ display:'flex', borderBottom:'1.5px solid #e8ecf0', marginTop:24 }}>
          {TABS.map((t,i) => (
            <button key={i} onClick={() => setTab(i)}
              style={{
                padding:'12px 20px', background:'none', border:'none', cursor:'pointer',
                fontSize:14, fontFamily:'inherit',
                fontWeight: tab===i ? 700 : 400,
                color: tab===i ? '#1a3a8f' : '#718096',
                borderBottom: tab===i ? '2px solid #1a3a8f' : '2px solid transparent',
                marginBottom:-2,
              }}>
              {t}
            </button>
          ))}
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 280px', gap:24, marginTop:24, paddingBottom:48 }}>
          {/* Main */}
          <div>
            {tab === 0 && <>
              {/* Teacher */}
              <Card style={{ marginBottom:20, display:'flex', gap:16, alignItems:'flex-start' }}>
                <div style={{ width:48, height:48, borderRadius:'50%', background:'#e8ecf0', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, flexShrink:0 }}>👨‍🏫</div>
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', justifyContent:'space-between' }}>
                    <div>
                      <p style={{ fontWeight:700, fontSize:15, color:'#1a202c', margin:'0 0 2px' }}>{c.teacher?.name}</p>
                      <p style={{ color:'#10b981', fontSize:13, margin:'0 0 6px' }}>{c.teacher?.role}</p>
                      <p style={{ color:'#555', fontSize:13, margin:0, lineHeight:1.5 }}>{c.teacher?.bio}</p>
                    </div>
                    <span style={{ color:'#f59e0b', fontWeight:700, fontSize:14, flexShrink:0, marginLeft:12 }}>⭐ {c.teacher?.rating}</span>
                  </div>
                </div>
              </Card>
              <Card style={{ marginBottom:20 }}>
                <h3 style={{ fontSize:16, fontWeight:700, color:'#1a202c', margin:'0 0 14px' }}>Về cuộc thi</h3>
                <p style={{ color:'#555', fontSize:14, lineHeight:1.7, margin:'0 0 14px' }}>{c.about}</p>
                <ul style={{ paddingLeft:20, margin:0 }}>
                  {c.objectives?.map((o,i) => <li key={i} style={{ color:'#555', fontSize:14, lineHeight:1.7, marginBottom:6 }}>{o}</li>)}
                </ul>
              </Card>
              <Card>
                <h3 style={{ fontSize:16, fontWeight:700, color:'#1a202c', margin:'0 0 14px' }}>Nội dung thi</h3>
                <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                  {c.content?.map((t,i) => (
                    <span key={i} style={{ padding:'6px 16px', borderRadius:20, fontSize:13, fontWeight:600, background:TAG_COLORS[i%5][0], color:TAG_COLORS[i%5][1] }}>{t}</span>
                  ))}
                </div>
              </Card>
            </>}

            {tab === 1 && <>
              <Card style={{ marginBottom:20 }}>
                <h3 style={{ fontSize:16, fontWeight:700, color:'#1a202c', margin:'0 0 24px', display:'flex', alignItems:'center', gap:8 }}>📋 Quy trình làm bài thi</h3>
                <div style={{ display:'flex', alignItems:'flex-start', gap:8 }}>
                  {c.steps?.map((s,i) => (
                    <React.Fragment key={i}>
                      <div style={{ textAlign:'center', flex:1 }}>
                        <div style={{ width:56, height:56, borderRadius:14, background:s.color, margin:'0 auto 10px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, boxShadow:`0 4px 12px ${s.color}44` }}>{s.icon}</div>
                        <p style={{ fontWeight:700, fontSize:13, color:'#1a202c', margin:'0 0 4px' }}>{s.title}</p>
                        <p style={{ color:s.color, fontSize:14, fontWeight:800, margin:'0 0 4px' }}>{s.time}</p>
                        <p style={{ color:'#888', fontSize:12, margin:0 }}>{s.detail}</p>
                      </div>
                      {i < c.steps.length-1 && <div style={{ marginTop:20, color:'#cbd5e0', fontSize:20 }}>→</div>}
                    </React.Fragment>
                  ))}
                </div>
              </Card>
              <Card>
                <h3 style={{ fontSize:15, fontWeight:700, color:'#1a202c', margin:'0 0 6px' }}>📚 Nội dung ôn tập</h3>
                <p style={{ color:'#888', fontSize:13, margin:'0 0 14px' }}>Các chủ đề chính trong kỳ thi</p>
                <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                  {c.topics?.map((t,i) => (
                    <span key={i} style={{ background:'#e0f2fe', color:'#0369a1', fontSize:13, fontWeight:600, padding:'6px 16px', borderRadius:20 }}>{t}</span>
                  ))}
                </div>
              </Card>
            </>}

            {tab === 2 && (
              <Card>
                <h3 style={{ fontSize:16, fontWeight:700, color:'#1a202c', margin:'0 0 20px' }}>🏆 Giải thưởng</h3>
                {c.prizes?.map((p,i) => (
                  <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'16px 20px', background:p.color+'0f', borderRadius:10, marginBottom:10, border:`1.5px solid ${p.color}30` }}>
                    <span style={{ fontSize:15, fontWeight:700, color:'#1a202c' }}>{p.rank}</span>
                    <span style={{ fontSize:18, fontWeight:900, color:p.color }}>{p.amount}</span>
                  </div>
                ))}
              </Card>
            )}

            {tab === 3 && (
              <Card>
                <h3 style={{ fontSize:16, fontWeight:700, color:'#1a202c', margin:'0 0 20px' }}>👥 Danh sách thí sinh</h3>
                <table style={{ width:'100%', borderCollapse:'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom:'2px solid #e8ecf0' }}>
                      {['Hạng','Họ và tên','Lớp','Điểm'].map(h => (
                        <th key={h} style={{ padding:'10px 14px', textAlign:'left', fontSize:13, color:'#888', fontWeight:600 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {c.participants?.map((p,i) => (
                      <tr key={i} style={{ borderBottom:'1px solid #f0f4f8' }}>
                        <td style={{ padding:'12px 14px', fontWeight:800, color:['#f59e0b','#9ca3af','#cd7c2f','#555','#555'][i] }}>#{p.rank}</td>
                        <td style={{ padding:'12px 14px', fontWeight:600, fontSize:14, color:'#1a202c' }}>{p.name}</td>
                        <td style={{ padding:'12px 14px', fontSize:13, color:'#888' }}>{p.school}</td>
                        <td style={{ padding:'12px 14px', fontSize:15, fontWeight:700, color:'#1a3a8f' }}>{p.score}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div>
            <Card style={{ marginBottom:16 }}>
              <h4 style={{ fontSize:14, fontWeight:700, color:'#1a202c', margin:'0 0 14px' }}>ℹ️ Thông tin cuộc thi</h4>
              {[['Thời gian thi:',`${c.duration} phút`],['Số câu hỏi:',`${c.info?.questions} câu`],['Hình thức:',c.info?.form],['Ngày thi:',c.info?.date]].map(([l,v],i) => (
                <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:i<3?'1px solid #f0f4f8':'none', gap:12 }}>
                  <span style={{ color:'#888', fontSize:13 }}>{l}</span>
                  <span style={{ fontWeight:600, fontSize:13, color:'#1a202c', textAlign:'right' }}>{v}</span>
                </div>
              ))}
            </Card>

            <div style={{ background:'#fffbeb', borderRadius:14, padding:'20px', marginBottom:16, border:'1.5px solid #fde68a' }}>
              <h4 style={{ fontSize:14, fontWeight:700, color:'#92400e', margin:'0 0 12px' }}>🏆 Giải thưởng</h4>
              {c.prizes?.map((p,i) => (
                <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:i<c.prizes.length-1?'1px solid #fde68a':'none' }}>
                  <span style={{ fontSize:12, color:'#92400e' }}>{p.rank}</span>
                  <span style={{ fontWeight:700, fontSize:13, color:p.color }}>{p.amount}</span>
                </div>
              ))}
            </div>

            {tab === 1 && (
              <div style={{ background:'linear-gradient(135deg,#1a3a8f,#1a7a4a)', borderRadius:14, padding:'24px', boxShadow:'0 4px 16px rgba(0,0,0,0.15)', textAlign:'center' }}>
                <div style={{ fontSize:36, marginBottom:8 }}>🚀</div>
                <p style={{ color:'#fff', fontWeight:700, fontSize:15, margin:'0 0 6px' }}>Sẵn sàng làm bài?</p>
                <p style={{ color:'rgba(255,255,255,0.75)', fontSize:13, margin:'0 0 16px', lineHeight:1.5 }}>Đảm bảo đã đọc kỹ thể lệ trước khi bắt đầu</p>
                <button onClick={() => navigate(`/contests/${id}/exam`)}
                  style={{ width:'100%', padding:12, background:'#fff', color:'#1a3a8f', border:'none', borderRadius:8, fontSize:14, fontWeight:800, cursor:'pointer', fontFamily:'inherit' }}>
                  Bắt đầu thi ngay
                </button>
              </div>
            )}

            <Card style={{ marginTop:16 }}>
              <h4 style={{ fontSize:14, fontWeight:700, color:'#1a202c', margin:'0 0 12px' }}>Cuộc thi liên quan</h4>
              {c.related?.map((r,i) => (
                <div key={i} style={{ padding:'10px 0', borderBottom:i<c.related.length-1?'1px solid #f0f4f8':'none', cursor:'pointer' }}
                  onClick={() => navigate('/contests')}>
                  <p style={{ fontWeight:600, fontSize:13, color:'#1a202c', margin:'0 0 3px' }}>{r.name}</p>
                  <p style={{ color:'#aaa', fontSize:12, margin:0 }}>Đăng ký: {r.date}</p>
                </div>
              ))}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
