import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import { useAuth } from '../../context/AuthContext';

// ── Mock data ──────────────────────────────────────────────────────────────
const MOCK_ROADMAP = {
  title: 'Lộ trình Chinh phục Olympic Đại số',
  chapters: [
    {
      id: 1, title: 'Chương 1: Ma trận & Định thức',
      fileCount: 5, expanded: true,
      note: 'Lưu ý từ giảng viên:\nCác em lưu ý: File bài tập số 02 đang bị nằm ngoài, rất quan trọng. File lý thuyết chỉ đọc lướt.',
      files: [
        { id:1, name:'Giao_trinh_Ly_thuyet_Ma_tran.pdf', type:'PDF',  size:'2.5 MB',  updated:'Cập nhật 3 ngày trước', canPreview:true  },
        { id:2, name:'Bai_tap_Tu_luyen_Tuan_1.docx',    type:'DOCX', size:'500 KB',  updated:'Cập nhật 5 ngày trước', canPreview:false },
        { id:3, name:'Bai_giang_Slide_Chuong_1.pptx',   type:'PPTX', size:'8.2 MB',  updated:'Cập nhật 1 tuần trước', canPreview:true  },
        { id:4, name:'Dap_an_Bai_tap_Tuan_1.pdf',       type:'PDF',  size:'1.1 MB',  updated:'Mới cập nhật',          canPreview:true  },
        { id:5, name:'Video_Huong_dan_Giai_Bai_tap.mp4', type:'MP4', size:'45.3 MB', updated:'Cập nhật 4 ngày trước', canPreview:false },
      ],
    },
    { id:2, title:'Chương 2: Hệ phương trình tuyến tính', fileCount:3, updated:'Cập nhật 2 ngày trước', expanded:false, files:[] },
    { id:3, title:'Chương 3: Không gian vector',           fileCount:7, updated:'Cập nhật 1 tuần trước', expanded:false, files:[] },
    { id:4, title:'Chương 4: Giá trị riêng và vector riêng',fileCount:4, updated:'Cập nhật 2 tuần trước', expanded:false, files:[] },
  ],
  recentFiles: [
    { name:'Dap_an_Bai_tap_Tuan_1.pdf',  time:'Hôm nay, 14:30', type:'PDF'  },
    { name:'Bai_tap_Chuong_2.docx',       time:'2 ngày trước',   type:'DOCX' },
    { name:'Slide_Chuong_2.pptx',         time:'2 ngày trước',   type:'PPTX' },
    { name:'ly_thuyet_Chuong_1.pdf',      time:'3 ngày trước',   type:'PDF'  },
  ],
  notifications: [
    { text:'Thầy vừa update lại file đáp án chương 1 nhé.', time:'Hôm nay, 14:25', type:'info'    },
    { text:'Nhớ hoàn thành bài tập tuần 1 trước 11..',       time:'3 ngày trước',  type:'warning' },
    { text:'Tài liệu chương 2 đã được upload đầy đủ.',       time:'1 tuần trước',  type:'success' },
  ],
  stats: { total:25, downloaded:15, remaining:10 },
};

const FILE_COLORS = { PDF:'#e53e3e', DOCX:'#3b82f6', PPTX:'#f97316', MP4:'#8b5cf6', ZIP:'#6b7280' };
const FILE_ICONS  = { PDF:'📄', DOCX:'📝', PPTX:'📊', MP4:'🎬', ZIP:'📦' };

export default function RoadmapPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [chapters, setChapters] = useState(MOCK_ROADMAP.chapters);
  const data = MOCK_ROADMAP;

  const toggleChapter = (id) => {
    setChapters(prev => prev.map(c => c.id===id ? {...c, expanded:!c.expanded} : c));
  };

  const notifStyle = { info:'#3b82f6', warning:'#f59e0b', success:'#10b981' };
  const notifBg    = { info:'#eff6ff',  warning:'#fffbeb',  success:'#f0fdf4' };

  return (
    <div style={{ minHeight:'100vh', background:'#f5f6fa', fontFamily:"'Be Vietnam Pro',sans-serif" }}>
      <Navbar />

      <div style={{ maxWidth:1100, margin:'0 auto', padding:'28px 24px' }}>
        {/* Title */}
        <h1 style={{ fontSize:22, fontWeight:800, color:'#1a202c', margin:'0 0 24px', display:'flex', alignItems:'center', gap:10 }}>
          🎓 {data.title}
        </h1>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 280px', gap:24 }}>
          {/* ── LEFT: Chapters ── */}
          <div>
            {chapters.map(chapter => (
              <div key={chapter.id}
                style={{ background:'#fff', borderRadius:14, marginBottom:12, border:'1.5px solid #e8ecf0', overflow:'hidden', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>

                {/* Chapter header */}
                <button onClick={() => toggleChapter(chapter.id)}
                  style={{
                    width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between',
                    padding:'16px 20px', background: chapter.expanded ? 'linear-gradient(90deg,#1a7a4a,#1d8a55)' : '#fff',
                    border:'none', cursor:'pointer', fontFamily:'inherit',
                  }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <span style={{ fontSize:16 }}>{chapter.expanded ? '▼' : '▶'}</span>
                    <span style={{ fontWeight:700, fontSize:15, color: chapter.expanded ? '#fff' : '#1a202c' }}>
                      {chapter.title}
                    </span>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                    {chapter.updated && !chapter.expanded && (
                      <span style={{ fontSize:12, color:'#aaa' }}>• {chapter.updated}</span>
                    )}
                    <span style={{
                      background: chapter.expanded ? 'rgba(255,255,255,0.2)' : '#f0fdf4',
                      color: chapter.expanded ? '#fff' : '#166534',
                      fontSize:12, fontWeight:700, padding:'3px 10px', borderRadius:16,
                    }}>
                      {chapter.fileCount} tài liệu
                    </span>
                  </div>
                </button>

                {/* Chapter content */}
                {chapter.expanded && (
                  <div style={{ padding:'0 20px 20px' }}>
                    {/* Note box */}
                    {chapter.note && (
                      <div style={{ background:'#fffbeb', border:'1.5px solid #fde68a', borderRadius:10, padding:'12px 16px', margin:'16px 0', borderLeft:'4px solid #f59e0b' }}>
                        <p style={{ fontSize:13, color:'#92400e', lineHeight:1.6, margin:0, whiteSpace:'pre-line' }}>{chapter.note}</p>
                      </div>
                    )}

                    {/* File list */}
                    {chapter.files.map(file => (
                      <div key={file.id}
                        style={{
                          display:'flex', alignItems:'center', gap:14,
                          padding:'13px 0', borderBottom:'1px solid #f0f4f8',
                        }}>
                        {/* File icon */}
                        <div style={{
                          width:40, height:40, borderRadius:8, flexShrink:0,
                          background: FILE_COLORS[file.type] || '#888',
                          display:'flex', alignItems:'center', justifyContent:'center', fontSize:18,
                        }}>
                          {FILE_ICONS[file.type] || '📄'}
                        </div>

                        {/* Name + meta */}
                        <div style={{ flex:1, minWidth:0 }}>
                          <p style={{ fontWeight:600, fontSize:14, color:'#1a202c', margin:'0 0 2px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                            {file.name}
                          </p>
                          <p style={{ fontSize:12, color:'#aaa', margin:0 }}>
                            {file.type} Document &nbsp;•&nbsp; {file.size} &nbsp;•&nbsp; {file.updated}
                          </p>
                        </div>

                        {/* Buttons */}
                        <div style={{ display:'flex', gap:8, flexShrink:0 }}>
                          {file.canPreview && (
                            <button
                              style={{
                                padding:'7px 16px', border:'1.5px solid #1a3a8f',
                                borderRadius:8, background:'#fff', color:'#1a3a8f',
                                fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit',
                                display:'flex', alignItems:'center', gap:4,
                              }}>
                              👁 Xem trước
                            </button>
                          )}
                          <button
                            onClick={() => window.open(`/api/documents/${file.id}/download`, '_blank')}
                            style={{
                              padding:'7px 16px', border:'none',
                              borderRadius:8, background:'linear-gradient(90deg,#1a7a4a,#1d8a55)', color:'#fff',
                              fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit',
                              display:'flex', alignItems:'center', gap:4,
                            }}>
                            ⬇ Tải xuống
                          </button>
                        </div>
                      </div>
                    ))}

                    {chapter.files.length === 0 && (
                      <div style={{ textAlign:'center', padding:'24px 0', color:'#aaa', fontSize:13 }}>
                        Chưa có tài liệu trong chương này
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* ── RIGHT sidebar ── */}
          <div>
            {/* Recent files */}
            <div style={{ background:'#fff', borderRadius:14, padding:'18px 20px', marginBottom:16, border:'1.5px solid #e8ecf0', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
              <h3 style={{ fontSize:14, fontWeight:700, color:'#1a202c', margin:'0 0 14px', display:'flex', alignItems:'center', gap:6 }}>
                🕐 Tài liệu mới nhất
              </h3>
              {data.recentFiles.map((f,i) => (
                <div key={i} style={{ display:'flex', gap:10, alignItems:'flex-start', padding:'8px 0', borderBottom: i<data.recentFiles.length-1?'1px solid #f0f4f8':'none', cursor:'pointer' }}>
                  <div style={{ width:6, height:6, borderRadius:'50%', background: FILE_COLORS[f.type]||'#888', flexShrink:0, marginTop:5 }} />
                  <div>
                    <p style={{ fontSize:12, fontWeight:600, color:'#1a202c', margin:'0 0 2px', lineHeight:1.3 }}>{f.name}</p>
                    <p style={{ fontSize:11, color:'#aaa', margin:0 }}>{f.time}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Notifications */}
            <div style={{ background:'#fff', borderRadius:14, padding:'18px 20px', marginBottom:16, border:'1.5px solid #e8ecf0', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
              <h3 style={{ fontSize:14, fontWeight:700, color:'#1a202c', margin:'0 0 14px', display:'flex', alignItems:'center', gap:6 }}>
                📢 Thông báo lớp
              </h3>
              {data.notifications.map((n,i) => (
                <div key={i} style={{
                  background: notifBg[n.type], borderRadius:8, padding:'10px 12px',
                  marginBottom:8, borderLeft:`3px solid ${notifStyle[n.type]}`,
                }}>
                  <p style={{ fontSize:12, color:'#333', margin:'0 0 4px', lineHeight:1.4 }}>{n.text}</p>
                  <p style={{ fontSize:11, color:'#aaa', margin:0 }}>{n.time}</p>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div style={{ background:'#fff', borderRadius:14, padding:'18px 20px', border:'1.5px solid #e8ecf0', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
              <h3 style={{ fontSize:14, fontWeight:700, color:'#1a202c', margin:'0 0 14px', display:'flex', alignItems:'center', gap:6 }}>
                📊 Thống kê khóa học
              </h3>
              {[
                { label:'Tổng tài liệu',  value: data.stats.total,      color:'#1a202c' },
                { label:'Đã tải về',      value: `${data.stats.downloaded} files`, color:'#3b82f6' },
                { label:'Còn lại',        value: `${data.stats.remaining} files`,  color:'#f59e0b' },
              ].map((s,i) => (
                <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom: i<2?'1px solid #f0f4f8':'none' }}>
                  <span style={{ fontSize:13, color:'#555' }}>{s.label}</span>
                  <span style={{ fontSize:14, fontWeight:700, color:s.color }}>{s.value}</span>
                </div>
              ))}

              {/* Progress bar */}
              <div style={{ marginTop:14 }}>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'#888', marginBottom:6 }}>
                  <span>Tiến độ tải tài liệu</span>
                  <span>{Math.round(data.stats.downloaded/data.stats.total*100)}%</span>
                </div>
                <div style={{ height:8, background:'#e5e7eb', borderRadius:4, overflow:'hidden' }}>
                  <div style={{ height:'100%', width:`${data.stats.downloaded/data.stats.total*100}%`, background:'linear-gradient(90deg,#1a3a8f,#1a7a4a)', borderRadius:4, transition:'width 0.6s' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
