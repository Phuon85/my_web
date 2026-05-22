import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import { useAuth } from '../../context/AuthContext';

// ── Mock data ──────────────────────────────────────────────────────────────
const MOCK_LESSON = {
  id: 2,
  title: 'Đạo hàm & Vi phân',
  chapterTitle: 'Chương 2: Giải tích',
  videoUrl: '',   // thay bằng URL video thật
  videoDuration: '45:00',
  slideUrl: '/api/documents/slide-chuong-2/download',
  exercises: [
    {
      id: 1, title: 'Trắc nghiệm nhanh (10 câu)',
      desc: 'Kiểm tra hiểu biết cơ bản về đạo hàm và vi phân',
      time: '15 phút', score: '10/10', status: 'done', statusLabel: 'Đã hoàn thành',
    },
    {
      id: 2, title: 'Bài Tập Tự luận nộp chấm',
      desc: 'Giải các bài tập tự luận về đạo hàm và ứng dụng',
      time: '90 phút', score: null, status: 'todo', statusLabel: 'CHƯA LÀM',
    },
  ],
};

const MOCK_CHAPTERS = [
  {
    id: 1, title: 'Chương 1: Đại số', done: true,
    lessons: [{ id: 1, title: 'Giới hạn dãy số', done: true }],
  },
  {
    id: 2, title: 'Chương 2: Giải tích', done: false,
    lessons: [
      { id: 1, title: 'Giới hạn dãy số', done: true },
      { id: 2, title: 'Đạo hàm & Vi phân', done: false, active: true },
    ],
  },
  {
    id: 3, title: 'Chương 3: Hình học', done: false, locked: true,
    lessons: [],
  },
];

export default function LessonPage() {
  const { chapterId, lessonId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [openChapters, setOpenChapters] = useState({ 1: true, 2: true, 3: false });
  const [videoError, setVideoError] = useState(false);
  const lesson = MOCK_LESSON;

  const toggleChapter = id => setOpenChapters(p => ({ ...p, [id]: !p[id] }));

  return (
    <div style={{ minHeight:'100vh', background:'#f5f6fa', fontFamily:"'Be Vietnam Pro',sans-serif" }}>
      <Navbar />

      <div style={{ display:'grid', gridTemplateColumns:'260px 1fr', maxWidth:1100, margin:'0 auto', padding:'24px 24px', gap:24, alignItems:'flex-start' }}>

        {/* ── LEFT: Table of Contents ── */}
        <div style={{ background:'#fff', borderRadius:14, border:'1.5px solid #e8ecf0', overflow:'hidden', boxShadow:'0 1px 4px rgba(0,0,0,0.06)', position:'sticky', top:90 }}>
          <div style={{ padding:'16px 20px', borderBottom:'1.5px solid #e8ecf0' }}>
            <h3 style={{ fontSize:14, fontWeight:700, color:'#1a202c', margin:0 }}>Mục lục chương trình</h3>
          </div>

          <div style={{ padding:'8px 0' }}>
            {MOCK_CHAPTERS.map(chapter => (
              <div key={chapter.id}>
                {/* Chapter row */}
                <button
                  onClick={() => !chapter.locked && toggleChapter(chapter.id)}
                  style={{
                    width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between',
                    padding:'11px 16px', background: !chapter.locked && openChapters[chapter.id] ? '#f0fdf4' : 'transparent',
                    border:'none', cursor: chapter.locked ? 'not-allowed' : 'pointer', fontFamily:'inherit',
                  }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    {chapter.locked ? (
                      <span style={{ fontSize:14, color:'#ccc' }}>🔒</span>
                    ) : chapter.done ? (
                      <span style={{ width:18, height:18, borderRadius:'50%', background:'#10b981', display:'inline-flex', alignItems:'center', justifyContent:'center', fontSize:10, color:'#fff' }}>✓</span>
                    ) : (
                      <span style={{ width:18, height:18, borderRadius:'50%', border:'2px solid #e0e0e0', display:'inline-block' }} />
                    )}
                    <span style={{ fontSize:13, fontWeight:600, color: chapter.locked ? '#ccc' : '#1a202c' }}>{chapter.title}</span>
                  </div>
                  {!chapter.locked && (
                    <span style={{ color:'#aaa', fontSize:12 }}>{openChapters[chapter.id] ? '▾' : '▸'}</span>
                  )}
                </button>

                {/* Lessons */}
                {!chapter.locked && openChapters[chapter.id] && chapter.lessons.map(les => (
                  <button key={les.id}
                    onClick={() => navigate(`/roadmap/chapter/${chapter.id}/lesson/${les.id}`)}
                    style={{
                      width:'100%', display:'flex', alignItems:'center', gap:10,
                      padding:'9px 16px 9px 40px',
                      background: les.active ? '#e0f2fe' : 'transparent',
                      border:'none', cursor:'pointer', fontFamily:'inherit',
                      borderLeft: les.active ? '3px solid #0369a1' : '3px solid transparent',
                    }}>
                    {les.done ? (
                      <span style={{ width:14, height:14, borderRadius:'50%', background:'#10b981', display:'inline-flex', alignItems:'center', justifyContent:'center', fontSize:9, color:'#fff', flexShrink:0 }}>✓</span>
                    ) : les.active ? (
                      <span style={{ width:14, height:14, borderRadius:'50%', background:'#0369a1', display:'inline-block', flexShrink:0 }} />
                    ) : (
                      <span style={{ width:14, height:14, borderRadius:'50%', border:'1.5px solid #ccc', display:'inline-block', flexShrink:0 }} />
                    )}
                    <span style={{ fontSize:13, color: les.active ? '#0369a1' : '#555', fontWeight: les.active ? 600 : 400, textAlign:'left' }}>{les.title}</span>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT: Lesson content ── */}
        <div>
          {/* Breadcrumb */}
          <div style={{ marginBottom:16 }}>
            <span style={{ color:'#888', fontSize:13, cursor:'pointer' }} onClick={() => navigate('/roadmap')}>Giải tích</span>
            <span style={{ color:'#888', fontSize:13 }}> › Bài 2</span>
          </div>

          <h1 style={{ fontSize:24, fontWeight:800, color:'#1a202c', margin:'0 0 24px' }}>
            {lesson.title}
          </h1>

          {/* ── Video section ── */}
          <div style={{ marginBottom:28 }}>
            <h2 style={{ fontSize:16, fontWeight:700, color:'#1a202c', margin:'0 0 14px', display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ color:'#10b981', fontSize:18 }}>▶</span> Lý thuyết
            </h2>

            {/* Video player */}
            <div style={{
              background:'#111', borderRadius:12, overflow:'hidden',
              aspectRatio:'16/9', position:'relative',
              boxShadow:'0 4px 20px rgba(0,0,0,0.2)',
            }}>
              {lesson.videoUrl ? (
                <video
                  controls style={{ width:'100%', height:'100%', objectFit:'cover' }}
                  onError={() => setVideoError(true)}>
                  <source src={lesson.videoUrl} type="video/mp4" />
                </video>
              ) : (
                // Placeholder khi chưa có video
                <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'#1a1a2e' }}>
                  <div style={{ width:70, height:70, borderRadius:'50%', background:'rgba(255,255,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', marginBottom:12, border:'2px solid rgba(255,255,255,0.3)' }}>
                    <span style={{ fontSize:28, color:'#fff', marginLeft:4 }}>▶</span>
                  </div>
                  <p style={{ color:'rgba(255,255,255,0.75)', fontSize:14, margin:0 }}>Bài giảng lý thuyết ({lesson.videoDuration} mins)</p>
                  <p style={{ color:'rgba(255,255,255,0.4)', fontSize:12, margin:'6px 0 0' }}>0:00 / {lesson.videoDuration}</p>
                </div>
              )}
            </div>

            {/* Slide download */}
            <a href={lesson.slideUrl}
              style={{
                display:'inline-flex', alignItems:'center', gap:8,
                color:'#1a3a8f', fontSize:13, fontWeight:600, marginTop:12,
                textDecoration:'none', padding:'6px 14px',
                border:'1.5px solid #e0e0e0', borderRadius:8, background:'#fff',
              }}>
              ⬇ Tải Slide bài giảng (PDF)
            </a>
          </div>

          {/* ── Practice section ── */}
          <div>
            <h2 style={{ fontSize:16, fontWeight:700, color:'#1a202c', margin:'0 0 14px', display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ fontSize:18 }}>↔</span> Thực hành
            </h2>

            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {lesson.exercises.map(ex => (
                <div key={ex.id}
                  style={{
                    background:'#fff', borderRadius:12, padding:'18px 22px',
                    border:'1.5px solid #e8ecf0', boxShadow:'0 1px 4px rgba(0,0,0,0.06)',
                    display:'flex', alignItems:'center', gap:16,
                  }}>
                  <div style={{ flex:1 }}>
                    <p style={{ fontWeight:700, fontSize:15, color:'#1a202c', margin:'0 0 4px' }}>{ex.title}</p>
                    <p style={{ color:'#888', fontSize:13, margin:'0 0 8px' }}>{ex.desc}</p>
                    <div style={{ display:'flex', gap:16, alignItems:'center' }}>
                      <span style={{ fontSize:13, color:'#555' }}>⏱ Thời gian: {ex.time}</span>
                      {ex.score && (
                        <span style={{ fontSize:13, color:'#10b981', fontWeight:600 }}>✅ Điểm: {ex.score}</span>
                      )}
                      {!ex.score && (
                        <span style={{ fontSize:12, color:'#f59e0b', fontWeight:700 }}>⏳ {ex.statusLabel}</span>
                      )}
                    </div>
                  </div>

                  {ex.status === 'done' ? (
                    <span style={{
                      background:'#e0f9f0', color:'#10b981',
                      fontSize:12, fontWeight:700, padding:'6px 14px', borderRadius:20,
                      whiteSpace:'nowrap',
                    }}>
                      {ex.statusLabel}
                    </span>
                  ) : (
                    <button
                      onClick={() => navigate(`/contests/${ex.id}/exam`)}
                      style={{
                        padding:'10px 22px', background:'#f59e0b',
                        border:'none', borderRadius:8, color:'#fff',
                        fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'inherit',
                        whiteSpace:'nowrap', flexShrink:0,
                        boxShadow:'0 4px 12px rgba(245,158,11,0.35)',
                      }}>
                      Bắt đầu làm bài
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Navigation between lessons */}
          <div style={{ display:'flex', justifyContent:'space-between', marginTop:32, paddingTop:24, borderTop:'1.5px solid #e8ecf0' }}>
            <button
              onClick={() => navigate(-1)}
              style={{ padding:'10px 20px', border:'1.5px solid #e0e0e0', borderRadius:8, background:'#fff', fontSize:14, cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', gap:8 }}>
              ← Bài trước
            </button>
            <button
              onClick={() => navigate(1)}
              style={{ padding:'10px 20px', background:'linear-gradient(90deg,#1a3a8f,#1a7a4a)', border:'none', borderRadius:8, color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', gap:8 }}>
              Bài tiếp theo →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
