import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import { PageContainer, Spinner, Modal, Btn } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { newsAPI } from '../../api/axios';
import { toast } from 'react-hot-toast';
import { Avatar } from '../../components/ui';

const CAT_LABEL = { announcement:'📢 Thông báo', contest:'🏆 Cuộc thi', achievement:'🥇 Thành tích', event:'📅 Sự kiện', knowledge:'📚 Kiến thức' };
const CAT_COLOR = { announcement:'#1d4ed8', contest:'#92400e', achievement:'#166534', event:'#6d28d9', knowledge:'#374151' };
const CAT_BG    = { announcement:'#eff6ff', contest:'#fffbeb', achievement:'#f0fdf4', event:'#f5f3ff', knowledge:'#f9fafb' };

function timeAgo(d) {
  if (!d) return '';
  const s=(Date.now()-new Date(d))/1000;
  if (s<60)    return 'vừa xong';
  if (s<3600)  return `${Math.floor(s/60)} phút trước`;
  if (s<86400) return `${Math.floor(s/3600)} giờ trước`;
  if (s<604800)return `${Math.floor(s/86400)} ngày trước`;
  return new Date(d).toLocaleDateString('vi-VN',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'});
}

/* ── EditNewsModal ─────────────────────────────────────────── */
function EditNewsModal({ open, onClose, news, onSaved }) {
  const [f, setF] = useState({ title:'', summary:'', content:'', category:'announcement', featured:false });
  const [loading, setLoading] = useState(false);

  useEffect(()=>{ if (open && news) setF({ title:news.title||'', summary:news.summary||'', content:news.content||'', category:news.category||'announcement', featured:!!news.featured }); },[open, news]);

  const submit = async () => {
    if (!f.title.trim() || !f.content.trim()) { toast.error('Tiêu đề và nội dung không được để trống'); return; }
    setLoading(true);
    try {
      const res = await newsAPI.update(news.id, f);
      toast.success('Đã cập nhật bài tin!');
      onSaved(res.data);
      onClose();
    } catch(err) { toast.error(err?.response?.data?.message||'Cập nhật thất bại'); }
    finally { setLoading(false); }
  };

  const inp = { width:'100%', boxSizing:'border-box', padding:'11px 14px', border:'1.5px solid #e5e7eb', borderRadius:10, fontSize:14, outline:'none', fontFamily:'inherit', color:'#222', background:'#fafafa', transition:'border-color 0.15s' };
  const focus=e=>{e.target.style.borderColor='#1a3a8f';e.target.style.boxShadow='0 0 0 3px rgba(26,58,143,0.08)';};
  const blur=e=>{e.target.style.borderColor='#e5e7eb';e.target.style.boxShadow='none';};

  const CATS = [
    {id:'announcement',label:'📢 Thông báo'},{id:'contest',label:'🏆 Cuộc thi'},
    {id:'achievement',label:'🥇 Thành tích'},{id:'event',label:'📅 Sự kiện'},{id:'knowledge',label:'📚 Kiến thức'},
  ];

  return (
    <Modal open={open} onClose={onClose} title="✏️ Chỉnh sửa bài tin" width={600}>
      <div style={{ marginBottom:14 }}>
        <label style={LS}>TIÊU ĐỀ *</label>
        <input value={f.title} onChange={e=>setF(p=>({...p,title:e.target.value}))} style={inp} onFocus={focus} onBlur={blur} />
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:14 }}>
        <div>
          <label style={LS}>DANH MỤC</label>
          <select value={f.category} onChange={e=>setF(p=>({...p,category:e.target.value}))} style={{ ...inp, cursor:'pointer' }}>
            {CATS.map(c=><option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </div>
        <div style={{ display:'flex', alignItems:'center', paddingTop:22 }}>
          <label style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer', fontSize:14, fontWeight:600, color:'#555' }}>
            <input type="checkbox" checked={f.featured} onChange={e=>setF(p=>({...p,featured:e.target.checked}))}
              style={{ width:16, height:16, cursor:'pointer', accentColor:'#f59e0b' }} />
            ⭐ Đánh dấu nổi bật
          </label>
        </div>
      </div>
      <div style={{ marginBottom:14 }}>
        <label style={LS}>TÓM TẮT</label>
        <textarea value={f.summary} onChange={e=>setF(p=>({...p,summary:e.target.value}))} rows={2}
          style={{ ...inp, resize:'vertical', lineHeight:1.6 }} onFocus={focus} onBlur={blur} />
      </div>
      <div style={{ marginBottom:20 }}>
        <label style={LS}>NỘI DUNG *</label>
        <textarea value={f.content} onChange={e=>setF(p=>({...p,content:e.target.value}))} rows={10}
          style={{ ...inp, resize:'vertical', minHeight:200, lineHeight:1.7 }} onFocus={focus} onBlur={blur} />
      </div>
      <div style={{ display:'flex', gap:10 }}>
        <button onClick={onClose} style={GHOST_BTN}>Hủy</button>
        <Btn onClick={submit} loading={loading} color="primary" style={{ flex:2 }}>💾 Lưu thay đổi</Btn>
      </div>
    </Modal>
  );
}

/* ── Main ─────────────────────────────────────────────────── */
export default function NewsDetailPage() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [news, setNews]         = useState(null);
  const [related, setRelated]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [showDel, setShowDel]   = useState(false);
  const [copied, setCopied]     = useState(false);

  const canManage = ['TEACHER','MANAGER','ADMIN'].includes(user?.role);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await newsAPI.getById(id);
      setNews(res.data);
      // Load related (same category)
      newsAPI.getAll({ category:res.data.category, size:4, page:0 })
        .then(r=>{
          const list = Array.isArray(r.data)?r.data:(r.data?.content||[]);
          setRelated(list.filter(n=>n.id!==id).slice(0,3));
        }).catch(()=>{});
    } catch {
      toast.error('Không tìm thấy bài tin này');
      navigate('/news');
    } finally { setLoading(false); }
  }, [id]);

  useEffect(()=>{ load(); },[load]);

  const handleTogglePublish = async () => {
    try {
      await newsAPI.togglePublish(id);
      setNews(n=>({...n, published:!n.published}));
      toast.success(news.published?'Đã thu hồi bài tin':'Đã xuất bản bài tin');
    } catch { toast.error('Thao tác thất bại'); }
  };

  const handleToggleFeatured = async () => {
    try {
      await newsAPI.toggleFeatured(id);
      setNews(n=>({...n, featured:!n.featured}));
      toast.success(news.featured?'Đã bỏ nổi bật':'Đã đánh dấu nổi bật');
    } catch { toast.error('Thao tác thất bại'); }
  };

  const handleDelete = async () => {
    try {
      await newsAPI.delete(id);
      toast.success('Đã xóa bài tin');
      navigate('/news');
    } catch { toast.error('Xóa thất bại'); }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(()=>{
      setCopied(true);
      toast.success('Đã sao chép liên kết!');
      setTimeout(()=>setCopied(false), 2000);
    });
  };

  if (loading) return <div style={{ minHeight:'100vh', background:'#f5f6fa' }}><Navbar /><Spinner /></div>;
  if (!news)   return null;

  const cat = news.category||'announcement';

  // Estimate reading time
  const readMinutes = Math.max(1, Math.ceil((news.content||'').split(' ').length / 200));

  return (
    <div style={{ minHeight:'100vh', background:'#f5f6fa', fontFamily:"'Be Vietnam Pro',sans-serif" }}>
      <style>{`
        @keyframes fadeInUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        .rel-card{transition:box-shadow 0.18s,transform 0.18s;cursor:pointer;}
        .rel-card:hover{box-shadow:0 6px 20px rgba(0,0,0,0.10)!important;transform:translateY(-2px);}
        .share-btn{transition:all 0.15s;}
        .share-btn:hover{transform:translateY(-1px);}
        .article-content p{margin:0 0 16px;line-height:1.8;}
        .article-content h2{font-size:18px;font-weight:800;color:#1a202c;margin:24px 0 12px;}
        .article-content h3{font-size:16px;font-weight:700;color:#1a202c;margin:20px 0 10px;}
        .article-content ul,.article-content ol{padding-left:24px;margin:0 0 16px;}
        .article-content li{margin-bottom:6px;line-height:1.7;}
        .article-content blockquote{border-left:4px solid #1a3a8f;padding:12px 20px;margin:16px 0;background:#eff6ff;border-radius:0 8px 8px 0;color:#1e40af;font-style:italic;}
      `}</style>
      <Navbar />

      <PageContainer maxWidth={900}>
        {/* Breadcrumb */}
        <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:13, color:'#9ca3af', marginBottom:20, flexWrap:'wrap' }}>
          <span onClick={()=>navigate('/news')} style={{ cursor:'pointer', transition:'color 0.15s' }}
            onMouseEnter={e=>e.currentTarget.style.color='#1a3a8f'} onMouseLeave={e=>e.currentTarget.style.color='#9ca3af'}>
            ← Tin tức
          </span>
          <span>/</span>
          <span style={{ background:CAT_BG[cat]||'#f9fafb', color:CAT_COLOR[cat]||'#374151', fontSize:11, fontWeight:700, padding:'2px 10px', borderRadius:20 }}>
            {CAT_LABEL[cat]||cat}
          </span>
          {!news.published && <span style={{ background:'#f9fafb', color:'#6b7280', fontSize:11, fontWeight:700, padding:'2px 10px', borderRadius:20 }}>📝 Bản nháp</span>}
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 280px', gap:28 }}>
          {/* ── Article ── */}
          <div>
            <div style={{ background:'#fff', borderRadius:18, border:'1.5px solid #e8ecf0', padding:'36px 40px', boxShadow:'0 2px 12px rgba(0,0,0,0.06)', animation:'fadeInUp 0.3s ease' }}>
              {/* Tags */}
              <div style={{ display:'flex', gap:7, marginBottom:16, flexWrap:'wrap' }}>
                <span style={{ background:CAT_BG[cat], color:CAT_COLOR[cat], fontSize:12, fontWeight:700, padding:'4px 14px', borderRadius:20 }}>
                  {CAT_LABEL[cat]}
                </span>
                {news.featured && (
                  <span style={{ background:'#fffbeb', color:'#92400e', fontSize:12, fontWeight:700, padding:'4px 14px', borderRadius:20, border:'1px solid #fde68a' }}>⭐ Nổi bật</span>
                )}
              </div>

              {/* Title */}
              <h1 style={{ fontSize:26, fontWeight:900, color:'#1a202c', margin:'0 0 16px', lineHeight:1.3, letterSpacing:-0.5 }}>
                {news.title}
              </h1>

              {/* Meta */}
              <div style={{ display:'flex', alignItems:'center', gap:16, paddingBottom:20, borderBottom:'1.5px solid #f0f4f8', marginBottom:28, flexWrap:'wrap' }}>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <Avatar src={news.authorAvatar} name={news.authorName} size={36} />
                  <div>
                    <p style={{ fontWeight:700, fontSize:13, color:'#1a202c', margin:0 }}>{news.authorName}</p>
                    <p style={{ fontSize:12, color:'#9ca3af', margin:0 }}>{timeAgo(news.publishedAt||news.createdAt)}</p>
                  </div>
                </div>
                <div style={{ display:'flex', gap:14, fontSize:13, color:'#9ca3af' }}>
                  <span>👁 {news.viewCount||0} lượt xem</span>
                  <span>⏱ {readMinutes} phút đọc</span>
                </div>
              </div>

              {/* Summary highlight */}
              {news.summary && (
                <div style={{ background:'linear-gradient(135deg,#eff6ff,#f0fdf4)', border:'1.5px solid #bfdbfe', borderRadius:12, padding:'16px 20px', marginBottom:24, fontSize:15, color:'#1e40af', fontWeight:500, lineHeight:1.6, fontStyle:'italic' }}>
                  {news.summary}
                </div>
              )}

              {/* Content */}
              <div className="article-content" style={{ fontSize:15, color:'#374151', lineHeight:1.85, whiteSpace:'pre-wrap', wordBreak:'break-word' }}>
                {news.content}
              </div>

              {/* Share row */}
              <div style={{ borderTop:'1.5px solid #f0f4f8', paddingTop:20, marginTop:28, display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
                <p style={{ fontSize:13, fontWeight:700, color:'#6b7280', margin:0 }}>Chia sẻ bài viết:</p>
                <div style={{ display:'flex', gap:8 }}>
                  {[
                    { label:'📋 Sao chép link', action:handleCopyLink, color:'#1a3a8f', bg:'#eff6ff', border:'#bfdbfe', done:copied },
                    { label:'📘 Facebook', action:()=>window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`,'_blank'), color:'#1877f2', bg:'#eff6ff', border:'#bfdbfe' },
                  ].map(btn=>(
                    <button key={btn.label} onClick={btn.action} className="share-btn"
                      style={{ padding:'8px 16px', border:`1.5px solid ${btn.border}`, borderRadius:8, background:btn.bg, cursor:'pointer', fontSize:13, fontFamily:'inherit', fontWeight:600, color:btn.done?'#166534':btn.color, transition:'all 0.15s' }}>
                      {btn.done ? '✅ Đã sao chép!' : btn.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Admin controls */}
              {canManage && (
                <div style={{ borderTop:'1.5px solid #f0f4f8', paddingTop:16, marginTop:16, display:'flex', gap:8, flexWrap:'wrap' }}>
                  <button onClick={()=>setShowEdit(true)}
                    style={{ padding:'8px 16px', border:'1.5px solid #e0e0e0', borderRadius:8, background:'#fff', cursor:'pointer', fontSize:13, fontFamily:'inherit', fontWeight:600, color:'#374151' }}>
                    ✏️ Chỉnh sửa
                  </button>
                  <button onClick={handleTogglePublish}
                    style={{ padding:'8px 16px', border:`1.5px solid ${news.published?'#fca5a5':'#86efac'}`, borderRadius:8, background:news.published?'#fef2f2':'#f0fdf4', cursor:'pointer', fontSize:13, fontFamily:'inherit', fontWeight:600, color:news.published?'#991b1b':'#166534' }}>
                    {news.published ? '📥 Thu hồi' : '📤 Xuất bản'}
                  </button>
                  <button onClick={handleToggleFeatured}
                    style={{ padding:'8px 16px', border:'1.5px solid #fde68a', borderRadius:8, background:news.featured?'#fffbeb':'#fff', cursor:'pointer', fontSize:13, fontFamily:'inherit', fontWeight:600, color:'#92400e' }}>
                    {news.featured ? '⭐ Bỏ nổi bật' : '☆ Đánh dấu nổi bật'}
                  </button>
                  <button onClick={()=>setShowDel(true)}
                    style={{ padding:'8px 16px', border:'1.5px solid #fca5a5', borderRadius:8, background:'#fef2f2', cursor:'pointer', fontSize:13, fontFamily:'inherit', fontWeight:600, color:'#e53e3e' }}>
                    🗑️ Xóa
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ── Sidebar ── */}
          <div>
            {/* Article info */}
            <div style={{ background:'#fff', borderRadius:14, border:'1.5px solid #e8ecf0', padding:'18px', marginBottom:20, boxShadow:'0 1px 4px rgba(0,0,0,0.05)', animation:'fadeInUp 0.3s ease 0.1s both' }}>
              <p style={{ fontSize:13, fontWeight:800, color:'#1a202c', margin:'0 0 14px' }}>📋 Thông tin bài viết</p>
              {[
                ['Danh mục', CAT_LABEL[cat]||cat],
                ['Ngày đăng', timeAgo(news.publishedAt||news.createdAt)],
                ['Lượt xem', (news.viewCount||0).toLocaleString()],
                ['Thời gian đọc', `~${readMinutes} phút`],
                ['Tác giả', news.authorName||'—'],
                ['Trạng thái', news.published?'✅ Đã xuất bản':'📝 Bản nháp'],
              ].map(([l,v],i)=>(
                <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:i<5?'1px solid #f0f4f8':'none', gap:8 }}>
                  <span style={{ fontSize:12, color:'#9ca3af', flexShrink:0 }}>{l}</span>
                  <span style={{ fontSize:12, fontWeight:600, color:'#374151', textAlign:'right' }}>{v}</span>
                </div>
              ))}
            </div>

            {/* Related news */}
            {related.length > 0 && (
              <div style={{ background:'#fff', borderRadius:14, border:'1.5px solid #e8ecf0', padding:'18px', boxShadow:'0 1px 4px rgba(0,0,0,0.05)', animation:'fadeInUp 0.3s ease 0.15s both' }}>
                <p style={{ fontSize:13, fontWeight:800, color:'#1a202c', margin:'0 0 14px' }}>📰 Bài tin liên quan</p>
                {related.map((r,i)=>(
                  <div key={r.id} className="rel-card"
                    onClick={()=>navigate(`/news/${r.id}`)}
                    style={{ padding:'11px 0', borderBottom:i<related.length-1?'1px solid #f0f4f8':'none', boxShadow:'none', background:'transparent', borderRadius:0 }}>
                    <p style={{ fontSize:13, fontWeight:600, color:'#1a202c', margin:'0 0 4px', lineHeight:1.35, overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>
                      {r.title}
                    </p>
                    <span style={{ fontSize:11, color:'#9ca3af' }}>{timeAgo(r.publishedAt||r.createdAt)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </PageContainer>

      <EditNewsModal open={showEdit} onClose={()=>setShowEdit(false)} news={news} onSaved={n=>setNews(prev=>({...prev,...n}))} />

      <Modal open={showDel} onClose={()=>setShowDel(false)} title="🗑️ Xác nhận xóa bài tin" width={420}>
        <div style={{ background:'#fef2f2', borderRadius:12, padding:16, marginBottom:20, border:'1px solid #fca5a5' }}>
          <p style={{ fontSize:14, color:'#991b1b', margin:0, lineHeight:1.6 }}>
            Bạn có chắc muốn xóa bài tin <strong>"{news.title}"</strong>? Hành động này <strong>không thể hoàn tác</strong>.
          </p>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <button onClick={()=>setShowDel(false)} style={GHOST_BTN}>Hủy</button>
          <Btn onClick={handleDelete} color="danger" style={{ flex:1 }}>🗑️ Xóa bài tin</Btn>
        </div>
      </Modal>
    </div>
  );
}

const LS = { display:'block', fontSize:11, fontWeight:700, color:'#6b7280', marginBottom:5, letterSpacing:0.4 };
const GHOST_BTN = { flex:1, padding:'11px', border:'1.5px solid #e0e0e0', borderRadius:10, background:'#fff', fontSize:14, cursor:'pointer', fontFamily:'inherit', fontWeight:600, color:'#555' };
