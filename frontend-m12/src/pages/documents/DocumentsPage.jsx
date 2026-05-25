import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../../components/layout/Navbar';
import { Spinner, Empty, PageContainer } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { documentAPI } from '../../api/axios';

const SUBJECTS = ['Tất cả','Toán học','Vật lý','Hóa học','CNTT','Ngoại ngữ','Khác'];
const FILE_COLOR = { PDF:'#e53e3e', DOCX:'#3b82f6', PPTX:'#f97316', MP4:'#8b5cf6', ZIP:'#6b7280' };
const FILE_ICON  = { PDF:'📄', DOCX:'📝', PPTX:'📊', MP4:'🎬', ZIP:'📦' };

function UploadModal({ open, onClose, onDone }) {
  const [title, setTitle]       = useState('');
  const [subject, setSubject]   = useState('');
  const [desc, setDesc]         = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [file, setFile]         = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!open) { setTitle(''); setSubject(''); setDesc(''); setFile(null); setError(''); setProgress(0); }
  }, [open]);

  if (!open) return null;

  const handleSubmit = async () => {
    if (!title.trim()) { setError('Vui lòng nhập tiêu đề'); return; }
    if (!file)         { setError('Vui lòng chọn file'); return; }

    const formData = new FormData();
    formData.append('title',       title);
    formData.append('subject',     subject);
    formData.append('description', desc);
    formData.append('isPublic',    isPublic);
    formData.append('file',        file);

    setLoading(true); setError(''); setProgress(10);
    try {
      await documentAPI.upload(formData);
      setProgress(100);
      onDone('Upload tài liệu thành công!');
    } catch (e) {
      setError(e.response?.data?.message || 'Upload thất bại. Kiểm tra lại file!');
    } finally { setLoading(false); }
  };

  const inp = { width:'100%', boxSizing:'border-box', padding:'10px 14px', border:'1.5px solid #e0e0e0', borderRadius:8, fontSize:14, fontFamily:'inherit', outline:'none', marginBottom:12 };

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.48)', zIndex:2000, display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}
      onClick={e => e.target===e.currentTarget && onClose()}>
      <div style={{ background:'#fff', borderRadius:16, padding:28, width:'100%', maxWidth:480, boxShadow:'0 20px 60px rgba(0,0,0,0.22)' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
          <h3 style={{ fontSize:17, fontWeight:700, color:'#1a202c', margin:0 }}>📤 Upload tài liệu</h3>
          <button onClick={onClose} style={{ background:'none', border:'none', fontSize:20, cursor:'pointer', color:'#aaa' }}>✕</button>
        </div>

        {error && <div style={{ background:'#fef2f2', border:'1px solid #fca5a5', borderRadius:8, padding:'10px 14px', marginBottom:12, color:'#991b1b', fontSize:13 }}>❌ {error}</div>}

        <label style={{ fontSize:12, fontWeight:600, color:'#555', display:'block', marginBottom:4 }}>Tiêu đề *</label>
        <input style={inp} placeholder="Nhập tiêu đề tài liệu" value={title} onChange={e => setTitle(e.target.value)} />

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:0 }}>
          <div>
            <label style={{ fontSize:12, fontWeight:600, color:'#555', display:'block', marginBottom:4 }}>Môn học</label>
            <select style={{ ...inp, cursor:'pointer' }} value={subject} onChange={e => setSubject(e.target.value)}>
              <option value="">Chọn môn học</option>
              {SUBJECTS.slice(1).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize:12, fontWeight:600, color:'#555', display:'block', marginBottom:4 }}>Quyền truy cập</label>
            <select style={{ ...inp, cursor:'pointer' }} value={isPublic} onChange={e => setIsPublic(e.target.value === 'true')}>
              <option value="true">🌐 Công khai</option>
              <option value="false">🔒 Riêng tư</option>
            </select>
          </div>
        </div>

        <label style={{ fontSize:12, fontWeight:600, color:'#555', display:'block', marginBottom:4 }}>Mô tả</label>
        <textarea style={{ ...inp, resize:'vertical', minHeight:68 }} placeholder="Mô tả ngắn về tài liệu..." value={desc} onChange={e => setDesc(e.target.value)} />

        {/* Drop zone */}
        <div
          onClick={() => document.getElementById('file-upload-inp').click()}
          onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor='#1a3a8f'; }}
          onDragLeave={e => e.currentTarget.style.borderColor='#c0c0c0'}
          onDrop={e => { e.preventDefault(); setFile(e.dataTransfer.files[0]); e.currentTarget.style.borderColor='#c0c0c0'; }}
          style={{ border:'2px dashed #c0c0c0', borderRadius:10, padding:'22px 16px', textAlign:'center', cursor:'pointer', marginBottom:12, background:'#fafafa', transition:'border-color 0.15s' }}>
          <input id="file-upload-inp" type="file" style={{ display:'none' }}
            onChange={e => setFile(e.target.files[0])}
            accept=".pdf,.docx,.doc,.pptx,.ppt,.xlsx,.xls,.mp4,.zip" />
          {file ? (
            <div>
              <p style={{ color:'#1a7a4a', fontWeight:700, fontSize:14, margin:'0 0 4px' }}>✅ {file.name}</p>
              <p style={{ color:'#888', fontSize:12, margin:0 }}>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          ) : (
            <>
              <p style={{ fontSize:28, marginBottom:6 }}>☁️</p>
              <p style={{ fontSize:14, color:'#888', margin:0 }}>Kéo thả hoặc <span style={{ color:'#1a3a8f', fontWeight:600 }}>click để chọn file</span></p>
              <p style={{ fontSize:12, color:'#bbb', margin:'4px 0 0' }}>PDF, DOCX, PPTX, MP4 • Tối đa 50MB</p>
            </>
          )}
        </div>

        {loading && progress > 0 && (
          <div style={{ marginBottom:12 }}>
            <div style={{ height:4, background:'#e5e7eb', borderRadius:2, overflow:'hidden' }}>
              <div style={{ height:'100%', width:`${progress}%`, background:'linear-gradient(90deg,#1a3a8f,#1a7a4a)', transition:'width 0.3s' }} />
            </div>
            <p style={{ fontSize:12, color:'#888', textAlign:'center', margin:'4px 0 0' }}>Đang upload...</p>
          </div>
        )}

        <div style={{ display:'flex', gap:10 }}>
          <button onClick={onClose} style={{ flex:1, padding:11, border:'1.5px solid #e0e0e0', borderRadius:8, background:'#fff', fontSize:14, cursor:'pointer', fontFamily:'inherit' }}>Hủy</button>
          <button onClick={handleSubmit} disabled={loading}
            style={{ flex:2, padding:11, background: loading?'#ccc':'linear-gradient(90deg,#1a3a8f,#1a7a4a)', border:'none', borderRadius:8, color:'#fff', fontSize:14, fontWeight:700, cursor: loading?'not-allowed':'pointer', fontFamily:'inherit' }}>
            {loading ? '⏳ Đang upload...' : '📤 Upload ngay'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main ────────────────────────────────────────────────────────────────────
export default function DocumentsPage() {
  const { user } = useAuth();
  const [docs,        setDocs]        = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState('');
  const [subject,     setSubject]     = useState('Tất cả');
  const [showUpload,  setShowUpload]  = useState(false);
  const [toast,       setToast]       = useState('');
  const [page,        setPage]        = useState(1);
  const [selectedDoc, setSelectedDoc] = useState(null);
  
  // THÊM STATE CHO XEM TRƯỚC VÀ TẢI XUỐNG
  const [previewUrl, setPreviewUrl] = useState(null);
  const [actionLoading, setActionLoading] = useState(''); // 'preview' | 'download' | ''

  const PER_PAGE = 12;

  const canUpload = ['TEACHER','MANAGER','ADMIN'].includes(user?.role);
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  // ── Fetch từ API thật ─────────────────────────────────────────────────────
  const fetchDocs = useCallback(() => {
    setLoading(true);
    documentAPI.getAll({
      subject: subject !== 'Tất cả' ? subject : undefined,
      search:  search  || undefined,
    })
      .then(r => {
        const list = Array.isArray(r.data) ? r.data : (r.data?.content || []);
        setDocs(list);
      })
      .catch(() => setDocs([]))
      .finally(() => setLoading(false));
  }, [subject, search]);

  useEffect(() => { fetchDocs(); }, [subject]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => { setPage(1); fetchDocs(); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  // Dọn dẹp URL rác khỏi bộ nhớ khi đóng Preview
  useEffect(() => {
    return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); };
  }, [previewUrl]);

  // ── Xóa tài liệu ────────────────────────────────────────────────────────
  const [confirmDelete, setConfirmDelete] = useState(null);

  const handleDelete = async (id, title) => { setConfirmDelete({ id, title }); };

  const doDelete = async () => {
    if (!confirmDelete) return;
    const { id } = confirmDelete;
    setConfirmDelete(null);
    try {
      await documentAPI.delete(id);
      showToast('Đã xóa tài liệu!');
      fetchDocs();
    } catch (e) { showToast(e.response?.data?.message || 'Xóa thất bại!'); }
  };

  // ── TÍNH NĂNG MỚI: TẢI XUỐNG QUA API CHUẨN ────────────────────────────────
  const handleDownload = async (doc) => {
    try {
      setActionLoading('download');
      const res = await documentAPI.download(doc.id);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      
      const link = document.createElement('a');
      link.href = url;
      // Backend thường trả về filename trong header, nhưng để nhanh ta tự tạo tên
      const fileName = `${doc.title || 'Tai-lieu'}.${doc.fileType?.toLowerCase() || 'pdf'}`;
      link.setAttribute('download', fileName);
      
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      showToast('Lỗi khi tải file!');
    } finally {
      setActionLoading('');
    }
  };

  // ── TÍNH NĂNG MỚI: XEM TRƯỚC TÀI LIỆU ────────────────────────────────────
  const handlePreview = async (doc) => {
    // Trình duyệt chỉ nhúng được PDF hoặc Video MP4. 
    // Các file Word, Excel yêu cầu thư viện bên thứ 3 nên ta báo người dùng tải về.
    if (doc.fileType !== 'PDF' && doc.fileType !== 'MP4') {
      showToast('Chỉ hỗ trợ xem trước trực tiếp file PDF và MP4. Vui lòng tải xuống!');
      return;
    }

    try {
      setActionLoading('preview');
      const res = await documentAPI.download(doc.id);
      const contentType = doc.fileType === 'PDF' ? 'application/pdf' : 'video/mp4';
      const fileBlob = new Blob([res.data], { type: contentType });
      const url = window.URL.createObjectURL(fileBlob);
      setPreviewUrl(url); // Mở Modal Preview
    } catch (error) {
      showToast('Lỗi khi tải bản xem trước!');
    } finally {
      setActionLoading('');
    }
  };


  const paged = docs.slice((page-1)*PER_PAGE, page*PER_PAGE);
  const totalPages = Math.ceil(docs.length / PER_PAGE);

  return (
    <div style={{ minHeight:'100vh', background:'#f9eded', fontFamily:"'Be Vietnam Pro',sans-serif" }}>
      <Navbar />

      {toast && (
        <div style={{ position:'fixed', top:80, right:24, background:'#1a202c', color:'#fff', padding:'12px 20px', borderRadius:10, fontSize:14, fontWeight:500, zIndex:3000, boxShadow:'0 8px 24px rgba(0,0,0,0.2)' }}>
          ✅ {toast}
        </div>
      )}

      <PageContainer maxWidth={1100}>
        {/* Filter bar */}
        <div style={{ display:'flex', gap:12, marginBottom:28, alignItems:'center' }}>
          <div style={{ position:'relative' }}>
            <select value={subject} onChange={e => { setSubject(e.target.value); setPage(1); }}
              style={{ padding:'10px 36px 10px 14px', border:'1.5px solid #e0e0e0', borderRadius:8, fontSize:14, fontFamily:'inherit', background:'#fff', cursor:'pointer', outline:'none', appearance:'none', minWidth:140 }}>
              {SUBJECTS.map(s => <option key={s} value={s}>{s === 'Tất cả' ? 'All Subjects' : s}</option>)}
            </select>
            <span style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', pointerEvents:'none', color:'#888' }}>▾</span>
          </div>

          <div style={{ flex:1, position:'relative' }}>
            <span style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'#aaa', fontSize:16 }}>🔍</span>
            <input placeholder="Search documents by title, author, or keyword..."
              value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              style={{ width:'100%', boxSizing:'border-box', padding:'10px 14px 10px 42px', border:'1.5px solid #e0e0e0', borderRadius:8, fontSize:14, fontFamily:'inherit', outline:'none', background:'#fff' }} />
          </div>

          {canUpload && (
            <button onClick={() => setShowUpload(true)}
              style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 20px', background:'#1a3a8f', border:'none', borderRadius:8, color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'inherit', whiteSpace:'nowrap' }}>
              ⬆ Upload
            </button>
          )}
        </div>

        {/* Grid */}
        {loading ? <Spinner /> : docs.length === 0 ? (
          <Empty icon="📚" message="Không có tài liệu nào. Hãy upload tài liệu đầu tiên!" />
        ) : (
          <>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:32 }}>
              {paged.map(doc => (
                <div key={doc.id}
                  onClick={() => setSelectedDoc(doc)}
                  style={{ background:'#fff', borderRadius:14, padding:'22px 16px 16px', border:'1.5px solid #eee', textAlign:'center', boxShadow:'0 1px 4px rgba(0,0,0,0.06)', transition:'box-shadow 0.15s,transform 0.15s', cursor:'pointer' }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow='0 6px 20px rgba(0,0,0,0.1)'; e.currentTarget.style.transform='translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow='0 1px 4px rgba(0,0,0,0.06)'; e.currentTarget.style.transform='none'; }}>

                  {/* File icon */}
                  <div style={{ width:72, height:72, borderRadius:12, background: FILE_COLOR[doc.fileType] || '#888', display:'flex', alignItems:'center', justifyContent:'center', fontSize:30, margin:'0 auto 12px', boxShadow:`0 4px 12px ${FILE_COLOR[doc.fileType] || '#888'}44` }}>
                    {FILE_ICON[doc.fileType] || '📄'}
                  </div>

                  <p style={{ fontWeight:700, fontSize:14, color:'#1a202c', margin:'0 0 4px', lineHeight:1.3 }}>
                    {doc.title?.length > 28 ? doc.title.slice(0,28)+'...' : doc.title}
                  </p>
                  {doc.subject && (
                    <span style={{ fontSize:11, background:'#eff6ff', color:'#1d4ed8', padding:'2px 8px', borderRadius:12, fontWeight:600 }}>{doc.subject}</span>
                  )}

                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', paddingTop:10, marginTop:8, borderTop:'1px solid #f0f0f0' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:6, flex:1, minWidth:0 }}>
                      <div style={{ width:26, height:26, borderRadius:'50%', background:'#e8f4fd', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:'#1a3a8f', flexShrink:0 }}>
                        {doc.uploaderName?.split(' ').pop()?.charAt(0) || '?'}
                      </div>
                      <div style={{ minWidth:0 }}>
                        <p style={{ fontSize:11, fontWeight:600, color:'#333', margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                          {doc.uploaderName || 'Unknown'}
                        </p>
                        <p style={{ fontSize:10, color:'#aaa', margin:0 }}>{doc.createdAtFormatted || '—'}</p>
                      </div>
                    </div>
                    <div style={{ display:'flex', gap:4, flexShrink:0 }}>
                      {/* SỬA LẠI NÚT DOWNLOAD NGOÀI GRID */}
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDownload(doc); }}
                        style={{ background:'none', border:'none', cursor:'pointer', fontSize:15, color:'#888', padding:4 }}
                        title="Tải xuống">
                        ⬇
                      </button>

                      {/* Xóa — chỉ owner hoặc Admin */}
                      {(doc.uploaderId === user?.id || ['ADMIN','MANAGER'].includes(user?.role)) && (
                        <button onClick={e => { e.stopPropagation(); handleDelete(doc.id, doc.title); }}
                          style={{ background:'none', border:'none', cursor:'pointer', fontSize:15, color:'#e53e3e', padding:4 }}
                          title="Xóa">
                          🗑
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display:'flex', justifyContent:'center', alignItems:'center', gap:8 }}>
                <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1}
                  style={{ width:32, height:32, borderRadius:6, border:'1.5px solid #e0e0e0', background: page===1?'#f5f5f5':'#fff', cursor: page===1?'not-allowed':'pointer', fontSize:16 }}>←</button>
                {Array.from({length:totalPages},(_,i)=>i+1).map(p => (
                  <button key={p} onClick={() => setPage(p)}
                    style={{ width:32, height:32, borderRadius:6, border: p===page?'none':'1.5px solid #e0e0e0', background: p===page?'#1a3a8f':'#fff', color: p===page?'#fff':'#333', fontWeight: p===page?700:400, cursor:'pointer', fontSize:13, fontFamily:'inherit' }}>
                    {p}
                  </button>
                ))}
                <button onClick={() => setPage(p => Math.min(totalPages,p+1))} disabled={page===totalPages}
                  style={{ width:32, height:32, borderRadius:6, border:'1.5px solid #e0e0e0', background: page===totalPages?'#f5f5f5':'#fff', cursor: page===totalPages?'not-allowed':'pointer', fontSize:16 }}>→</button>
              </div>
            )}
          </>
        )}
      </PageContainer>

      <UploadModal open={showUpload} onClose={() => setShowUpload(false)} onDone={(msg) => { showToast(msg); setShowUpload(false); fetchDocs(); }} />

      {/* Confirm Delete Dialog */}
      {confirmDelete && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.48)', zIndex:3000, display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
          <div style={{ background:'#fff', borderRadius:14, padding:28, maxWidth:380, width:'100%', boxShadow:'0 12px 40px rgba(0,0,0,0.2)', textAlign:'center' }}>
            <div style={{ fontSize:44, marginBottom:12 }}>🗑️</div>
            <h3 style={{ fontSize:16, fontWeight:700, color:'#1a202c', margin:'0 0 8px' }}>Xóa tài liệu?</h3>
            <p style={{ color:'#888', fontSize:13, marginBottom:22 }}>
              Bạn có chắc muốn xóa <strong>"{confirmDelete.title}"</strong>? Hành động này không thể hoàn tác.
            </p>
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={() => setConfirmDelete(null)} style={{ flex:1, padding:11, border:'1.5px solid #e0e0e0', borderRadius:8, background:'#fff', fontSize:14, cursor:'pointer', fontFamily:'inherit' }}>Hủy</button>
              <button onClick={doDelete} style={{ flex:1, padding:11, background:'#e53e3e', border:'none', borderRadius:8, color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>Xóa</button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL CHI TIẾT TÀI LIỆU ──────────────────────────────────────── */}
      {selectedDoc && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.55)', zIndex:2000, display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}
          onClick={e => e.target===e.currentTarget && setSelectedDoc(null)}>
          <div style={{ background:'#fff', borderRadius:16, padding:28, width:'100%', maxWidth:520, boxShadow:'0 20px 60px rgba(0,0,0,0.25)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20 }}>
              <div style={{ flex:1, marginRight:12 }}>
                <h3 style={{ fontSize:17, fontWeight:700, color:'#1a202c', margin:'0 0 6px', lineHeight:1.3 }}>{selectedDoc.title}</h3>
                {selectedDoc.subject && (
                  <span style={{ fontSize:11, background:'#eff6ff', color:'#1d4ed8', padding:'2px 8px', borderRadius:12, fontWeight:600 }}>{selectedDoc.subject}</span>
                )}
              </div>
              <button onClick={() => setSelectedDoc(null)} style={{ background:'none', border:'none', fontSize:22, cursor:'pointer', color:'#aaa', flexShrink:0 }}>✕</button>
            </div>

            {/* File icon big */}
            <div style={{ textAlign:'center', marginBottom:20 }}>
              <div style={{ width:80, height:80, borderRadius:16, background: FILE_COLOR[selectedDoc.fileType]||'#888', display:'flex', alignItems:'center', justifyContent:'center', fontSize:36, margin:'0 auto 12px', boxShadow:`0 6px 20px ${FILE_COLOR[selectedDoc.fileType]||'#888'}44` }}>
                {FILE_ICON[selectedDoc.fileType]||'📄'}
              </div>
              <p style={{ fontSize:13, color:'#555', margin:0 }}>
                <strong>{selectedDoc.fileType || 'FILE'}</strong>
                {selectedDoc.fileSize ? ` • ${(selectedDoc.fileSize/1024/1024).toFixed(2)} MB` : ''}
              </p>
            </div>

            {selectedDoc.description && (
              <div style={{ background:'#f8fafc', borderRadius:8, padding:'12px 14px', marginBottom:16, fontSize:13, color:'#555', lineHeight:1.6 }}>
                {selectedDoc.description}
              </div>
            )}

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:20, fontSize:13 }}>
              {[
                ['👤 Người đăng', selectedDoc.uploaderName || '—'],
                ['📅 Ngày đăng', selectedDoc.createdAtFormatted || '—'],
                ['📂 Loại file', selectedDoc.fileType || '—'],
                ['🌐 Quyền', selectedDoc.isPublic ? 'Công khai' : 'Riêng tư'],
              ].map(([label, val]) => (
                <div key={label} style={{ background:'#f8fafc', borderRadius:8, padding:'10px 12px' }}>
                  <p style={{ color:'#888', fontSize:11, margin:'0 0 2px', fontWeight:600 }}>{label}</p>
                  <p style={{ color:'#1a202c', fontWeight:600, margin:0, fontSize:13 }}>{val}</p>
                </div>
              ))}
            </div>

            {/* SỬA LẠI CÁC NÚT Ở ĐÂY: Bổ sung nút Xem trước */}
            <div style={{ display:'flex', gap:10 }}>
              {/* Chỉ hiện nút xem trước nếu là PDF hoặc MP4 */}
              {(selectedDoc.fileType === 'PDF' || selectedDoc.fileType === 'MP4') && (
                <button 
                  onClick={() => handlePreview(selectedDoc)}
                  disabled={actionLoading === 'preview'}
                  style={{ flex:1, padding:11, border:'1.5px solid #1a3a8f', borderRadius:8, background:'#e8f0fe', color:'#1a3a8f', fontSize:14, fontWeight:700, cursor: actionLoading === 'preview' ? 'not-allowed' : 'pointer', fontFamily:'inherit' }}>
                  {actionLoading === 'preview' ? '⏳ Đang tải...' : '👁 Xem trước'}
                </button>
              )}
              
              <button
                onClick={() => handleDownload(selectedDoc)}
                disabled={actionLoading === 'download'}
                style={{ flex:2, padding:11, background:'linear-gradient(90deg,#1a3a8f,#1a7a4a)', border:'none', borderRadius:8, color:'#fff', fontSize:14, fontWeight:700, cursor: actionLoading === 'download' ? 'not-allowed' : 'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
                {actionLoading === 'download' ? '⏳ Đang xử lý...' : '⬇ Tải xuống'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL HIỂN THỊ XEM TRƯỚC (IFRAME) ────────────────────────────── */}
      {previewUrl && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.85)', zIndex:4000, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:24 }}>
          <div style={{ width: '100%', maxWidth: 1000, background: '#fff', borderRadius: 12, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '90vh', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}>
            
            {/* Header của Preview Modal */}
            <div style={{ padding: '12px 20px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 20 }}>👁</span>
                <h3 style={{ margin: 0, fontSize: 16, color: '#1a202c' }}>Chế độ xem trước</h3>
              </div>
              <button 
                onClick={() => { URL.revokeObjectURL(previewUrl); setPreviewUrl(null); }} 
                style={{ background:'none', border:'none', fontSize:22, cursor:'pointer', color:'#aaa', display: 'flex', alignItems: 'center' }}>
                ✕
              </button>
            </div>

            {/* Nội dung Iframe */}
            <iframe 
              src={previewUrl} 
              style={{ width: '100%', flex: 1, border: 'none', background: '#e5e7eb' }} 
              title="Bản xem trước" 
            />
          </div>
        </div>
      )}
    </div>
  );
}