import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import { PageContainer, Empty, SkeletonCard, Modal, Btn, Card } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { exerciseAPI } from '../../api/axios';
import { toast } from 'react-hot-toast';

// ── Constants ─────────────────────────────────────────────────────────────────
const SUBJECTS = [
  { id:'all',     label:'Tất cả',    icon:'📚', color:'#6b7280', bg:'#f9fafb' },
  { id:'math',    label:'Toán học',  icon:'📐', color:'#3b82f6', bg:'#eff6ff' },
  { id:'physics', label:'Vật lý',    icon:'⚛️',  color:'#8b5cf6', bg:'#f5f3ff' },
  { id:'chem',    label:'Hóa học',   icon:'🧪', color:'#10b981', bg:'#f0fdf4' },
  { id:'english', label:'Ngoại ngữ', icon:'🌍', color:'#f59e0b', bg:'#fffbeb' },
  { id:'it',      label:'CNTT',      icon:'💻', color:'#e53e3e', bg:'#fef2f2' },
];

const LEVELS = [
  { id:'all',      label:'Tất cả mức độ', color:'#6b7280' },
  { id:'EASY',     label:'🟢 Cơ bản',      color:'#10b981' },
  { id:'MEDIUM',   label:'🟡 Trung bình',  color:'#f59e0b' },
  { id:'HARD',     label:'🔴 Nâng cao',    color:'#e53e3e' },
  { id:'EXPERT',   label:'🟣 Chuyên gia',  color:'#8b5cf6' },
];

const TYPES = [
  { id:'all',   label:'Tất cả loại' },
  { id:'QUIZ',  label:'Trắc nghiệm' },
  { id:'ESSAY', label:'Tự luận'     },
  { id:'MIXED', label:'Hỗn hợp'    },
];

const LEVEL_STYLE = {
  EASY:   { label:'🟢 Cơ bản',    color:'#10b981', bg:'#f0fdf4' },
  MEDIUM: { label:'🟡 Trung bình', color:'#f59e0b', bg:'#fffbeb' },
  HARD:   { label:'🔴 Nâng cao',  color:'#e53e3e', bg:'#fef2f2' },
  EXPERT: { label:'🟣 Chuyên gia', color:'#8b5cf6', bg:'#f5f3ff' },
};

const TYPE_LABEL = { QUIZ:'Trắc nghiệm', ESSAY:'Tự luận', MIXED:'Hỗn hợp' };

function timeAgo(d) {
  if (!d) return '';
  const s = (Date.now() - new Date(d)) / 1000;
  if (s < 60)    return 'vừa xong';
  if (s < 3600)  return `${Math.floor(s / 60)} phút trước`;
  if (s < 86400) return `${Math.floor(s / 3600)} giờ trước`;
  return new Date(d).toLocaleDateString('vi-VN');
}

// ── Create Exercise Modal ─────────────────────────────────────────────────────
function CreateExerciseModal({ open, onClose, onCreated }) {
  const [f, setF] = useState({
    title: '', description: '', subject: 'math',
    level: 'MEDIUM', type: 'QUIZ',
    durationMinutes: 30, isPublished: false,
  });
  const [loading, setLoading] = useState(false);
  const [errors,  setErrors]  = useState({});

  useEffect(() => {
    if (!open) {
      setF({ title:'', description:'', subject:'math', level:'MEDIUM', type:'QUIZ', durationMinutes:30, isPublished:false });
      setErrors({});
    }
  }, [open]);

  const submit = async () => {
    const e = {};
    if (!f.title.trim()) e.title = 'Vui lòng nhập tiêu đề';
    if (!f.durationMinutes || f.durationMinutes < 1) e.duration = 'Thời gian phải > 0';
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    try {
      const res = await exerciseAPI.create({ ...f, durationMinutes: Number(f.durationMinutes) });
      toast.success('✅ Tạo bài tập thành công!');
      onCreated(res.data);
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Tạo bài tập thất bại');
    } finally { setLoading(false); }
  };

  const inp  = (err) => ({ width:'100%', boxSizing:'border-box', padding:'10px 13px', border:`1.5px solid ${err?'#fca5a5':'#e5e7eb'}`, borderRadius:8, fontSize:14, outline:'none', fontFamily:'inherit', background:'#fafafa' });
  const selS = { ...inp(false), cursor:'pointer' };

  if (!open) return null;
  return (
    <Modal open={open} onClose={onClose} title="➕ Tạo bài tập mới" width={540}>
      <div style={{ display:'flex', flexDirection:'column', gap:14 }}>

        {/* Title */}
        <div>
          <label style={{ fontSize:12, fontWeight:600, color:'#555', display:'block', marginBottom:4 }}>Tiêu đề bài tập *</label>
          <input value={f.title} onChange={e=>setF(p=>({...p,title:e.target.value}))}
            style={inp(errors.title)} placeholder="VD: Đạo hàm cơ bản — Luyện tập bộ 1" />
          {errors.title && <p style={{ color:'#e53e3e', fontSize:12, marginTop:3 }}>{errors.title}</p>}
        </div>

        {/* Description */}
        <div>
          <label style={{ fontSize:12, fontWeight:600, color:'#555', display:'block', marginBottom:4 }}>Mô tả</label>
          <textarea value={f.description} onChange={e=>setF(p=>({...p,description:e.target.value}))}
            rows={3} style={{ ...inp(false), resize:'vertical' }}
            placeholder="Phạm vi kiến thức, hướng dẫn làm bài..." />
        </div>

        {/* Row: subject + level + type */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10 }}>
          <div>
            <label style={{ fontSize:12, fontWeight:600, color:'#555', display:'block', marginBottom:4 }}>Môn học</label>
            <select value={f.subject} onChange={e=>setF(p=>({...p,subject:e.target.value}))} style={selS}>
              {SUBJECTS.filter(s=>s.id!=='all').map(s=><option key={s.id} value={s.id}>{s.icon} {s.label}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize:12, fontWeight:600, color:'#555', display:'block', marginBottom:4 }}>Mức độ</label>
            <select value={f.level} onChange={e=>setF(p=>({...p,level:e.target.value}))} style={selS}>
              {LEVELS.filter(l=>l.id!=='all').map(l=><option key={l.id} value={l.id}>{l.label}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize:12, fontWeight:600, color:'#555', display:'block', marginBottom:4 }}>Loại bài</label>
            <select value={f.type} onChange={e=>setF(p=>({...p,type:e.target.value}))} style={selS}>
              {TYPES.filter(t=>t.id!=='all').map(t=><option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
          </div>
        </div>

        {/* Duration */}
        <div>
          <label style={{ fontSize:12, fontWeight:600, color:'#555', display:'block', marginBottom:4 }}>Thời gian làm bài (phút) *</label>
          <input type="number" min={1} max={300} value={f.durationMinutes}
            onChange={e=>setF(p=>({...p,durationMinutes:e.target.value}))}
            style={inp(errors.duration)} placeholder="30" />
          {errors.duration && <p style={{ color:'#e53e3e', fontSize:12, marginTop:3 }}>{errors.duration}</p>}
        </div>

        {/* Tip */}
        <div style={{ background:'#eff6ff', border:'1px solid #bfdbfe', borderRadius:8, padding:'10px 14px', fontSize:13, color:'#1e40af' }}>
          💡 Sau khi tạo, bạn sẽ được chuyển đến trang quản lý câu hỏi để thêm nội dung.
        </div>

        <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
          <Btn color="ghost" onClick={onClose}>Hủy</Btn>
          <Btn onClick={submit} disabled={loading}>{loading ? '⏳ Đang tạo...' : '✅ Tạo bài tập'}</Btn>
        </div>
      </div>
    </Modal>
  );
}

// ── Exercise Card ─────────────────────────────────────────────────────────────
function ExerciseCard({ ex, onManage, canManage }) {
  const navigate  = useNavigate();
  const subj = SUBJECTS.find(s => s.id === ex.subject) || SUBJECTS[0];
  const lvl  = LEVEL_STYLE[ex.level] || LEVEL_STYLE.MEDIUM;

  const pct = ex.myResult
    ? Math.round((ex.myResult.score / (ex.myResult.totalScore || 1)) * 100)
    : null;

  return (
    <div
      onClick={() => navigate(`/exercises/${ex.id}`)}
      style={{ background:'#fff', borderRadius:14, border:'1.5px solid #e8ecf0', cursor:'pointer', overflow:'hidden', transition:'all 0.15s', boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}
      onMouseEnter={e=>{ e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 8px 24px rgba(0,0,0,0.1)'; }}
      onMouseLeave={e=>{ e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='0 1px 4px rgba(0,0,0,0.05)'; }}
    >
      {/* Top accent strip */}
      <div style={{ height:4, background: pct !== null ? (pct>=80?'#10b981':pct>=50?'#f59e0b':'#e53e3e') : subj.color }} />

      <div style={{ padding:'18px 20px' }}>
        {/* Badges row */}
        <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:10 }}>
          <span style={{ fontSize:11, fontWeight:700, padding:'2px 9px', borderRadius:20, background:subj.bg, color:subj.color }}>
            {subj.icon} {subj.label}
          </span>
          <span style={{ fontSize:11, fontWeight:700, padding:'2px 9px', borderRadius:20, background:lvl.bg, color:lvl.color }}>
            {lvl.label}
          </span>
          {ex.type && (
            <span style={{ fontSize:11, fontWeight:600, padding:'2px 9px', borderRadius:20, background:'#f9fafb', color:'#6b7280' }}>
              {TYPE_LABEL[ex.type] || ex.type}
            </span>
          )}
          {!ex.isPublished && (
            <span style={{ fontSize:11, fontWeight:700, padding:'2px 9px', borderRadius:20, background:'#fffbeb', color:'#92400e' }}>
              ⏸ Nháp
            </span>
          )}
        </div>

        {/* Title */}
        <h3 style={{ fontSize:15, fontWeight:700, color:'#1a202c', margin:'0 0 6px', lineHeight:1.4 }}>{ex.title}</h3>
        {ex.description && (
          <p style={{ fontSize:13, color:'#718096', margin:'0 0 14px', lineHeight:1.5,
            overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>
            {ex.description}
          </p>
        )}

        {/* Stats */}
        <div style={{ display:'flex', gap:16, marginBottom:14, flexWrap:'wrap' }}>
          {[
            ['⏱️', `${ex.durationMinutes || 0} phút`],
            ['❓', `${ex.questionCount || 0} câu`],
            ['👥', `${ex.submissionCount || 0} lượt`],
          ].map(([icon, text]) => (
            <span key={text} style={{ fontSize:12, color:'#888', display:'flex', alignItems:'center', gap:4 }}>{icon} {text}</span>
          ))}
        </div>

        {/* My result bar */}
        {pct !== null && (
          <div style={{ marginBottom:14 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
              <span style={{ fontSize:12, color:'#888' }}>Kết quả của bạn</span>
              <span style={{ fontSize:12, fontWeight:700, color: pct>=80?'#10b981':pct>=50?'#f59e0b':'#e53e3e' }}>{pct}%</span>
            </div>
            <div style={{ background:'#f0f4f8', borderRadius:4, height:5, overflow:'hidden' }}>
              <div style={{ height:'100%', borderRadius:4, background: pct>=80?'#10b981':pct>=50?'#f59e0b':'#e53e3e', width:`${pct}%`, transition:'width 0.6s ease' }} />
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ display:'flex', gap:8, alignItems:'center', paddingTop:12, borderTop:'1px solid #f0f4f8' }}>
          <button
            onClick={e => { e.stopPropagation(); navigate(`/exercises/${ex.id}`); }}
            style={{ flex:1, padding:'9px', background:'linear-gradient(90deg,#1a3a8f,#1a7a4a)', color:'#fff', border:'none', borderRadius:8, fontWeight:700, fontSize:13, cursor:'pointer', fontFamily:'inherit' }}>
            {ex.myResult ? '🔁 Làm lại' : '▶️ Bắt đầu'}
          </button>
          {canManage && (
            <button
              onClick={e => { e.stopPropagation(); onManage(ex); }}
              style={{ padding:'9px 13px', background:'#f5f6fa', color:'#555', border:'1.5px solid #e0e0e0', borderRadius:8, fontSize:13, cursor:'pointer', fontFamily:'inherit' }}>
              ✏️
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ExerciseListPage() {
  const navigate  = useNavigate();
  const { user }  = useAuth();
  const [exercises,   setExercises]   = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [subject,     setSubject]     = useState('all');
  const [level,       setLevel]       = useState('all');
  const [type,        setType]        = useState('all');
  const [search,      setSearch]      = useState('');
  const [showCreate,  setShowCreate]  = useState(false);

  const canManage = ['TEACHER','MANAGER','ADMIN'].includes(user?.role);

  const load = useCallback(() => {
    setLoading(true);
    exerciseAPI.getAll({
      subject:  subject !== 'all' ? subject : undefined,
      level:    level   !== 'all' ? level   : undefined,
      type:     type    !== 'all' ? type    : undefined,
    })
      .then(r => setExercises(Array.isArray(r.data) ? r.data : (r.data?.content || [])))
      .catch(() => setExercises([]))
      .finally(() => setLoading(false));
  }, [subject, level, type]);

  useEffect(() => { load(); }, [load]);

  const filtered = search.trim()
    ? exercises.filter(e =>
        e.title?.toLowerCase().includes(search.toLowerCase()) ||
        e.description?.toLowerCase().includes(search.toLowerCase()))
    : exercises;

  // Stats summary
  const total    = exercises.length;
  const done     = exercises.filter(e => e.myResult).length;
  const avgScore = done === 0 ? 0 : Math.round(
    exercises.filter(e=>e.myResult).reduce((s,e)=> s + (e.myResult.score/(e.myResult.totalScore||1))*100, 0) / done
  );

  return (
    <div style={{ minHeight:'100vh', background:'#f5f6fa', fontFamily:"'Be Vietnam Pro',sans-serif" }}>
      <Navbar />
      <PageContainer maxWidth={1200}>

        {/* ── Header ── */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24, flexWrap:'wrap', gap:12 }}>
          <div>
            <h1 style={{ fontSize:24, fontWeight:800, color:'#1a202c', margin:'0 0 4px' }}>📚 Bài tập luyện tập</h1>
            <p style={{ color:'#888', fontSize:14, margin:0 }}>Ôn luyện kiến thức theo từng mức độ, chuẩn bị thi Olympic</p>
          </div>
          {canManage && (
            <button onClick={() => setShowCreate(true)}
              style={{ display:'flex', alignItems:'center', gap:8, background:'linear-gradient(90deg,#1a3a8f,#1a7a4a)', color:'#fff', border:'none', borderRadius:10, padding:'11px 22px', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'inherit', boxShadow:'0 3px 12px rgba(26,58,143,0.25)' }}>
              ➕ Tạo bài tập
            </button>
          )}
        </div>

        {/* ── Progress summary (student) ── */}
        {!canManage && total > 0 && (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:24 }}>
            {[
              { icon:'📝', label:'Tổng bài tập', val:total,    color:'#1a3a8f' },
              { icon:'✅', label:'Đã hoàn thành', val:done,    color:'#10b981' },
              { icon:'⭐', label:'Điểm TB',        val:`${avgScore}%`, color:'#f59e0b' },
            ].map(s=>(
              <div key={s.label} style={{ background:'#fff', borderRadius:12, padding:'16px 20px', border:'1.5px solid #e8ecf0', display:'flex', alignItems:'center', gap:14 }}>
                <span style={{ fontSize:28 }}>{s.icon}</span>
                <div>
                  <div style={{ fontSize:22, fontWeight:800, color:s.color }}>{s.val}</div>
                  <div style={{ fontSize:12, color:'#888', marginTop:2 }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Subject tabs ── */}
        <div style={{ display:'flex', gap:8, marginBottom:16, flexWrap:'wrap' }}>
          {SUBJECTS.map(s => (
            <button key={s.id} onClick={() => setSubject(s.id)}
              style={{ padding:'8px 16px', borderRadius:24, border: subject===s.id?'none':'1.5px solid #e0e0e0', background: subject===s.id ? s.color : '#fff', color: subject===s.id ? '#fff' : '#555', fontSize:13, fontWeight: subject===s.id ? 700 : 400, cursor:'pointer', fontFamily:'inherit', transition:'all 0.15s' }}>
              {s.icon} {s.label}
            </button>
          ))}
        </div>

        {/* ── Filter bar ── */}
        <div style={{ background:'#fff', borderRadius:12, padding:'14px 18px', marginBottom:20, border:'1.5px solid #e8ecf0', display:'flex', gap:10, flexWrap:'wrap', alignItems:'center' }}>
          {/* Search */}
          <div style={{ position:'relative', flex:'1 1 200px', minWidth:160 }}>
            <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'#bbb', fontSize:14, pointerEvents:'none' }}>🔍</span>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Tìm bài tập..."
              style={{ width:'100%', boxSizing:'border-box', padding:'9px 12px 9px 36px', border:'1.5px solid #e5e7eb', borderRadius:8, fontSize:13, outline:'none', fontFamily:'inherit', background:'#fafafa' }} />
          </div>

          {/* Level filter */}
          <select value={level} onChange={e=>setLevel(e.target.value)}
            style={{ padding:'9px 12px', border:'1.5px solid #e5e7eb', borderRadius:8, fontSize:13, outline:'none', fontFamily:'inherit', cursor:'pointer', background:'#fafafa' }}>
            {LEVELS.map(l=><option key={l.id} value={l.id}>{l.label}</option>)}
          </select>

          {/* Type filter */}
          <select value={type} onChange={e=>setType(e.target.value)}
            style={{ padding:'9px 12px', border:'1.5px solid #e5e7eb', borderRadius:8, fontSize:13, outline:'none', fontFamily:'inherit', cursor:'pointer', background:'#fafafa' }}>
            {TYPES.map(t=><option key={t.id} value={t.id}>{t.label}</option>)}
          </select>

          {/* Count */}
          <span style={{ fontSize:13, color:'#888', marginLeft:'auto' }}>
            {filtered.length} bài tập
          </span>
        </div>

        {/* ── Level legend ── */}
        <div style={{ display:'flex', gap:12, marginBottom:20, flexWrap:'wrap' }}>
          {Object.entries(LEVEL_STYLE).map(([key,s])=>(
            <span key={key} style={{ fontSize:12, color:s.color, background:s.bg, padding:'3px 10px', borderRadius:12, fontWeight:600 }}>{s.label}</span>
          ))}
        </div>

        {/* ── Grid ── */}
        {loading ? (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:16 }}>
            {[1,2,3,4,5,6].map(i=><SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <Empty icon="📝" message={search ? `Không tìm thấy bài tập nào cho "${search}"` : 'Chưa có bài tập nào trong mục này'} />
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:16 }}>
            {filtered.map(ex => (
              <ExerciseCard
                key={ex.id} ex={ex}
                canManage={canManage}
                onManage={() => navigate(`/exercises/${ex.id}/manage`)}
              />
            ))}
          </div>
        )}
      </PageContainer>

      <CreateExerciseModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={(ex) => {
          setExercises(p => [ex, ...p]);
          navigate(`/exercises/${ex.id}/manage`);
        }}
      />
    </div>
  );
}
