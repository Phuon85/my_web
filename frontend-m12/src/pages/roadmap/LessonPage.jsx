import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import { useAuth } from '../../context/AuthContext';
import { roadmapAPI } from '../../api/axios'; // Nhớ import

// Dữ liệu Mock
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
];

export default function LessonPage() {
  const { chapterId, lessonId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [openChapters, setOpenChapters] = useState({ 1: true, 2: true });
  const [lesson, setLesson] = useState(null); // Load dữ liệu thật vào đây sau

  // Tạm dùng mock để hiển thị
  const mockLessonData = {
    id: lessonId,
    title: 'Bài giảng Lộ trình',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Link test Youtube
    slideUrl: '',
    exercises: []
  };

  useEffect(() => {
    // Tạm gán mock data. Sau này bạn gọi roadmapAPI ở đây để lấy data file.
    setLesson(mockLessonData);
  }, [lessonId]);

  const toggleChapter = id => setOpenChapters(p => ({ ...p, [id]: !p[id] }));

  if (!lesson) return null;

  return (
    <div style={{ minHeight:'100vh', background:'#f5f6fa', fontFamily:"'Be Vietnam Pro',sans-serif" }}>
      <Navbar />

      <div style={{ display:'grid', gridTemplateColumns:'260px 1fr', maxWidth:1100, margin:'0 auto', padding:'24px 24px', gap:24, alignItems:'flex-start' }}>

        {/* LEFT: Table of Contents */}
        <div style={{ background:'#fff', borderRadius:14, border:'1.5px solid #e8ecf0', overflow:'hidden', boxShadow:'0 1px 4px rgba(0,0,0,0.06)', position:'sticky', top:90 }}>
          <div style={{ padding:'16px 20px', borderBottom:'1.5px solid #e8ecf0' }}>
            <h3 style={{ fontSize:14, fontWeight:700, color:'#1a202c', margin:0 }}>Mục lục chương trình</h3>
          </div>

          <div style={{ padding:'8px 0' }}>
            {MOCK_CHAPTERS.map(chapter => (
              <div key={chapter.id}>
                <button onClick={() => !chapter.locked && toggleChapter(chapter.id)} style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'11px 16px', background: !chapter.locked && openChapters[chapter.id] ? '#f0fdf4' : 'transparent', border:'none', cursor: chapter.locked ? 'not-allowed' : 'pointer', fontFamily:'inherit' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    {chapter.locked ? <span style={{ fontSize:14, color:'#ccc' }}>🔒</span> : chapter.done ? <span style={{ width:18, height:18, borderRadius:'50%', background:'#10b981', display:'inline-flex', alignItems:'center', justifyContent:'center', fontSize:10, color:'#fff' }}>✓</span> : <span style={{ width:18, height:18, borderRadius:'50%', border:'2px solid #e0e0e0', display:'inline-block' }} />}
                    <span style={{ fontSize:13, fontWeight:600, color: chapter.locked ? '#ccc' : '#1a202c' }}>{chapter.title}</span>
                  </div>
                  {!chapter.locked && <span style={{ color:'#aaa', fontSize:12 }}>{openChapters[chapter.id] ? '▾' : '▸'}</span>}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: Lesson content */}
        <div>
          <div style={{ marginBottom:16 }}>
            <span style={{ color:'#888', fontSize:13, cursor:'pointer' }} onClick={() => navigate('/roadmap')}>Quay lại lộ trình</span>
          </div>

          <h1 style={{ fontSize:24, fontWeight:800, color:'#1a202c', margin:'0 0 24px' }}>{lesson.title}</h1>

          {/* Video section */}
          <div style={{ marginBottom:28 }}>
            <h2 style={{ fontSize:16, fontWeight:700, color:'#1a202c', margin:'0 0 14px', display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ color:'#10b981', fontSize:18 }}>▶</span> Video Bài giảng
            </h2>

            {/* SỬ DỤNG IFRAME CHO YOUTUBE */}
            <div style={{ background:'#111', borderRadius:12, overflow:'hidden', aspectRatio:'16/9', position:'relative', boxShadow:'0 4px 20px rgba(0,0,0,0.2)' }}>
              {lesson.videoUrl ? (
                <iframe 
                  width="100%" 
                  height="100%" 
                  src={lesson.videoUrl.replace("watch?v=", "embed/")} 
                  title="Video Player" 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                />
              ) : (
                <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'#1a1a2e' }}>
                  <div style={{ width:70, height:70, borderRadius:'50%', background:'rgba(255,255,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:12, border:'2px solid rgba(255,255,255,0.3)' }}>
                    <span style={{ fontSize:28, color:'#fff', marginLeft:4 }}>▶</span>
                  </div>
                  <p style={{ color:'rgba(255,255,255,0.75)', fontSize:14, margin:0 }}>Bài giảng chưa có video</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}