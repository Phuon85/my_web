import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import { Spinner } from '../../components/ui';
import { roadmapAPI } from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const FILE_COLORS = { PDF:'#e53e3e', DOCX:'#3b82f6', PPTX:'#f97316', MP4:'#8b5cf6', ZIP:'#6b7280', VIDEO:'#f59e0b' };
const FILE_ICONS  = { PDF:'📄', DOCX:'📝', PPTX:'📊', MP4:'🎬', ZIP:'📦', VIDEO:'▶' };

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

export default function RoadmapPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canManage = ['TEACHER','MANAGER','ADMIN'].includes(user?.role);

  const [roadmaps,  setRoadmaps]  = useState([]);
  const [selected,  setSelected]  = useState(null);
  const [chapters,  setChapters]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [chapLoad,  setChapLoad]  = useState(false);
  const [error,     setError]     = useState('');

  // ── STATES CHO CÁC MODAL QUẢN LÝ ──
  // Sửa từ showCreateRoadmap thành roadmapModalMode: null (đóng), 'create' (tạo), 'edit' (sửa)
  const [roadmapModalMode, setRoadmapModalMode] = useState(null); 
  const [roadmapForm, setRoadmapForm] = useState({ title: '', description: '', subject: 'Toán học' });

  const [showAddChapter, setShowAddChapter] = useState(false);
  const [chapterForm, setChapterForm] = useState({ title: '', teacherNote: '' });

  const [showAddFile, setShowAddFile] = useState(null);
  const [fileForm, setFileForm] = useState({ itemType: 'VIDEO_LINK', title: '', externalUrl: '', documentId: '' });

  // ── FETCH DATA ──
  const fetchRoadmaps = (selectId = null) => {
    setLoading(true);
    roadmapAPI.getAll()
      .then(r => {
        const list = Array.isArray(r.data) ? r.data : (r.data?.content || []);
        setRoadmaps(list);
        if (list.length > 0) {
          // Nếu có truyền selectId (vừa update xong) thì chọn nó, ngược lại chọn phần tử đầu tiên
          const toSelect = selectId ? list.find(item => item.id === selectId) : list[0];
          setSelected(toSelect || list[0]);
        } else {
          setSelected(null);
        }
      })
      .catch(() => setError('Không thể tải lộ trình. Vui lòng thử lại.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchRoadmaps(); }, []);

  const fetchChapters = () => {
    if (!selected) return;
    setChapLoad(true);
    roadmapAPI.getById(selected.id)
      .then(r => {
        const chapList = (r.data.chapters || []).map(c => ({ ...c, expanded: true }));
        setChapters(chapList);
      })
      .catch(() => setChapters([]))
      .finally(() => setChapLoad(false));
  };

  useEffect(() => { fetchChapters(); }, [selected?.id]);

  const toggleChapter = (id) => {
    setChapters(prev => prev.map(c => c.id === id ? { ...c, expanded: !c.expanded } : c));
  };

  // ── CÁC HÀM XỬ LÝ LƯU (DÀNH CHO GIẢNG VIÊN) ──
  // Hàm gộp chung xử lý Tạo mới & Cập nhật Lộ trình
  const handleSaveRoadmap = async () => {
    if (!roadmapForm.title) return alert("Vui lòng nhập tên lộ trình!");
    try {
      if (roadmapModalMode === 'create') {
        await roadmapAPI.create(roadmapForm);
        alert("Tạo lộ trình thành công!");
        fetchRoadmaps(); 
      } else if (roadmapModalMode === 'edit') {
        // Giả sử API update của bạn là roadmapAPI.update(id, data)
        await roadmapAPI.update(selected.id, roadmapForm);
        alert("Cập nhật lộ trình thành công!");
        fetchRoadmaps(selected.id); // Tải lại danh sách và giữ nguyên lộ trình đang sửa
      }
      setRoadmapModalMode(null);
      setRoadmapForm({ title: '', description: '', subject: 'Toán học' });
    } catch (e) { 
      alert(roadmapModalMode === 'create' ? "Lỗi khi tạo lộ trình" : "Lỗi khi cập nhật lộ trình"); 
    }
  };

  // Hàm xử lý Xóa Lộ trình (Đã bổ sung hoàn chỉnh)
  const handleDeleteRoadmap = async () => {
    if (!selected) return;
    if (!window.confirm(`Bạn có chắc chắn muốn xóa lộ trình "${selected.title}" không? Hành động này không thể hoàn tác!`)) return;
    
    try {
      // Giả sử API delete của bạn là roadmapAPI.delete(id)
      await roadmapAPI.delete(selected.id);
      alert("Xóa lộ trình thành công!");
      fetchRoadmaps(); // Tải lại danh sách sau khi xóa
    } catch (e) {
      alert("Lỗi khi xóa lộ trình hoặc phương thức xóa chưa được hỗ trợ từ API.");
    }
  };

  const handleAddChapter = async () => {
    if (!chapterForm.title) return alert("Vui lòng nhập tên chương!");
    try {
      await roadmapAPI.addChapter(selected.id, chapterForm);
      setShowAddChapter(false);
      setChapterForm({ title: '', teacherNote: '' });
      fetchChapters(); 
    } catch (e) { alert("Lỗi khi tạo chương"); }
  };

  const handleSaveFile = async () => {
    if (!fileForm.title) return alert("Vui lòng nhập tiêu đề bài giảng!");
    try {
      await roadmapAPI.addFile(showAddFile, fileForm);
      setShowAddFile(null);
      setFileForm({ itemType: 'VIDEO_LINK', title: '', externalUrl: '', documentId: '' });
      fetchChapters(); 
    } catch (e) { alert("Lỗi khi thêm bài giảng"); }
  };

  // ── RENDER ──
  if (loading) return (
    <div style={{ minHeight:'100vh', background:'#f5f6fa', fontFamily:"'Be Vietnam Pro',sans-serif" }}>
      <Navbar />
      <div style={{ display:'flex', justifyContent:'center', alignItems:'center', padding:80 }}><Spinner /></div>
    </div>
  );

  if (error) return (
    <div style={{ minHeight:'100vh', background:'#f5f6fa', fontFamily:"'Be Vietnam Pro',sans-serif" }}>
      <Navbar />
      <div style={{ maxWidth:600, margin:'80px auto', textAlign:'center', padding:24 }}>
        <div style={{ fontSize:48, marginBottom:12 }}>⚠️</div>
        <p style={{ color:'#e53e3e', fontSize:15, fontWeight:600 }}>{error}</p>
        <button onClick={() => window.location.reload()} style={{ marginTop:16, padding:'10px 24px', background:'#1a3a8f', color:'#fff', border:'none', borderRadius:8, fontWeight:700, cursor:'pointer' }}>Thử lại</button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:'100vh', background:'#f5f6fa', fontFamily:"'Be Vietnam Pro',sans-serif" }}>
      <Navbar />

      <div style={{ maxWidth:1100, margin:'0 auto', padding:'28px 24px' }}>

        {roadmaps.length > 1 && (
          <div style={{ display:'flex', gap:10, marginBottom:24, flexWrap:'wrap' }}>
            {roadmaps.map(rm => (
              <button key={rm.id} onClick={() => setSelected(rm)}
                style={{
                  padding:'8px 18px', borderRadius:20,
                  border: selected?.id === rm.id ? 'none' : '1.5px solid #e0e0e0',
                  background: selected?.id === rm.id ? 'linear-gradient(90deg,#1a3a8f,#1a7a4a)' : '#fff',
                  color: selected?.id === rm.id ? '#fff' : '#555',
                  fontSize:13, fontWeight:700, cursor:'pointer', transition:'all 0.15s',
                }}>
                🎓 {rm.title}
              </button>
            ))}
          </div>
        )}

        {/* Tiêu đề & Sửa/Xóa Lộ trình */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1a202c', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            🎓 {selected?.title || 'Lộ trình học tập'}
            
            {/* NÚT CHỈNH SỬA / XÓA LỘ TRÌNH - HIỆN KHI LÀ QUẢN LÝ */}
            {canManage && selected && (
              <div style={{ display: 'flex', gap: 8, marginLeft: 10 }}>
                <button 
                  onClick={() => { 
                    setRoadmapForm({ title: selected.title, description: selected.description || '', subject: selected.subject || 'Toán học' }); 
                    setRoadmapModalMode('edit'); // Sửa thành setRoadmapModalMode
                  }} 
                  title="Sửa lộ trình" 
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}
                >✏️</button>
                <button 
                  onClick={handleDeleteRoadmap} 
                  title="Xóa lộ trình" 
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}
                >🗑️</button>
              </div>
            )}
          </h1>
          
          {canManage && (
            <div style={{ display: 'flex', gap: 10 }}>
              {selected && (
                <button onClick={() => setShowAddChapter(true)}
                  style={{ padding:'8px 16px', background:'#e8f0fe', color:'#1a3a8f', border:'1px solid #bfdbfe', borderRadius:8, fontWeight:700, cursor:'pointer' }}>
                  + Thêm Chương
                </button>
              )}
              <button onClick={() => setRoadmapModalMode('create')}
                style={{ padding:'8px 16px', background:'linear-gradient(90deg,#1a3a8f,#1a7a4a)', color:'#fff', border:'none', borderRadius:8, fontWeight:700, cursor:'pointer' }}>
                + Tạo Lộ trình
              </button>
            </div>
          )}
        </div>

        {selected?.description && (
          <p style={{ color:'#666', fontSize:14, margin:'0 0 24px', lineHeight:1.6 }}>{selected.description}</p>
        )}

        <div style={{ display:'grid', gridTemplateColumns:'1fr 260px', gap:24 }}>
          {/* LEFT: Chapters */}
          <div>
            {chapLoad ? (
              <div style={{ display:'flex', justifyContent:'center', padding:40 }}><Spinner /></div>
            ) : chapters.length === 0 ? (
              <div style={{ background:'#fff', borderRadius:14, padding:'40px 24px', textAlign:'center', border:'1.5px solid #e8ecf0' }}>
                <div style={{ fontSize:48, marginBottom:12 }}>📚</div>
                <p style={{ color:'#aaa', fontSize:14 }}>Lộ trình này chưa có chương học nào.</p>
              </div>
            ) : chapters.map(chapter => (
              <div key={chapter.id} style={{ background:'#fff', borderRadius:14, marginBottom:12, border:'1.5px solid #e8ecf0', overflow:'hidden', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>

                <button onClick={() => toggleChapter(chapter.id)}
                  style={{
                    width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between',
                    padding:'16px 20px', background: chapter.expanded ? 'linear-gradient(90deg,#1a7a4a,#1d8a55)' : '#fff',
                    border:'none', cursor:'pointer', fontFamily:'inherit',
                  }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <span style={{ fontSize:16, color: chapter.expanded ? '#fff' : '#1a202c' }}>{chapter.expanded ? '▼' : '▶'}</span>
                    <span style={{ fontWeight:700, fontSize:15, color: chapter.expanded ? '#fff' : '#1a202c' }}>{chapter.title}</span>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                    <span style={{ background: chapter.expanded ? 'rgba(255,255,255,0.2)' : '#f0fdf4', color: chapter.expanded ? '#fff' : '#166534', fontSize:12, fontWeight:700, padding:'3px 10px', borderRadius:16 }}>
                      {(chapter.files || []).length} bài giảng
                    </span>
                  </div>
                </button>

                {chapter.expanded && (
                  <div style={{ padding:'0 20px 20px' }}>
                    {chapter.teacherNote && (
                      <div style={{ background:'#fffbeb', border:'1.5px solid #fde68a', borderRadius:10, padding:'12px 16px', margin:'16px 0', borderLeft:'4px solid #f59e0b' }}>
                        <p style={{ fontSize:13, color:'#92400e', lineHeight:1.6, margin:0, whiteSpace:'pre-line' }}>{chapter.teacherNote}</p>
                      </div>
                    )}

                    {(chapter.files || []).map(file => (
                      <div key={file.id} style={{ display:'flex', alignItems:'center', gap:14, padding:'13px 0', borderBottom:'1px solid #f0f4f8' }}>
                        <div style={{ width:40, height:40, borderRadius:8, flexShrink:0, background: FILE_COLORS[file.fileType || file.type] || '#888', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>
                          {FILE_ICONS[file.fileType || file.type] || '📄'}
                        </div>

                        <div style={{ flex:1, minWidth:0 }}>
                          <p style={{ fontWeight:600, fontSize:14, color:'#1a202c', margin:'0 0 2px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                            {file.title || file.name}
                          </p>
                          <p style={{ fontSize:12, color:'#aaa', margin:0 }}>
                            {file.fileType === 'VIDEO' ? 'Video Bài giảng' : file.fileType || file.type}
                            {file.fileSize ? ` • ${(file.fileSize/1024/1024).toFixed(1)} MB` : ''}
                          </p>
                        </div>

                        <div style={{ display:'flex', gap:8, flexShrink:0 }}>
                          {file.fileType === 'VIDEO' ? (
                            <button onClick={() => navigate(`/roadmap/chapter/${chapter.id}/lesson/${file.id}`)}
                              style={{ padding:'7px 16px', border:'none', borderRadius:8, background:'#f59e0b', color:'#fff', fontSize:12, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', gap:4 }}>
                              ▶ Xem Video
                            </button>
                          ) : (
                            <a href={`${BASE_URL}/documents/${file.documentId || file.id}/download`} download onClick={e => e.stopPropagation()}
                              style={{ padding:'7px 16px', border:'none', borderRadius:8, background:'linear-gradient(90deg,#1a7a4a,#1d8a55)', color:'#fff', fontSize:12, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', gap:4, textDecoration:'none' }}>
                              ⬇ Tải xuống
                            </a>
                          )}
                        </div>
                      </div>
                    ))}

                    {canManage && (
                      <button onClick={() => setShowAddFile(chapter.id)}
                        style={{ marginTop: 12, width: '100%', padding: '10px', border: '2px dashed #bfdbfe', background: '#eff6ff', color: '#1a3a8f', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>
                        + Thêm Bài giảng / Tài liệu
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* RIGHT sidebar */}
          <div>
            <div style={{ background:'#fff', borderRadius:14, padding:'18px 20px', marginBottom:16, border:'1.5px solid #e8ecf0', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
              <h3 style={{ fontSize:14, fontWeight:700, color:'#1a202c', margin:'0 0 14px' }}>📊 Tổng quan lộ trình</h3>
              {[
                { label:'Số chương',   value: chapters.length, color:'#1a202c' },
                { label:'Tổng bài giảng', value: chapters.reduce((s,c) => s+(c.files||[]).length, 0), color:'#3b82f6' },
              ].map((s,i) => (
                <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom: i<1?'1px solid #f0f4f8':'none' }}>
                  <span style={{ fontSize:13, color:'#555' }}>{s.label}</span>
                  <span style={{ fontSize:16, fontWeight:700, color:s.color }}>{s.value}</span>
                </div>
              ))}
            </div>

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

      {/* ── MODAL 1: TẠO / SỬA LỘ TRÌNH ── */}
      {roadmapModalMode && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:3000, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div style={{ background:'#fff', width:500, padding:24, borderRadius:12 }}>
            <h2 style={{ marginTop:0, color:'#1a202c' }}>
              {roadmapModalMode === 'create' ? 'Tạo Lộ trình mới' : 'Chỉnh sửa Lộ trình'}
            </h2>
            
            <label style={{ display:'block', marginBottom:8, fontWeight:600 }}>Tên lộ trình *</label>
            <input value={roadmapForm.title} onChange={e=>setRoadmapForm({...roadmapForm, title: e.target.value})} placeholder="VD: Lộ trình Olympic Đại số" style={{ width:'100%', padding:10, marginBottom:16, borderRadius:6, border:'1px solid #ccc', boxSizing:'border-box' }} />

            <label style={{ display:'block', marginBottom:8, fontWeight:600 }}>Môn học</label>
            <input value={roadmapForm.subject} onChange={e=>setRoadmapForm({...roadmapForm, subject: e.target.value})} style={{ width:'100%', padding:10, marginBottom:16, borderRadius:6, border:'1px solid #ccc', boxSizing:'border-box' }} />

            <label style={{ display:'block', marginBottom:8, fontWeight:600 }}>Mô tả</label>
            <textarea rows={3} value={roadmapForm.description} onChange={e=>setRoadmapForm({...roadmapForm, description: e.target.value})} placeholder="Mô tả ngắn gọn về lộ trình..." style={{ width:'100%', padding:10, marginBottom:24, borderRadius:6, border:'1px solid #ccc', boxSizing:'border-box' }} />

            <div style={{ display:'flex', justifyContent:'flex-end', gap:10 }}>
              <button onClick={() => {
                setRoadmapModalMode(null);
                setRoadmapForm({ title: '', description: '', subject: 'Toán học' });
              }} style={{ padding:'8px 16px', borderRadius:6, border:'1px solid #ccc', cursor:'pointer' }}>Hủy</button>
              <button onClick={handleSaveRoadmap} style={{ padding:'8px 16px', background:'#1a3a8f', color:'#fff', border:'none', borderRadius:6, cursor:'pointer' }}>
                {roadmapModalMode === 'create' ? 'Tạo lộ trình' : 'Lưu thay đổi'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 2: THÊM CHƯƠNG ── */}
      {showAddChapter && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:3000, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div style={{ background:'#fff', width:500, padding:24, borderRadius:12 }}>
            <h2 style={{ marginTop:0, color:'#1a202c' }}>Thêm Chương mới</h2>
            
            <label style={{ display:'block', marginBottom:8, fontWeight:600 }}>Tên chương *</label>
            <input value={chapterForm.title} onChange={e=>setChapterForm({...chapterForm, title: e.target.value})} placeholder="VD: Chương 1: Ma trận" style={{ width:'100%', padding:10, marginBottom:16, borderRadius:6, border:'1px solid #ccc', boxSizing:'border-box' }} />

            <label style={{ display:'block', marginBottom:8, fontWeight:600 }}>Lưu ý của giảng viên (Không bắt buộc)</label>
            <textarea rows={3} value={chapterForm.teacherNote} onChange={e=>setChapterForm({...chapterForm, teacherNote: e.target.value})} placeholder="Ghi chú thêm cho sinh viên..." style={{ width:'100%', padding:10, marginBottom:24, borderRadius:6, border:'1px solid #ccc', boxSizing:'border-box' }} />

            <div style={{ display:'flex', justifyContent:'flex-end', gap:10 }}>
              <button onClick={() => setShowAddChapter(false)} style={{ padding:'8px 16px', borderRadius:6, border:'1px solid #ccc', cursor:'pointer' }}>Hủy</button>
              <button onClick={handleAddChapter} style={{ padding:'8px 16px', background:'#1a3a8f', color:'#fff', border:'none', borderRadius:6, cursor:'pointer' }}>Lưu chương</button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 3: THÊM BÀI GIẢNG / VIDEO ── */}
      {showAddFile && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:3000, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div style={{ background:'#fff', width:500, padding:24, borderRadius:12 }}>
            <h2 style={{ marginTop:0, color:'#1a202c' }}>Thêm Bài giảng mới</h2>
            
            <label style={{ display:'block', marginBottom:8, fontWeight:600 }}>Loại bài giảng</label>
            <select value={fileForm.itemType} onChange={e=>setFileForm({...fileForm, itemType: e.target.value})} style={{ width:'100%', padding:10, marginBottom:16, borderRadius:6, border:'1px solid #ccc' }}>
              <option value="VIDEO_LINK">▶ Nhúng Link Video (Youtube/Drive)</option>
              <option value="DOCUMENT">📄 Chọn Tài liệu từ Kho</option>
            </select>

            <label style={{ display:'block', marginBottom:8, fontWeight:600 }}>Tiêu đề bài giảng *</label>
            <input value={fileForm.title} onChange={e=>setFileForm({...fileForm, title: e.target.value})} placeholder="VD: Bài 1: Đạo hàm..." style={{ width:'100%', padding:10, marginBottom:16, borderRadius:6, border:'1px solid #ccc', boxSizing:'border-box' }} />

            {fileForm.itemType === 'VIDEO_LINK' ? (
              <>
                <label style={{ display:'block', marginBottom:8, fontWeight:600 }}>Đường dẫn Video (URL)</label>
                <input value={fileForm.externalUrl} onChange={e=>setFileForm({...fileForm, externalUrl: e.target.value})} placeholder="https://youtube.com/watch?v=..." style={{ width:'100%', padding:10, marginBottom:24, borderRadius:6, border:'1px solid #ccc', boxSizing:'border-box' }} />
              </>
            ) : (
              <>
                <label style={{ display:'block', marginBottom:8, fontWeight:600 }}>ID Tài liệu trong hệ thống</label>
                <input value={fileForm.documentId} onChange={e=>setFileForm({...fileForm, documentId: e.target.value})} placeholder="Nhập ID tài liệu..." type="number" style={{ width:'100%', padding:10, marginBottom:24, borderRadius:6, border:'1px solid #ccc', boxSizing:'border-box' }} />
              </>
            )}

            <div style={{ display:'flex', justifyContent:'flex-end', gap:10 }}>
              <button onClick={() => setShowAddFile(null)} style={{ padding:'8px 16px', borderRadius:6, border:'1px solid #ccc', cursor:'pointer' }}>Hủy</button>
              <button onClick={handleSaveFile} style={{ padding:'8px 16px', background:'#1a3a8f', color:'#fff', border:'none', borderRadius:6, cursor:'pointer' }}>Lưu bài giảng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}