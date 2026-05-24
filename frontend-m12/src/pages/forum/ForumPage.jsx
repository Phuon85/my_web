import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import { PageContainer,  Empty, SkeletonCard, Modal, Btn } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { forumAPI } from '../../api/axios';
import { toast } from 'react-hot-toast';
import { Avatar } from '../../components/ui';

const CATEGORIES = [
  { id:'all',     label:'Tất cả',    icon:'🌐', color:'#6b7280' },
  { id:'math',    label:'Toán học',  icon:'📐', color:'#3b82f6' },
  { id:'physics', label:'Vật lý',    icon:'⚛️',  color:'#8b5cf6' },
  { id:'chem',    label:'Hóa học',   icon:'🧪', color:'#10b981' },
  { id:'english', label:'Ngoại ngữ',icon:'🌍', color:'#f59e0b' },
  { id:'it',      label:'CNTT',      icon:'💻', color:'#e53e3e' },
  { id:'general', label:'Chung',     icon:'💬', color:'#9ca3af' },
];
const SORT_OPT = [
  { value:'newest',     label:'Mới nhất' },
  { value:'popular',    label:'Nổi bật'  },
  { value:'unanswered', label:'Chưa trả lời' },
];
const CAT_BG = { math:'#eff6ff', physics:'#f5f3ff', chem:'#f0fdf4', english:'#fffbeb', it:'#fef2f2', general:'#f9fafb', all:'#f9fafb' };
const CAT_TC = { math:'#1d4ed8', physics:'#6d28d9', chem:'#166534', english:'#92400e', it:'#991b1b', general:'#374151', all:'#374151' };

function timeAgo(d) {
  if (!d) return '';
  const s = (Date.now()-new Date(d))/1000;
  if (s<60)    return 'vừa xong';
  if (s<3600)  return `${Math.floor(s/60)} phút trước`;
  if (s<86400) return `${Math.floor(s/3600)} giờ trước`;
  if (s<604800)return `${Math.floor(s/86400)} ngày trước`;
  return new Date(d).toLocaleDateString('vi-VN');
}

function CreateModal({ open, onClose, onCreated }) {
  const { user } = useAuth();
  const [f, setF] = useState({ title:'', content:'', category:'general', tags:'' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(()=>{ if (!open) { setF({title:'',content:'',category:'general',tags:''}); setErrors({}); } },[open]);

  const submit = async () => {
    const e = {};
    if (!f.title.trim())   e.title='Vui lòng nhập tiêu đề';
    if (!f.content.trim()) e.content='Vui lòng nhập nội dung';
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    try {
      const res = await forumAPI.create({ title:f.title.trim(), content:f.content.trim(), category:f.category, tags:f.tags.split(',').map(t=>t.trim()).filter(Boolean) });
      toast.success('Đăng bài thành công!');
      onCreated(res.data);
      onClose();
    } catch(err) { toast.error(err?.response?.data?.message||'Đăng bài thất bại'); }
    finally { setLoading(false); }
  };

  const inp = (err) => ({ width:'100%', boxSizing:'border-box', padding:'11px 14px', border:`1.5px solid ${err?'#fca5a5':'#e5e7eb'}`, borderRadius:10, fontSize:14, outline:'none', fontFamily:'inherit', color:'#222', background:'#fafafa', transition:'border-color 0.15s, box-shadow 0.15s' });
  const focus = e => { e.target.style.borderColor='#1a3a8f'; e.target.style.boxShadow='0 0 0 3px rgba(26,58,143,0.08)'; };
  const blur  = (hasErr) => e => { e.target.style.borderColor=hasErr?'#fca5a5':'#e5e7eb'; e.target.style.boxShadow='none'; };

  return (
    <Modal open={open} onClose={onClose} title="✍️ Tạo bài viết mới" width={560}>
      <div style={{ marginBottom:14 }}>
        <label style={LS}>TIÊU ĐỀ *</label>
        <input value={f.title} onChange={e=>setF(p=>({...p,title:e.target.value}))} placeholder="Tiêu đề câu hỏi hoặc chủ đề thảo luận..." style={inp(errors.title)} onFocus={focus} onBlur={blur(errors.title)} />
        {errors.title && <p style={ERR}>{errors.title}</p>}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:14 }}>
        <div>
          <label style={LS}>DANH MỤC</label>
          <select value={f.category} onChange={e=>setF(p=>({...p,category:e.target.value}))} style={{ ...inp(false), cursor:'pointer' }}>
            {CATEGORIES.filter(c=>c.id!=='all').map(c=><option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
          </select>
        </div>
        <div>
          <label style={LS}>TAGS (phân cách bằng dấu phẩy)</label>
          <input value={f.tags} onChange={e=>setF(p=>({...p,tags:e.target.value}))} placeholder="vd: ma trận, định thức" style={inp(false)} onFocus={focus} onBlur={blur(false)} />
        </div>
      </div>

      <div style={{ marginBottom:18 }}>
        <label style={LS}>NỘI DUNG *</label>
        <textarea value={f.content} onChange={e=>setF(p=>({...p,content:e.target.value}))}
          placeholder="Mô tả chi tiết. Dùng LaTeX: $E=mc^2$ cho inline, $$...$$ cho block" rows={6}
          style={{ ...inp(errors.content), resize:'vertical', minHeight:140, lineHeight:1.6 }} onFocus={focus} onBlur={blur(errors.content)} />
        {errors.content && <p style={ERR}>{errors.content}</p>}
        <p style={{ fontSize:11, color:'#9ca3af', margin:'4px 0 0' }}>💡 Hỗ trợ LaTeX: $...$ cho công thức inline, $$...$$ cho block display</p>
      </div>

      <div style={{ padding:'10px 14px', borderRadius:8, marginBottom:16, fontSize:13,
        background: user?.role==='STUDENT'?'#eff6ff':'#fffbeb',
        border: `1px solid ${user?.role==='STUDENT'?'#bfdbfe':'#fde68a'}`,
        color: user?.role==='STUDENT'?'#1e40af':'#92400e' }}>
        {user?.role==='STUDENT'
          ? 'ℹ️ Bài viết của bạn sẽ vào hàng chờ duyệt trước khi hiển thị công khai.'
          : `📌 Với vai trò ${user?.role}, bài viết sẽ được đăng ngay lập tức.`}
      </div>

      <div style={{ display:'flex', gap:10 }}>
        <button onClick={onClose} style={CANCEL_BTN}>Hủy</button>
        <Btn onClick={submit} loading={loading} color="primary" style={{ flex:2 }}>🚀 Đăng bài</Btn>
      </div>
    </Modal>
  );
}

function ThreadCard({ thread, onPin, onHide, canMod }) {
  const navigate = useNavigate();
  const cat = CATEGORIES.find(c=>c.id===thread.category)||CATEGORIES[0];
  return (
    <div onClick={()=>navigate(`/forum/${thread.id}`)}
      style={{ background:'#fff', borderRadius:14, border:'1.5px solid #e8ecf0', padding:'18px 20px', cursor:'pointer',
        boxShadow:thread.pinned?'0 2px 12px rgba(245,158,11,0.12)':'0 1px 4px rgba(0,0,0,0.05)',
        borderLeft:thread.pinned?'3px solid #f59e0b':'3px solid transparent',
        transition:'box-shadow 0.18s, transform 0.18s', animation:'fadeInUp 0.3s ease', position:'relative' }}
      onMouseEnter={e=>{ e.currentTarget.style.boxShadow='0 6px 24px rgba(0,0,0,0.10)'; e.currentTarget.style.transform='translateY(-2px)'; }}
      onMouseLeave={e=>{ e.currentTarget.style.boxShadow=thread.pinned?'0 2px 12px rgba(245,158,11,0.12)':'0 1px 4px rgba(0,0,0,0.05)'; e.currentTarget.style.transform=''; }}>

      {thread.pinned && <span style={{ position:'absolute', top:14, right:14, fontSize:11, fontWeight:700, color:'#92400e', background:'#fffbeb', padding:'2px 8px', borderRadius:20, border:'1px solid #fde68a' }}>📌 Đã ghim</span>}

      <div style={{ display:'flex', gap:14, alignItems:'flex-start' }}>
        <div style={{ flexShrink:0, width:52, textAlign:'center', background:thread.commentCount>0?'#f0fdf4':'#f9fafb', borderRadius:10, padding:'8px 4px', border:`1.5px solid ${thread.commentCount>0?'#86efac':'#e5e7eb'}` }}>
          <p style={{ fontSize:18, fontWeight:900, color:thread.commentCount>0?'#166534':'#9ca3af', margin:0, lineHeight:1 }}>{thread.commentCount||0}</p>
          <p style={{ fontSize:10, color:'#9ca3af', margin:'3px 0 0', fontWeight:600 }}>trả lời</p>
        </div>

        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:'flex', gap:7, alignItems:'center', marginBottom:6, flexWrap:'wrap' }}>
            <span style={{ background:CAT_BG[thread.category]||'#f9fafb', color:CAT_TC[thread.category]||'#374151', fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:20 }}>{cat.icon} {cat.label}</span>
            {(thread.tags||[]).slice(0,3).map(tag=><span key={tag} style={{ background:'#f1f5f9', color:'#64748b', fontSize:11, padding:'2px 8px', borderRadius:16 }}>#{tag}</span>)}
          </div>
          <h3 style={{ fontSize:15, fontWeight:700, color:'#1a202c', margin:'0 0 5px', lineHeight:1.35, overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>{thread.title}</h3>
          <p style={{ fontSize:13, color:'#718096', margin:'0 0 10px', lineHeight:1.5, overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>{thread.content}</p>

          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:8 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <Avatar src={thread.authorAvatar} name={thread.authorName} size={24} />
              <span style={{ fontSize:12, color:'#9ca3af' }}>
                <span style={{ fontWeight:600, color:'#4a5568' }}>{thread.authorName}</span>{' · '}{timeAgo(thread.createdAt)}
              </span>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <span style={{ fontSize:12, color:'#9ca3af' }}>👁 {thread.viewCount||0}</span>
              <span style={{ fontSize:12, color:'#9ca3af' }}>❤️ {thread.likeCount||0}</span>
              {canMod && (
                <div style={{ display:'flex', gap:4 }} onClick={e=>e.stopPropagation()}>
                  <button onClick={()=>onPin(thread.id)} title={thread.pinned?'Bỏ ghim':'Ghim'} style={MOD_BTN}>{thread.pinned?'📍':'📌'}</button>
                  <button onClick={()=>onHide(thread.id)} title={thread.hidden?'Hiện':'Ẩn'} style={{ ...MOD_BTN, color:'#e53e3e' }}>{thread.hidden?'👁':'🚫'}</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ForumPage() {
  const { user } = useAuth();
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('newest');
  const [search, setSearch] = useState('');
  const [searchQ, setSearchQ] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [stats, setStats] = useState({ total:0, today:0, members:0 });
  const timer = useRef(null);
  const canMod = ['TEACHER','MANAGER','ADMIN'].includes(user?.role);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await forumAPI.getThreads({ category:category!=='all'?category:undefined, sort, search:searchQ||undefined, page:page-1, size:10 });
      const d = res.data;
      const list = Array.isArray(d)?d:(d?.content||[]);
      setThreads(list);
      setTotalPages(d?.totalPages||Math.ceil((d?.totalElements||list.length)/10)||1);
      if (d?.stats) setStats(d.stats);
    } catch { setThreads([]); }
    finally { setLoading(false); }
  }, [category, sort, searchQ, page]);

  useEffect(() => { fetch(); }, [fetch]);

  const handleSearch = val => {
    setSearch(val);
    clearTimeout(timer.current);
    timer.current = setTimeout(()=>{ setSearchQ(val); setPage(1); }, 400);
  };

  const handlePin = async id => {
    try { await forumAPI.togglePin(id); setThreads(p=>p.map(t=>t.id===id?{...t,pinned:!t.pinned}:t)); toast.success('Cập nhật trạng thái ghim'); }
    catch { toast.error('Thao tác thất bại'); }
  };
  const handleHide = async id => {
    try { await forumAPI.toggleHide(id); setThreads(p=>p.map(t=>t.id===id?{...t,hidden:!t.hidden}:t)); toast.success('Cập nhật hiển thị'); }
    catch { toast.error('Thao tác thất bại'); }
  };
  const handleCreated = t => { if (page===1&&category==='all') setThreads(p=>[t,...p]); else { setCategory('all'); setPage(1); } };

  const pages = Math.min(totalPages, 7);

  return (
    <div style={{ minHeight:'100vh', background:'#f5f6fa', fontFamily:"'Be Vietnam Pro',sans-serif" }}>
      <style>{`
        @keyframes fadeInUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        .c-btn{transition:all 0.15s;border:none;cursor:pointer;font-family:inherit;width:100%;display:flex;align-items:center;gap:10px;padding:11px 16px;text-align:left;font-size:13px;}
        .c-btn:hover{background:#f5f7ff;}
        .s-inp{transition:border-color 0.15s,box-shadow 0.15s;}
        .s-inp:focus{border-color:#1a3a8f!important;box-shadow:0 0 0 3px rgba(26,58,143,0.08)!important;outline:none;}
      `}</style>
      <Navbar />
      <PageContainer maxWidth={1100}>

        {/* Hero */}
        <div style={{ background:'linear-gradient(135deg,#1a3a8f 0%,#1a7a4a 100%)', borderRadius:18, padding:'28px 36px', marginBottom:28, display:'flex', justifyContent:'space-between', alignItems:'center', boxShadow:'0 8px 28px rgba(26,58,143,0.22)', position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', top:-30, right:120, width:160, height:160, borderRadius:'50%', background:'rgba(255,255,255,0.05)', pointerEvents:'none' }} />
          <div style={{ zIndex:1 }}>
            <h1 style={{ color:'#fff', fontSize:22, fontWeight:900, margin:'0 0 6px', letterSpacing:-0.5 }}>💬 Diễn đàn HUMG Olympic</h1>
            <p style={{ color:'rgba(255,255,255,0.75)', fontSize:14, margin:'0 0 16px' }}>Nơi chia sẻ kiến thức, hỏi đáp và học hỏi lẫn nhau</p>
            <div style={{ display:'flex', gap:20 }}>
              {[['📝', stats.total||threads.length,'bài viết'],['💬',stats.today||0,'hôm nay'],['👥',stats.members||0,'thành viên']].map(([icon,val,label])=>(
                <div key={label}>
                  <p style={{ color:'#f59e0b', fontWeight:900, fontSize:18, margin:0 }}>{icon} {val}</p>
                  <p style={{ color:'rgba(255,255,255,0.6)', fontSize:11, margin:0 }}>{label}</p>
                </div>
              ))}
            </div>
          </div>
          <button onClick={()=>setShowCreate(true)}
            style={{ padding:'13px 24px', background:'#f59e0b', border:'none', borderRadius:12, color:'#fff', fontWeight:800, fontSize:14, cursor:'pointer', fontFamily:'inherit', boxShadow:'0 4px 16px rgba(245,158,11,0.4)', zIndex:1, transition:'transform 0.15s,box-shadow 0.15s' }}
            onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='0 8px 24px rgba(245,158,11,0.5)';}}
            onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow='0 4px 16px rgba(245,158,11,0.4)';}}>
            ✍️ Tạo bài viết
          </button>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'220px 1fr', gap:24 }}>
          {/* Sidebar */}
          <div>
            <div style={{ background:'#fff', borderRadius:14, border:'1.5px solid #e8ecf0', overflow:'hidden', marginBottom:16, boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
              <div style={{ padding:'14px 16px', borderBottom:'1px solid #f0f4f8', background:'#fafbff' }}>
                <p style={{ fontSize:13, fontWeight:800, color:'#1a202c', margin:0 }}>📂 Danh mục</p>
              </div>
              {CATEGORIES.map(cat=>{
                const active=category===cat.id;
                return (
                  <button key={cat.id} onClick={()=>{setCategory(cat.id);setPage(1);}} className="c-btn"
                    style={{ background:active?cat.color+'18':'transparent', borderLeft:active?`3px solid ${cat.color}`:'3px solid transparent', color:active?cat.color:'#6b7280', fontWeight:active?700:400 }}>
                    <span style={{ fontSize:16 }}>{cat.icon}</span>{cat.label}
                  </button>
                );
              })}
            </div>
            <div style={{ background:'#fff', borderRadius:14, border:'1.5px solid #e8ecf0', padding:16, boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
              <p style={{ fontSize:13, fontWeight:800, color:'#1a202c', margin:'0 0 10px' }}>📜 Nội quy</p>
              {['Tôn trọng ý kiến mọi người','Không đăng nội dung off-topic','Tiêu đề rõ ràng, cụ thể','Gắn tag môn học phù hợp','Không spam hoặc quảng cáo'].map((r,i)=>(
                <div key={i} style={{ display:'flex', gap:8, marginBottom:7, fontSize:12, color:'#555', lineHeight:1.4 }}>
                  <span style={{ color:'#10b981', fontWeight:700, flexShrink:0 }}>{i+1}.</span>{r}
                </div>
              ))}
            </div>
          </div>

          {/* Thread list */}
          <div>
            <div style={{ display:'flex', gap:10, marginBottom:16, alignItems:'center' }}>
              <div style={{ flex:1, position:'relative' }}>
                <span style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'#aaa', fontSize:15 }}>🔍</span>
                <input className="s-inp" value={search} onChange={e=>handleSearch(e.target.value)} placeholder="Tìm kiếm bài viết, câu hỏi..."
                  style={{ width:'100%', boxSizing:'border-box', padding:'11px 14px 11px 42px', border:'1.5px solid #e5e7eb', borderRadius:10, fontSize:14, fontFamily:'inherit', background:'#fff' }} />
                {search && <button onClick={()=>{setSearch('');setSearchQ('');setPage(1);}} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#9ca3af', fontSize:18 }}>✕</button>}
              </div>
              <select value={sort} onChange={e=>{setSort(e.target.value);setPage(1);}}
                style={{ padding:'11px 14px', border:'1.5px solid #e5e7eb', borderRadius:10, fontSize:13, fontFamily:'inherit', outline:'none', background:'#fff', cursor:'pointer' }}>
                {SORT_OPT.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            {loading
              ? <div style={{ display:'flex', flexDirection:'column', gap:10 }}>{[1,2,3,4].map(i=><div key={i} style={{ background:'#fff', borderRadius:14, border:'1.5px solid #e8ecf0' }}><SkeletonCard lines={2}/></div>)}</div>
              : threads.length===0
                ? <Empty icon="💬" message={search?`Không tìm thấy bài viết cho "${search}"`:'Chưa có bài viết nào. Hãy là người đầu tiên!'}
                    action={<button onClick={()=>setShowCreate(true)} style={{ marginTop:12, padding:'10px 20px', background:'linear-gradient(90deg,#1a3a8f,#1a7a4a)', border:'none', borderRadius:10, color:'#fff', fontWeight:700, cursor:'pointer', fontFamily:'inherit', fontSize:13 }}>✍️ Tạo bài đầu tiên</button>} />
                : <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                    {threads.map(t=><ThreadCard key={t.id} thread={t} onPin={handlePin} onHide={handleHide} canMod={canMod} />)}
                  </div>
            }

            {totalPages>1 && (
              <div style={{ display:'flex', justifyContent:'center', alignItems:'center', gap:8, marginTop:24 }}>
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
          </div>
        </div>
      </PageContainer>
      <CreateModal open={showCreate} onClose={()=>setShowCreate(false)} onCreated={handleCreated} />
    </div>
  );
}

const LS = { display:'block', fontSize:11, fontWeight:700, color:'#6b7280', marginBottom:5, letterSpacing:0.4 };
const ERR = { color:'#e53e3e', fontSize:12, margin:'4px 0 0' };
const MOD_BTN = { background:'#f9fafb', border:'1px solid #e5e7eb', borderRadius:6, cursor:'pointer', fontSize:15, padding:'3px 7px', transition:'background 0.12s' };
const CANCEL_BTN = { flex:1, padding:'11px', border:'1.5px solid #e0e0e0', borderRadius:10, background:'#fff', fontSize:14, cursor:'pointer', fontFamily:'inherit', fontWeight:600, color:'#555' };
