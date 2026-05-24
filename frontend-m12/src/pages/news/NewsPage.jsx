import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import { PageContainer, Empty, SkeletonCard, Modal, Btn } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { newsAPI } from '../../api/axios';
import { toast } from 'react-hot-toast';
import { Avatar } from '../../components/ui';

const CATEGORIES = [
  { id:'all',         label:'Tất cả',        icon:'🌐' },
  { id:'announcement',label:'Thông báo',      icon:'📢' },
  { id:'contest',     label:'Cuộc thi',       icon:'🏆' },
  { id:'achievement', label:'Thành tích',     icon:'🥇' },
  { id:'event',       label:'Sự kiện',        icon:'📅' },
  { id:'knowledge',   label:'Kiến thức',      icon:'📚' },
];

function timeAgo(d) {
  if (!d) return '';
  const s=(Date.now()-new Date(d))/1000;
  if (s<60)    return 'vừa xong';
  if (s<3600)  return `${Math.floor(s/60)} phút trước`;
  if (s<86400) return `${Math.floor(s/3600)} giờ trước`;
  if (s<604800)return `${Math.floor(s/86400)} ngày trước`;
  return new Date(d).toLocaleDateString('vi-VN',{day:'2-digit',month:'2-digit',year:'numeric'});
}

const CAT_COLOR = { announcement:'#1d4ed8', contest:'#92400e', achievement:'#166534', event:'#6d28d9', knowledge:'#374151', all:'#374151' };
const CAT_BG    = { announcement:'#eff6ff', contest:'#fffbeb', achievement:'#f0fdf4', event:'#f5f3ff', knowledge:'#f9fafb', all:'#f9fafb' };

/* ── CreateNewsModal (Teacher/Admin) ─────────────────────────── */
function CreateNewsModal({ open, onClose, onCreated }) {
  const [f, setF] = useState({ title:'', summary:'', content:'', category:'announcement', featured:false });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(()=>{ if(!open){ setF({title:'',summary:'',content:'',category:'announcement',featured:false}); setErrors({}); } },[open]);

  const submit = async () => {
    const e={};
    if (!f.title.trim())   e.title='Vui lòng nhập tiêu đề';
    if (!f.content.trim()) e.content='Vui lòng nhập nội dung';
    if (Object.keys(e).length){ setErrors(e); return; }
    setLoading(true);
    try {
      const res = await newsAPI.create(f);
      toast.success('Đã tạo bài tin! Xuất bản để hiển thị công khai.');
      onCreated(res.data);
      onClose();
    } catch(err){ toast.error(err?.response?.data?.message||'Tạo bài tin thất bại'); }
    finally { setLoading(false); }
  };

  const inp = (err)=>({ width:'100%', boxSizing:'border-box', padding:'11px 14px', border:`1.5px solid ${err?'#fca5a5':'#e5e7eb'}`, borderRadius:10, fontSize:14, outline:'none', fontFamily:'inherit', color:'#222', background:'#fafafa', transition:'border-color 0.15s' });
  const focus=e=>{e.target.style.borderColor='#1a3a8f';e.target.style.boxShadow='0 0 0 3px rgba(26,58,143,0.08)';};
  const blur=(err)=>e=>{e.target.style.borderColor=err?'#fca5a5':'#e5e7eb';e.target.style.boxShadow='none';};

  return (
    <Modal open={open} onClose={onClose} title="📰 Tạo bài tin mới" width={600}>
      <div style={{ marginBottom:14 }}>
        <label style={LS}>TIÊU ĐỀ *</label>
        <input value={f.title} onChange={e=>setF(p=>({...p,title:e.target.value}))} placeholder="Tiêu đề bài tin..." style={inp(errors.title)} onFocus={focus} onBlur={blur(errors.title)} />
        {errors.title && <p style={ERR}>{errors.title}</p>}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:14 }}>
        <div>
          <label style={LS}>DANH MỤC</label>
          <select value={f.category} onChange={e=>setF(p=>({...p,category:e.target.value}))} style={{ ...inp(false), cursor:'pointer' }}>
            {CATEGORIES.filter(c=>c.id!=='all').map(c=><option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
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
        <label style={LS}>TÓM TẮT (hiển thị trong danh sách)</label>
        <textarea value={f.summary} onChange={e=>setF(p=>({...p,summary:e.target.value}))} placeholder="Mô tả ngắn gọn về bài tin..." rows={2}
          style={{ ...inp(false), resize:'vertical', lineHeight:1.6 }} onFocus={focus} onBlur={blur(false)} />
      </div>

      <div style={{ marginBottom:20 }}>
        <label style={LS}>NỘI DUNG ĐẦY ĐỦ *</label>
        <textarea value={f.content} onChange={e=>setF(p=>({...p,content:e.target.value}))} placeholder="Nội dung chi tiết bài tin..." rows={8}
          style={{ ...inp(errors.content), resize:'vertical', minHeight:160, lineHeight:1.7 }} onFocus={focus} onBlur={blur(errors.content)} />
        {errors.content && <p style={ERR}>{errors.content}</p>}
      </div>

      <div style={{ background:'#eff6ff', border:'1px solid #bfdbfe', borderRadius:8, padding:'10px 14px', marginBottom:16, fontSize:13, color:'#1e40af' }}>
        💡 Bài tin sẽ ở trạng thái <strong>Bản nháp</strong>. Nhấn <strong>Xuất bản</strong> trong trang quản lý để công khai.
      </div>

      <div style={{ display:'flex', gap:10 }}>
        <button onClick={onClose} style={CANCEL_BTN}>Hủy</button>
        <Btn onClick={submit} loading={loading} color="primary" style={{ flex:2 }}>📰 Tạo bài tin</Btn>
      </div>
    </Modal>
  );
}

/* ── NewsCard ─────────────────────────────────────────────────── */
function NewsCard({ news, canManage, onTogglePublish, onToggleFeatured, onDelete }) {
  const navigate = useNavigate();
  const cat = CATEGORIES.find(c=>c.id===news.category)||CATEGORIES[0];

  return (
    <div onClick={()=>navigate(`/news/${news.id}`)}
      style={{ background:'#fff', borderRadius:14, border:'1.5px solid #e8ecf0', overflow:'hidden', cursor:'pointer',
        boxShadow: news.featured?'0 4px 16px rgba(245,158,11,0.12)':'0 1px 4px rgba(0,0,0,0.05)',
        transition:'box-shadow 0.18s, transform 0.18s', animation:'fadeInUp 0.3s ease',
        borderTop: news.featured?'3px solid #f59e0b':'3px solid transparent' }}
      onMouseEnter={e=>{e.currentTarget.style.boxShadow='0 8px 28px rgba(0,0,0,0.10)';e.currentTarget.style.transform='translateY(-3px)';}}
      onMouseLeave={e=>{e.currentTarget.style.boxShadow=news.featured?'0 4px 16px rgba(245,158,11,0.12)':'0 1px 4px rgba(0,0,0,0.05)';e.currentTarget.style.transform='';}}>

      {/* Thumbnail placeholder */}
      <div style={{ height:140, background:`linear-gradient(135deg,${CAT_BG[news.category]||'#f9fafb'},#e8ecf0)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:48, position:'relative' }}>
        {cat.icon}
        <div style={{ position:'absolute', top:10, left:10, display:'flex', gap:6 }}>
          <span style={{ background:CAT_BG[news.category]||'#f9fafb', color:CAT_COLOR[news.category]||'#374151', fontSize:11, fontWeight:700, padding:'3px 9px', borderRadius:20 }}>{cat.icon} {cat.label}</span>
          {news.featured && <span style={{ background:'#fffbeb', color:'#92400e', fontSize:11, fontWeight:700, padding:'3px 9px', borderRadius:20, border:'1px solid #fde68a' }}>⭐ Nổi bật</span>}
          {!news.published && <span style={{ background:'#f9fafb', color:'#6b7280', fontSize:11, fontWeight:700, padding:'3px 9px', borderRadius:20 }}>📝 Nháp</span>}
        </div>
      </div>

      <div style={{ padding:'16px 18px' }}>
        <h3 style={{ fontSize:15, fontWeight:700, color:'#1a202c', margin:'0 0 7px', lineHeight:1.35, overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>
          {news.title}
        </h3>
        {news.summary && (
          <p style={{ fontSize:13, color:'#718096', margin:'0 0 12px', lineHeight:1.5, overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>
            {news.summary}
          </p>
        )}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <Avatar src={news.authorAvatar} name={news.authorName} size={22} />
            <span style={{ fontSize:11, color:'#9ca3af' }}>{news.authorName} · {timeAgo(news.publishedAt||news.createdAt)}</span>
          </div>
          <span style={{ fontSize:11, color:'#9ca3af' }}>👁 {news.viewCount||0}</span>
        </div>

        {canManage && (
          <div style={{ display:'flex', gap:6, marginTop:12, paddingTop:10, borderTop:'1px solid #f0f4f8' }} onClick={e=>e.stopPropagation()}>
            <button onClick={()=>onTogglePublish(news.id, news.published)}
              style={{ flex:1, padding:'6px', border:`1px solid ${news.published?'#fca5a5':'#86efac'}`, borderRadius:7, background:news.published?'#fef2f2':'#f0fdf4', cursor:'pointer', fontSize:12, fontFamily:'inherit', fontWeight:600, color:news.published?'#991b1b':'#166534' }}>
              {news.published?'📥 Thu hồi':'📤 Xuất bản'}
            </button>
            <button onClick={()=>onToggleFeatured(news.id, news.featured)}
              style={{ padding:'6px 10px', border:'1px solid #fde68a', borderRadius:7, background:news.featured?'#fffbeb':'#fff', cursor:'pointer', fontSize:12, fontFamily:'inherit', color:'#92400e' }}
              title={news.featured?'Bỏ nổi bật':'Đánh dấu nổi bật'}>
              {news.featured?'⭐':'☆'}
            </button>
            <button onClick={()=>onDelete(news.id)}
              style={{ padding:'6px 10px', border:'1px solid #fca5a5', borderRadius:7, background:'#fef2f2', cursor:'pointer', fontSize:12, color:'#e53e3e' }}
              title="Xóa bài tin">🗑️</button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── FeaturedBanner ─────────────────────────────────────────── */
function FeaturedBanner({ news }) {
  const navigate = useNavigate();
  if (!news) return null;
  const cat = CATEGORIES.find(c=>c.id===news.category)||CATEGORIES[0];
  return (
    <div onClick={()=>navigate(`/news/${news.id}`)}
      style={{ background:'linear-gradient(135deg,#1a3a8f 0%,#1a7a4a 100%)', borderRadius:18, padding:'36px 48px', marginBottom:28, cursor:'pointer', boxShadow:'0 8px 28px rgba(26,58,143,0.22)', position:'relative', overflow:'hidden', transition:'transform 0.2s, box-shadow 0.2s' }}
      onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='0 14px 40px rgba(26,58,143,0.28)';}}
      onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow='0 8px 28px rgba(26,58,143,0.22)';}}>
      <div style={{ position:'absolute', top:-40, right:80, width:200, height:200, borderRadius:'50%', background:'rgba(255,255,255,0.05)', pointerEvents:'none' }} />
      <div style={{ position:'absolute', bottom:-60, right:-20, width:240, height:240, borderRadius:'50%', background:'rgba(255,255,255,0.04)', pointerEvents:'none' }} />
      <div style={{ zIndex:1, maxWidth:600 }}>
        <div style={{ display:'flex', gap:8, marginBottom:12 }}>
          <span style={{ background:'#f59e0b', color:'#fff', fontSize:11, fontWeight:800, padding:'3px 12px', borderRadius:20 }}>⭐ NỔI BẬT</span>
          <span style={{ background:'rgba(255,255,255,0.15)', color:'#fff', fontSize:11, fontWeight:700, padding:'3px 12px', borderRadius:20 }}>{cat.icon} {cat.label}</span>
        </div>
        <h2 style={{ color:'#fff', fontSize:24, fontWeight:900, margin:'0 0 10px', lineHeight:1.3, letterSpacing:-0.3 }}>{news.title}</h2>
        {news.summary && <p style={{ color:'rgba(255,255,255,0.78)', fontSize:14, margin:'0 0 16px', lineHeight:1.6 }}>{news.summary}</p>}
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <Avatar src={news.authorAvatar} name={news.authorName} size={28} />
          <span style={{ color:'rgba(255,255,255,0.7)', fontSize:13 }}>{news.authorName} · {timeAgo(news.publishedAt||news.createdAt)}</span>
        </div>
      </div>
    </div>
  );
}

/* ── Main ────────────────────────────────────────────────────── */
export default function NewsPage() {
  const { user }  = useAuth();
  const [news, setNews]           = useState([]);
  const [featured, setFeatured]   = useState(null);
  const [loading, setLoading]     = useState(true);
  const [category, setCategory]   = useState('all');
  const [search, setSearch]       = useState('');
  const [searchQ, setSearchQ]     = useState('');
  const [page, setPage]           = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const canManage = ['TEACHER','MANAGER','ADMIN'].includes(user?.role);
  const timer = useRef(null);
  const PER = 9;

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const [newsRes, featRes] = await Promise.all([
        (canManage ? newsAPI.adminGetAll : newsAPI.getAll)({ category:category!=='all'?category:undefined, search:searchQ||undefined, page:page-1, size:PER }),
        page===1 ? newsAPI.getFeatured() : Promise.resolve({ data:null }),
      ]);
      const d = newsRes.data;
      const list = Array.isArray(d)?d:(d?.content||[]);
      setNews(list);
      setTotalPages(d?.totalPages||Math.ceil((d?.totalElements||list.length)/PER)||1);
      if (featRes.data) setFeatured(featRes.data);
    } catch { setNews([]); }
    finally { setLoading(false); }
  }, [category, searchQ, page, canManage]);

  useEffect(()=>{ fetch(); },[fetch]);

  const handleSearch = val => {
    setSearch(val);
    clearTimeout(timer.current);
    timer.current = setTimeout(()=>{ setSearchQ(val); setPage(1); }, 400);
  };

  const handleTogglePublish = async (id, published) => {
    try {
      await newsAPI.togglePublish(id);
      setNews(prev=>prev.map(n=>n.id===id?{...n,published:!published}:n));
      toast.success(published?'Đã thu hồi bài tin':'Đã xuất bản bài tin');
    } catch { toast.error('Thao tác thất bại'); }
  };

  const handleToggleFeatured = async (id, isFeatured) => {
    try {
      await newsAPI.toggleFeatured(id);
      setNews(prev=>prev.map(n=>n.id===id?{...n,featured:!isFeatured}:n));
      toast.success(isFeatured?'Đã bỏ nổi bật':'Đã đánh dấu nổi bật');
    } catch { toast.error('Thao tác thất bại'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa bài tin này?')) return;
    try {
      await newsAPI.delete(id);
      setNews(prev=>prev.filter(n=>n.id!==id));
      toast.success('Đã xóa bài tin');
    } catch { toast.error('Xóa thất bại'); }
  };

  const handleCreated = n => { setCategory('all'); setPage(1); };

  const pages = Math.min(totalPages, 7);

  return (
    <div style={{ minHeight:'100vh', background:'#f5f6fa', fontFamily:"'Be Vietnam Pro',sans-serif" }}>
      <style>{`@keyframes fadeInUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}.s-inp:focus{border-color:#1a3a8f!important;box-shadow:0 0 0 3px rgba(26,58,143,0.08)!important;outline:none;}`}</style>
      <Navbar />
      <PageContainer maxWidth={1100}>

        {/* Page header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
          <div>
            <h1 style={{ fontSize:22, fontWeight:900, color:'#1a202c', margin:'0 0 4px' }}>📰 Tin tức & Thông báo</h1>
            <p style={{ fontSize:14, color:'#9ca3af', margin:0 }}>Cập nhật mới nhất từ HUMG Olympic</p>
          </div>
          {canManage && (
            <button onClick={()=>setShowCreate(true)}
              style={{ padding:'11px 20px', background:'linear-gradient(90deg,#1a3a8f,#1a7a4a)', border:'none', borderRadius:10, color:'#fff', fontWeight:700, fontSize:14, cursor:'pointer', fontFamily:'inherit', boxShadow:'0 3px 12px rgba(26,58,143,0.25)', transition:'transform 0.15s' }}
              onMouseEnter={e=>e.currentTarget.style.transform='translateY(-1px)'}
              onMouseLeave={e=>e.currentTarget.style.transform=''}>
              + Tạo bài tin
            </button>
          )}
        </div>

        {/* Featured banner */}
        {page===1 && !search && category==='all' && featured && <FeaturedBanner news={featured} />}

        {/* Filters */}
        <div style={{ display:'flex', gap:10, marginBottom:24, alignItems:'center', flexWrap:'wrap' }}>
          <div style={{ display:'flex', gap:6, flex:1, flexWrap:'wrap' }}>
            {CATEGORIES.map(cat=>(
              <button key={cat.id} onClick={()=>{setCategory(cat.id);setPage(1);}}
                style={{ padding:'8px 16px', borderRadius:24, cursor:'pointer', fontFamily:'inherit', border:category===cat.id?'none':'1.5px solid #e0e0e0', background:category===cat.id?'#1a3a8f':'#fff', color:category===cat.id?'#fff':'#555', fontSize:13, fontWeight:category===cat.id?700:400, transition:'all 0.15s' }}>
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>
          <div style={{ position:'relative', minWidth:220 }}>
            <span style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'#aaa', fontSize:15 }}>🔍</span>
            <input className="s-inp" value={search} onChange={e=>handleSearch(e.target.value)} placeholder="Tìm kiếm tin tức..."
              style={{ width:'100%', boxSizing:'border-box', padding:'10px 14px 10px 40px', border:'1.5px solid #e5e7eb', borderRadius:10, fontSize:14, fontFamily:'inherit', background:'#fff' }} />
            {search && <button onClick={()=>{setSearch('');setSearchQ('');setPage(1);}} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#9ca3af', fontSize:18 }}>✕</button>}
          </div>
        </div>

        {/* Grid */}
        {loading
          ? <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:20 }}>{[1,2,3,4,5,6].map(i=><div key={i} style={{ background:'#fff', borderRadius:14, border:'1.5px solid #e8ecf0' }}><div style={{ height:140, background:'#f0f4f8', borderRadius:'14px 14px 0 0' }} /><SkeletonCard lines={2}/></div>)}</div>
          : news.length===0
            ? <Empty icon="📰" message={search?`Không tìm thấy tin tức cho "${search}"`:'Chưa có bài tin nào.'} />
            : (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:20, marginBottom:32 }}>
                {news.map(n=>(
                  <NewsCard key={n.id} news={n} canManage={canManage}
                    onTogglePublish={handleTogglePublish} onToggleFeatured={handleToggleFeatured} onDelete={handleDelete} />
                ))}
              </div>
            )
        }

        {/* Pagination */}
        {totalPages>1 && (
          <div style={{ display:'flex', justifyContent:'center', alignItems:'center', gap:8, marginTop:16 }}>
            <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1}
              style={{ width:36,height:36,borderRadius:8,border:'1.5px solid #e0e0e0',background:page===1?'#f5f5f5':'#fff',cursor:page===1?'not-allowed':'pointer',fontSize:16,display:'flex',alignItems:'center',justifyContent:'center' }}>←</button>
            {Array.from({length:pages},(_,i)=>{
              let pg; if(pages<=7)pg=i+1; else if(page<=4)pg=i+1; else if(page>=totalPages-3)pg=totalPages-6+i; else pg=page-3+i;
              return <button key={pg} onClick={()=>setPage(pg)} style={{ width:36,height:36,borderRadius:8,border:pg===page?'none':'1.5px solid #e0e0e0',background:pg===page?'#1a3a8f':'#fff',color:pg===page?'#fff':'#374151',fontWeight:pg===page?700:400,cursor:'pointer',fontSize:13,fontFamily:'inherit' }}>{pg}</button>;
            })}
            <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages}
              style={{ width:36,height:36,borderRadius:8,border:'1.5px solid #e0e0e0',background:page===totalPages?'#f5f5f5':'#fff',cursor:page===totalPages?'not-allowed':'pointer',fontSize:16,display:'flex',alignItems:'center',justifyContent:'center' }}>→</button>
          </div>
        )}
      </PageContainer>
      <CreateNewsModal open={showCreate} onClose={()=>setShowCreate(false)} onCreated={handleCreated} />
    </div>
  );
}

const LS = { display:'block', fontSize:11, fontWeight:700, color:'#6b7280', marginBottom:5, letterSpacing:0.4 };
const ERR = { color:'#e53e3e', fontSize:12, margin:'4px 0 0' };
const CANCEL_BTN = { flex:1, padding:'11px', border:'1.5px solid #e0e0e0', borderRadius:10, background:'#fff', fontSize:14, cursor:'pointer', fontFamily:'inherit', fontWeight:600, color:'#555' };
