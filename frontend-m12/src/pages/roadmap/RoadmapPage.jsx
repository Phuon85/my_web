import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import { Spinner } from '../../components/ui';
import { roadmapAPI, documentAPI } from '../../api/axios';

const FILE_COLORS = { PDF:'#e53e3e', DOCX:'#3b82f6', PPTX:'#f97316', MP4:'#8b5cf6', ZIP:'#6b7280' };
const FILE_ICONS  = { PDF:'📄', DOCX:'📝', PPTX:'📊', MP4:'🎬', ZIP:'📦' };

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

export default function RoadmapPage() {
  const navigate = useNavigate();
  const [roadmaps,  setRoadmaps]  = useState([]);
  const [selected,  setSelected]  = useState(null);   // roadmap đang xem
  const [chapters,  setChapters]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [chapLoad,  setChapLoad]  = useState(false);
  const [error,     setError]     = useState('');

  // ── Fetch danh sách roadmap ───────────────────────────────────────────────
  useEffect(() => {
    setLoading(true);
    roadmapAPI.getAll()
      .then(r => {
        const list = Array.isArray(r.data) ? r.data : (r.data?.content || []);
        setRoadmaps(list);
        if (list.length > 0) setSelected(list[0]);
      })
      .catch(() => setError('Không thể tải lộ trình. Vui lòng thử lại.'))
      .finally(() => setLoading(false));
  }, []);

  // ── Fetch chapters khi chọn roadmap ──────────────────────────────────────
  useEffect(() => {
    if (!selected) return;
    setChapLoad(true);
    roadmapAPI.getById(selected.id)
      .then(r => {
        const data = r.data;
        const chapList = (data.chapters || []).map(c => ({ ...c, expanded: false }));
        setChapters(chapList);
      })
      .catch(() => setChapters([]))
      .finally(() => setChapLoad(false));
  }, [selected?.id]);

  const toggleChapter = (id) => {
    setChapters(prev => prev.map(c => c.id === id ? { ...c, expanded: !c.expanded } : c));
  };

  if (loading) return (
    <div style={{ minHeight:'100vh', background:'#f5f6fa', fontFamily:"'Be Vietnam Pro',sans-serif" }}>
      <Navbar />
      <div style={{ display:'flex', justifyContent:'center', alignItems:'center', padding:80 }}>
        <Spinner />
      </div>
    </div>
  );

  if (error) return (
    <div style={{ minHeight:'100vh', background:'#f5f6fa', fontFamily:"'Be Vietnam Pro',sans-serif" }}>
      <Navbar />
      <div style={{ maxWidth:600, margin:'80px auto', textAlign:'center', padding:24 }}>
        <div style={{ fontSize:48, marginBottom:12 }}>⚠️</div>
        <p style={{ color:'#e53e3e', fontSize:15, fontWeight:600 }}>{error}</p>
        <button onClick={() => window.location.reload()}
          style={{ marginTop:16, padding:'10px 24px', background:'#1a3a8f', color:'#fff', border:'none', borderRadius:8, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
          Thử lại
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:'100vh', background:'#f5f6fa', fontFamily:"'Be Vietnam Pro',sans-serif" }}>
      <Navbar />

      <div style={{ maxWidth:1100, margin:'0 auto', padding:'28px 24px' }}>

        {/* ── Roadmap selector ── */}
        {roadmaps.length > 1 && (
          <div style={{ display:'flex', gap:10, marginBottom:24, flexWrap:'wrap' }}>
            {roadmaps.map(rm => (
              <button key={rm.id} onClick={() => setSelected(rm)}
                style={{
                  padding:'8px 18px', borderRadius:20,
                  border: selected?.id === rm.id ? 'none' : '1.5px solid #e0e0e0',
                  background: selected?.id === rm.id ? 'linear-gradient(90deg,#1a3a8f,#1a7a4a)' : '#fff',
                  color: selected?.id === rm.id ? '#fff' : '#555',
                  fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit',
                  transition:'all 0.15s',
                }}>
                🎓 {rm.title}
              </button>
            ))}
          </div>
        )}

        {/* Title */}
        <h1 style={{ fontSize:22, fontWeight:800, color:'#1a202c', margin:'0 0 24px', display:'flex', alignItems:'center', gap:10 }}>
          🎓 {selected?.title || 'Lộ trình học tập'}
        </h1>

        {selected?.description && (
          <p style={{ color:'#666', fontSize:14, margin:'0 0 24px', lineHeight:1.6 }}>{selected.description}</p>
        )}

        <div style={{ display:'grid', gridTemplateColumns:'1fr 260px', gap:24 }}>
          {/* ── LEFT: Chapters ── */}
          <div>
            {chapLoad ? (
              <div style={{ display:'flex', justifyContent:'center', padding:40 }}><Spinner /></div>
            ) : chapters.length === 0 ? (
              <div style={{ background:'#fff', borderRadius:14, padding:'40px 24px', textAlign:'center', border:'1.5px solid #e8ecf0' }}>
                <div style={{ fontSize:48, marginBottom:12 }}>📚</div>
                <p style={{ color:'#aaa', fontSize:14 }}>Lộ trình này chưa có chương học nào.</p>
              </div>
            ) : chapters.map(chapter => (
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
                    <span style={{
                      background: chapter.expanded ? 'rgba(255,255,255,0.2)' : '#f0fdf4',
                      color: chapter.expanded ? '#fff' : '#166534',
                      fontSize:12, fontWeight:700, padding:'3px 10px', borderRadius:16,
                    }}>
                      {(chapter.files || []).length} tài liệu
                    </span>
                  </div>
                </button>

                {/* Chapter content */}
                {chapter.expanded && (
                  <div style={{ padding:'0 20px 20px' }}>
                    {chapter.note && (
                      <div style={{ background:'#fffbeb', border:'1.5px solid #fde68a', borderRadius:10, padding:'12px 16px', margin:'16px 0', borderLeft:'4px solid #f59e0b' }}>
                        <p style={{ fontSize:13, color:'#92400e', lineHeight:1.6, margin:0, whiteSpace:'pre-line' }}>{chapter.note}</p>
                      </div>
                    )}

                    {(chapter.files || []).map(file => (
                      <div key={file.id}
                        style={{ display:'flex', alignItems:'center', gap:14, padding:'13px 0', borderBottom:'1px solid #f0f4f8' }}>
                        <div style={{
                          width:40, height:40, borderRadius:8, flexShrink:0,
                          background: FILE_COLORS[file.fileType || file.type] || '#888',
                          display:'flex', alignItems:'center', justifyContent:'center', fontSize:18,
                        }}>
                          {FILE_ICONS[file.fileType || file.type] || '📄'}
                        </div>

                        <div style={{ flex:1, minWidth:0 }}>
                          <p style={{ fontWeight:600, fontSize:14, color:'#1a202c', margin:'0 0 2px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                            {file.title || file.name}
                          </p>
                          <p style={{ fontSize:12, color:'#aaa', margin:0 }}>
                            {file.fileType || file.type}
                            {file.fileSize ? ` • ${(file.fileSize/1024/1024).toFixed(1)} MB` : ''}
                          </p>
                        </div>

                        <div style={{ display:'flex', gap:8, flexShrink:0 }}>
                          <a
                            href={`${BASE_URL}/documents/${file.documentId || file.id}/download`}
                            download
                            onClick={e => e.stopPropagation()}
                            style={{
                              padding:'7px 16px', border:'none',
                              borderRadius:8, background:'linear-gradient(90deg,#1a7a4a,#1d8a55)', color:'#fff',
                              fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit',
                              display:'flex', alignItems:'center', gap:4, textDecoration:'none',
                            }}>
                            ⬇ Tải xuống
                          </a>
                        </div>
                      </div>
                    ))}

                    {(chapter.files || []).length === 0 && (
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
            {/* Thống kê */}
            <div style={{ background:'#fff', borderRadius:14, padding:'18px 20px', marginBottom:16, border:'1.5px solid #e8ecf0', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
              <h3 style={{ fontSize:14, fontWeight:700, color:'#1a202c', margin:'0 0 14px', display:'flex', alignItems:'center', gap:6 }}>
                📊 Tổng quan lộ trình
              </h3>
              {[
                { label:'Số chương',   value: chapters.length,                         color:'#1a202c' },
                { label:'Tổng tài liệu', value: chapters.reduce((s,c) => s+(c.files||[]).length, 0), color:'#3b82f6' },
              ].map((s,i) => (
                <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom: i<1?'1px solid #f0f4f8':'none' }}>
                  <span style={{ fontSize:13, color:'#555' }}>{s.label}</span>
                  <span style={{ fontSize:16, fontWeight:700, color:s.color }}>{s.value}</span>
                </div>
              ))}
            </div>

            {/* Tất cả lộ trình */}
            {roadmaps.length > 0 && (
              <div style={{ background:'#fff', borderRadius:14, padding:'18px 20px', border:'1.5px solid #e8ecf0', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
                <h3 style={{ fontSize:14, fontWeight:700, color:'#1a202c', margin:'0 0 14px' }}>📚 Tất cả lộ trình</h3>
                {roadmaps.map((rm, i) => (
                  <button key={rm.id} onClick={() => setSelected(rm)}
                    style={{
                      display:'flex', alignItems:'center', gap:10, width:'100%',
                      padding:'10px 0', borderBottom: i<roadmaps.length-1?'1px solid #f0f4f8':'none',
                      background:'none', border:'none', cursor:'pointer', fontFamily:'inherit', textAlign:'left',
                    }}>
                    <div style={{ width:8, height:8, borderRadius:'50%', background: selected?.id===rm.id?'#1a7a4a':'#d1d5db', flexShrink:0 }} />
                    <span style={{ fontSize:13, fontWeight: selected?.id===rm.id?700:400, color: selected?.id===rm.id?'#1a7a4a':'#555' }}>
                      {rm.title}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
