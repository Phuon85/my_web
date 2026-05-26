import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import { PageContainer, Spinner, Btn, Modal, Empty } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { exerciseAPI } from '../../api/axios';
import { toast } from 'react-hot-toast';

// ── Constants ─────────────────────────────────────────────────────────────────
const Q_TYPES = [
  { id:'SINGLE',       label:'Trắc nghiệm 1 đáp án',    icon:'🔘', color:'#3b82f6' },
  { id:'MULTIPLE',     label:'Trắc nghiệm nhiều đáp án', icon:'☑️', color:'#8b5cf6' },
  { id:'SHORT_ANSWER', label:'Điền đáp án ngắn',          icon:'✏️', color:'#10b981' },
  { id:'ESSAY',        label:'Tự luận (chấm tay)',        icon:'📝', color:'#f59e0b' },
];

const LEVELS = [
  { id:'EASY',   label:'🟢 Cơ bản',    color:'#10b981', bg:'#f0fdf4' },
  { id:'MEDIUM', label:'🟡 Trung bình', color:'#f59e0b', bg:'#fffbeb' },
  { id:'HARD',   label:'🔴 Nâng cao',  color:'#e53e3e', bg:'#fef2f2' },
  { id:'EXPERT', label:'🟣 Chuyên gia', color:'#8b5cf6', bg:'#f5f3ff' },
];

const LETTERS = ['A','B','C','D','E','F'];

// ── Inline style helpers ──────────────────────────────────────────────────────
const fieldStyle = (err=false) => ({
  width:'100%', boxSizing:'border-box', padding:'10px 13px',
  border:`1.5px solid ${err?'#fca5a5':'#e5e7eb'}`, borderRadius:8,
  fontSize:14, outline:'none', fontFamily:'inherit', background:'#fafafa',
  transition:'border-color 0.15s',
});
const selStyle = { ...fieldStyle(), cursor:'pointer' };
const labelStyle = { fontSize:12, fontWeight:600, color:'#555', display:'block', marginBottom:4 };

// ── QuestionForm (create/edit) ────────────────────────────────────────────────
function QuestionForm({ initial, onSave, onCancel, isNew }) {
  const blank = { type:'SINGLE', level:'MEDIUM', content:'', choices:['','','',''], correctAnswer:'A', score:1, hint:'' };
  const [f, setF] = useState(initial || blank);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const setField = (key, val) => setF(p => ({ ...p, [key]: val }));

  const updateChoice = (i, val) => setF(p => ({ ...p, choices: p.choices.map((c,ci) => ci===i ? val : c) }));
  const addChoice    = () => setF(p => ({ ...p, choices: [...p.choices, ''] }));
  const removeChoice = (i) => setF(p => ({ ...p, choices: p.choices.filter((_,ci) => ci!==i) }));

  const toggleMultiCorrect = (letter) => {
    const cur = Array.isArray(f.correctAnswer) ? f.correctAnswer : [];
    setField('correctAnswer', cur.includes(letter) ? cur.filter(x=>x!==letter) : [...cur, letter]);
  };

  const validate = () => {
    const e = {};
    if (!f.content.trim()) e.content = 'Vui lòng nhập nội dung câu hỏi';
    if ((f.type==='SINGLE'||f.type==='MULTIPLE') && f.choices.some(c=>!c.trim())) e.choices = 'Vui lòng điền đầy đủ các đáp án';
    if (f.type==='SINGLE'  && !f.correctAnswer) e.correct = 'Chọn đáp án đúng';
    if (f.type==='MULTIPLE'&& (!Array.isArray(f.correctAnswer)||f.correctAnswer.length===0)) e.correct = 'Chọn ít nhất 1 đáp án đúng';
    if (f.type==='SHORT_ANSWER' && !f.correctAnswer?.trim()) e.correct = 'Nhập đáp án đúng';
    if (!f.score || f.score<=0) e.score = 'Điểm phải > 0';
    return e;
  };

  const handleSave = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);
    try { await onSave(f); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ background:'#fff', borderRadius:14, border:`2px solid ${isNew?'#3b82f6':'#e5e7eb'}`, padding:'20px 22px', marginBottom:12, boxShadow: isNew?'0 4px 20px rgba(59,130,246,0.12)':'none' }}>

      {/* Row 1: type + level + score */}
      <div style={{ display:'grid', gridTemplateColumns:'2fr 1.5fr 1fr', gap:10, marginBottom:14 }}>
        <div>
          <label style={labelStyle}>Loại câu hỏi *</label>
          <select style={selStyle} value={f.type}
            onChange={e => { const t=e.target.value; setField('type',t); setField('correctAnswer', t==='MULTIPLE'?[]:t==='ESSAY'?'':f.correctAnswer); }}>
            {Q_TYPES.map(t=><option key={t.id} value={t.id}>{t.icon} {t.label}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Mức độ *</label>
          <select style={selStyle} value={f.level} onChange={e=>setField('level',e.target.value)}>
            {LEVELS.map(l=><option key={l.id} value={l.id}>{l.label}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Điểm *</label>
          <input type="number" min={0.5} max={20} step={0.5}
            style={fieldStyle(!!errors.score)} value={f.score}
            onChange={e=>setField('score',Number(e.target.value))} />
          {errors.score && <p style={{ color:'#e53e3e', fontSize:11, margin:'2px 0 0' }}>{errors.score}</p>}
        </div>
      </div>

      {/* Content */}
      <div style={{ marginBottom:14 }}>
        <label style={labelStyle}>Nội dung câu hỏi *</label>
        <textarea rows={4} style={{ ...fieldStyle(!!errors.content), resize:'vertical', lineHeight:1.6 }}
          value={f.content} onChange={e=>setField('content',e.target.value)}
          placeholder={
            f.type==='ESSAY'        ? 'Nhập đề bài tự luận...' :
            f.type==='SHORT_ANSWER' ? 'Nhập câu hỏi. VD: Đạo hàm của x² là gì?' :
            'Nhập câu hỏi trắc nghiệm...'
          } />
        {errors.content && <p style={{ color:'#e53e3e', fontSize:11, margin:'2px 0 0' }}>{errors.content}</p>}
      </div>

      {/* URL ảnh (tùy chọn) */}
      <div style={{ marginBottom:14 }}>
        <label style={labelStyle}>URL hình ảnh (tùy chọn)</label>
        <input style={fieldStyle()} value={f.imageUrl||''} onChange={e=>setField('imageUrl',e.target.value)}
          placeholder="https://... (hình minh hoạ cho câu hỏi)" />
      </div>

      {/* ── CHOICES (quiz) ── */}
      {(f.type==='SINGLE' || f.type==='MULTIPLE') && (
        <div style={{ marginBottom:14 }}>
          <label style={labelStyle}>
            Các đáp án *
            {f.type==='MULTIPLE' && <span style={{ color:'#8b5cf6', marginLeft:6, fontWeight:400 }}>— Chọn nhiều đáp án đúng</span>}
          </label>
          {errors.choices && <p style={{ color:'#e53e3e', fontSize:11, margin:'0 0 6px' }}>{errors.choices}</p>}
          {errors.correct && <p style={{ color:'#e53e3e', fontSize:11, margin:'0 0 6px' }}>{errors.correct}</p>}

          {f.choices.map((ch, ci) => {
            const letter = LETTERS[ci];
            const isCorrect = f.type==='MULTIPLE'
              ? (Array.isArray(f.correctAnswer) && f.correctAnswer.includes(letter))
              : f.correctAnswer===letter;

            return (
              <div key={ci} style={{ display:'flex', gap:8, marginBottom:8, alignItems:'center' }}>
                {/* Correct toggle */}
                <button type="button"
                  onClick={() => f.type==='MULTIPLE' ? toggleMultiCorrect(letter) : setField('correctAnswer',letter)}
                  title={isCorrect ? 'Đáp án đúng' : 'Đánh dấu đúng'}
                  style={{ width:34, height:34, borderRadius:'50%', border:`2px solid ${isCorrect?'#10b981':'#e5e7eb'}`, background:isCorrect?'#10b981':'#fff', color:isCorrect?'#fff':'#888', fontWeight:800, fontSize:14, cursor:'pointer', flexShrink:0, transition:'all 0.15s', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  {letter}
                </button>

                {/* Choice input */}
                <input style={{ ...fieldStyle(), flex:1, marginBottom:0 }} value={ch}
                  onChange={e=>updateChoice(ci,e.target.value)}
                  placeholder={`Đáp án ${letter}...`} />

                {/* Remove */}
                {f.choices.length > 2 && (
                  <button type="button" onClick={()=>removeChoice(ci)}
                    style={{ padding:'6px 10px', background:'#fef2f2', border:'1px solid #fca5a5', borderRadius:6, color:'#e53e3e', cursor:'pointer', fontSize:13, flexShrink:0 }}>
                    ✕
                  </button>
                )}
              </div>
            );
          })}

          {f.choices.length < 6 && (
            <button type="button" onClick={addChoice}
              style={{ fontSize:13, color:'#3b82f6', background:'none', border:'1.5px dashed #93c5fd', borderRadius:8, padding:'7px 16px', cursor:'pointer', fontFamily:'inherit', marginTop:4 }}>
              + Thêm đáp án
            </button>
          )}

          <p style={{ fontSize:11, color:'#aaa', marginTop:8 }}>
            💡 {f.type==='SINGLE' ? 'Click chữ cái để chọn đáp án đúng' : 'Click chữ cái để chọn các đáp án đúng (có thể nhiều)'}
          </p>
        </div>
      )}

      {/* ── SHORT ANSWER ── */}
      {f.type==='SHORT_ANSWER' && (
        <div style={{ marginBottom:14 }}>
          <label style={labelStyle}>Đáp án đúng *</label>
          {errors.correct && <p style={{ color:'#e53e3e', fontSize:11, margin:'0 0 4px' }}>{errors.correct}</p>}
          <input style={fieldStyle(!!errors.correct)} value={f.correctAnswer||''}
            onChange={e=>setField('correctAnswer',e.target.value)}
            placeholder="VD: 3.14 · Paris · Hồ Chí Minh" />
          <p style={{ fontSize:11, color:'#aaa', marginTop:4 }}>Hệ thống so sánh tự động (không phân biệt hoa/thường)</p>
        </div>
      )}

      {/* ── ESSAY note ── */}
      {f.type==='ESSAY' && (
        <div style={{ background:'#fffbeb', border:'1px solid #fde68a', borderRadius:8, padding:'12px 14px', marginBottom:14, fontSize:13, color:'#92400e' }}>
          📝 Câu tự luận sẽ do giảng viên chấm thủ công. Điểm sẽ hiển thị sau khi giảng viên duyệt.
        </div>
      )}

      {/* Hint */}
      <div style={{ marginBottom:16 }}>
        <label style={labelStyle}>Gợi ý giải (hiển thị sau khi nộp bài)</label>
        <input style={fieldStyle()} value={f.hint||''} onChange={e=>setField('hint',e.target.value)}
          placeholder="Tùy chọn — Hướng dẫn hoặc công thức liên quan..." />
      </div>

      {/* Buttons */}
      <div style={{ display:'flex', gap:8, justifyContent:'flex-end', borderTop:'1px solid #f0f4f8', paddingTop:14 }}>
        <button type="button" onClick={onCancel}
          style={{ padding:'9px 18px', background:'#f5f6fa', border:'1.5px solid #e0e0e0', borderRadius:8, cursor:'pointer', fontSize:14, fontFamily:'inherit', color:'#555' }}>
          Hủy
        </button>
        <button type="button" onClick={handleSave} disabled={saving}
          style={{ padding:'9px 22px', background: saving?'#e0e0e0':'linear-gradient(90deg,#1a3a8f,#1a7a4a)', color: saving?'#aaa':'#fff', border:'none', borderRadius:8, fontWeight:700, fontSize:14, cursor:saving?'not-allowed':'pointer', fontFamily:'inherit', boxShadow:'0 3px 10px rgba(26,58,143,0.2)' }}>
          {saving ? '⏳ Đang lưu...' : isNew ? '✅ Thêm câu hỏi' : '💾 Lưu thay đổi'}
        </button>
      </div>
    </div>
  );
}

// ── Question item (display) ───────────────────────────────────────────────────
function QuestionItem({ q, idx, onEdit, onDelete, deleting }) {
  const qType = Q_TYPES.find(t => t.id === q.type) || Q_TYPES[0];
  const lvl   = LEVELS.find(l => l.id === q.level) || LEVELS[1];
  const LETTERS = ['A','B','C','D','E','F'];

  return (
    <div style={{ background:'#fff', borderRadius:12, border:'1.5px solid #e8ecf0', padding:'16px 20px', display:'flex', gap:14, alignItems:'flex-start' }}>
      {/* Number */}
      <div style={{ width:34, height:34, borderRadius:'50%', background:'#eff6ff', color:'#1a3a8f', fontWeight:800, fontSize:15, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
        {idx + 1}
      </div>

      {/* Content */}
      <div style={{ flex:1, minWidth:0 }}>
        {/* Badges */}
        <div style={{ display:'flex', gap:6, marginBottom:8, flexWrap:'wrap' }}>
          <span style={{ fontSize:11, padding:'2px 8px', borderRadius:10, background:`${qType.color}18`, color:qType.color, fontWeight:600 }}>
            {qType.icon} {qType.label}
          </span>
          <span style={{ fontSize:11, padding:'2px 8px', borderRadius:10, background:lvl.bg, color:lvl.color, fontWeight:700 }}>
            {lvl.label}
          </span>
          <span style={{ fontSize:11, padding:'2px 8px', borderRadius:10, background:'#f0fdf4', color:'#166534', fontWeight:600 }}>
            {q.score || 1} điểm
          </span>
        </div>

        {/* Question text */}
        <p style={{ fontSize:14, color:'#1a202c', margin:'0 0 8px', lineHeight:1.6, fontWeight:500,
          overflow:'hidden', display:'-webkit-box', WebkitLineClamp:3, WebkitBoxOrient:'vertical' }}>
          {q.content}
        </p>

        {/* Choices preview */}
        {(q.type==='SINGLE'||q.type==='MULTIPLE') && q.choices?.length > 0 && (
          <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginTop:6 }}>
            {q.choices.map((c, ci) => {
              const letter = LETTERS[ci];
              const isCorrect = Array.isArray(q.correctAnswer)
                ? q.correctAnswer.includes(letter)
                : q.correctAnswer === letter;
              return (
                <span key={ci} style={{ fontSize:11, padding:'2px 9px', borderRadius:8,
                  background: isCorrect ? '#f0fdf4' : '#f5f6fa',
                  color: isCorrect ? '#166534' : '#888',
                  border: `1px solid ${isCorrect ? '#86efac' : '#e5e7eb'}`,
                  fontWeight: isCorrect ? 700 : 400 }}>
                  {letter}. {c.length > 22 ? c.slice(0,22)+'…' : c}
                  {isCorrect && ' ✓'}
                </span>
              );
            })}
          </div>
        )}

        {q.type === 'SHORT_ANSWER' && q.correctAnswer && (
          <p style={{ fontSize:12, color:'#10b981', margin:'6px 0 0', fontWeight:600 }}>
            ✅ Đáp án: {q.correctAnswer}
          </p>
        )}

        {q.hint && (
          <p style={{ fontSize:12, color:'#f59e0b', margin:'4px 0 0' }}>
            💡 Gợi ý: {q.hint.length > 60 ? q.hint.slice(0,60)+'…' : q.hint}
          </p>
        )}
      </div>

      {/* Actions */}
      <div style={{ display:'flex', gap:6, flexShrink:0 }}>
        <button onClick={() => onEdit(idx)}
          style={{ padding:'7px 12px', background:'#f5f6fa', border:'1.5px solid #e0e0e0', borderRadius:8, fontSize:13, cursor:'pointer', fontFamily:'inherit', color:'#555' }}>
          ✏️
        </button>
        <button onClick={() => onDelete(idx)} disabled={deleting===idx}
          style={{ padding:'7px 12px', background:'#fef2f2', border:'1.5px solid #fca5a5', borderRadius:8, fontSize:13, cursor:'pointer', fontFamily:'inherit', color:'#e53e3e' }}>
          {deleting===idx ? '⏳' : '🗑️'}
        </button>
      </div>
    </div>
  );
}

// ── Exercise Edit Info Modal ──────────────────────────────────────────────────
function EditInfoModal({ open, onClose, exercise, onSaved }) {
  const SUBJECTS_OPT = [
    { id:'math',    label:'📐 Toán học' },
    { id:'physics', label:'⚛️ Vật lý' },
    { id:'chem',    label:'🧪 Hóa học' },
    { id:'english', label:'🌍 Ngoại ngữ' },
    { id:'it',      label:'💻 CNTT' },
  ];
  const [f, setF] = useState({ title:'', description:'', subject:'math', level:'MEDIUM', type:'QUIZ', durationMinutes:30 });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (exercise) setF({ title:exercise.title||'', description:exercise.description||'', subject:exercise.subject||'math', level:exercise.level||'MEDIUM', type:exercise.type||'QUIZ', durationMinutes:exercise.durationMinutes||30 });
  }, [exercise]);

  const save = async () => {
    setSaving(true);
    try {
      const res = await exerciseAPI.update(exercise.id, { ...f, durationMinutes:Number(f.durationMinutes) });
      toast.success('Đã lưu thông tin!');
      onSaved(res.data);
      onClose();
    } catch { toast.error('Lưu thất bại'); }
    finally { setSaving(false); }
  };

  if (!open) return null;
  return (
    <Modal open={open} onClose={onClose} title="✏️ Chỉnh sửa thông tin bài tập" width={520}>
      <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
        <div><label style={labelStyle}>Tiêu đề *</label><input style={fieldStyle()} value={f.title} onChange={e=>setF(p=>({...p,title:e.target.value}))} /></div>
        <div><label style={labelStyle}>Mô tả</label><textarea rows={3} style={{ ...fieldStyle(), resize:'vertical' }} value={f.description} onChange={e=>setF(p=>({...p,description:e.target.value}))} /></div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10 }}>
          <div>
            <label style={labelStyle}>Môn học</label>
            <select style={selStyle} value={f.subject} onChange={e=>setF(p=>({...p,subject:e.target.value}))}>
              {SUBJECTS_OPT.map(s=><option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Mức độ</label>
            <select style={selStyle} value={f.level} onChange={e=>setF(p=>({...p,level:e.target.value}))}>
              {LEVELS.map(l=><option key={l.id} value={l.id}>{l.label}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Thời gian (phút)</label>
            <input type="number" min={1} max={300} style={fieldStyle()} value={f.durationMinutes} onChange={e=>setF(p=>({...p,durationMinutes:e.target.value}))} />
          </div>
        </div>
        <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
          <Btn color="ghost" onClick={onClose}>Hủy</Btn>
          <Btn onClick={save} disabled={saving}>{saving?'⏳...':'💾 Lưu'}</Btn>
        </div>
      </div>
    </Modal>
  );
}

// ── Main Manage Page ──────────────────────────────────────────────────────────
export default function ExerciseManagePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [exercise,   setExercise]   = useState(null);
  const [questions,  setQuestions]  = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [editingIdx, setEditingIdx] = useState(null);  // index or 'new'
  const [deleting,   setDeleting]   = useState(null);
  const [showEdit,   setShowEdit]   = useState(false);
  const [publishing, setPublishing] = useState(false);

  const canManage = ['TEACHER','MANAGER','ADMIN'].includes(user?.role);

  const load = useCallback(() => {
    setLoading(true);
    exerciseAPI.getById(id)
      .then(r => { setExercise(r.data); setQuestions(r.data.questions || []); })
      .catch(() => toast.error('Không tải được bài tập'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { load(); }, [load]);

  if (!canManage) { navigate('/exercises'); return null; }

  const handleSaveQuestion = async (data, idx) => {
    try {
      if (idx === 'new') {
        const res = await exerciseAPI.addQuestion(id, data);
        setQuestions(p => [...p, res.data]);
        toast.success('✅ Đã thêm câu hỏi!');
      } else {
        const q = questions[idx];
        const res = await exerciseAPI.updateQuestion(id, q.id, data);
        setQuestions(p => p.map((qq, i) => i === idx ? res.data : qq));
        toast.success('✅ Đã cập nhật câu hỏi!');
      }
      setEditingIdx(null);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Lưu câu hỏi thất bại');
      throw err;
    }
  };

  const handleDelete = async (idx) => {
    if (!window.confirm('Xóa câu hỏi này?')) return;
    const q = questions[idx];
    setDeleting(idx);
    try {
      await exerciseAPI.deleteQuestion(id, q.id);
      setQuestions(p => p.filter((_, i) => i !== idx));
      toast.success('Đã xóa câu hỏi');
    } catch { toast.error('Xóa thất bại'); }
    finally { setDeleting(null); }
  };

  const handlePublish = async () => {
    setPublishing(true);
    try {
      await exerciseAPI.publish(id);
      setExercise(p => ({ ...p, isPublished: !p.isPublished }));
      toast.success(exercise.isPublished ? 'Đã chuyển về nháp' : '🎉 Đã xuất bản!');
    } catch { toast.error('Thất bại'); }
    finally { setPublishing(false); }
  };

  if (loading) return <div style={{ minHeight:'100vh', background:'#f5f6fa', fontFamily:"'Be Vietnam Pro',sans-serif" }}><Navbar /><Spinner /></div>;
  if (!exercise) return null;

  const totalScore = questions.reduce((s, q) => s + (q.score || 1), 0);
  const lvl  = LEVELS.find(l => l.id === exercise.level) || LEVELS[1];

  // Count by level
  const levelCount = LEVELS.reduce((acc, l) => {
    acc[l.id] = questions.filter(q => q.level === l.id).length;
    return acc;
  }, {});

  return (
    <div style={{ minHeight:'100vh', background:'#f5f6fa', fontFamily:"'Be Vietnam Pro',sans-serif" }}>
      <Navbar />
      <PageContainer maxWidth={900}>

        {/* ── Header ── */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20, gap:12, flexWrap:'wrap' }}>
          <div>
            <button onClick={() => navigate('/exercises')}
              style={{ background:'none', border:'none', color:'#888', fontSize:13, cursor:'pointer', fontFamily:'inherit', marginBottom:6, display:'flex', alignItems:'center', gap:4, padding:0 }}>
              ← Danh sách bài tập
            </button>
            <h1 style={{ fontSize:20, fontWeight:800, color:'#1a202c', margin:'0 0 4px' }}>⚙️ Quản lý: {exercise.title}</h1>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              <span style={{ fontSize:12, color:lvl.color, background:lvl.bg, padding:'2px 9px', borderRadius:10, fontWeight:700 }}>{lvl.label}</span>
              <span style={{ fontSize:12, color:'#888' }}>⏱️ {exercise.durationMinutes} phút</span>
              <span style={{ fontSize:12, color:'#888' }}>❓ {questions.length} câu</span>
              <span style={{ fontSize:12, color:'#888' }}>📊 {totalScore} điểm</span>
              <span style={{ fontSize:12, fontWeight:700, color: exercise.isPublished?'#10b981':'#f59e0b', background: exercise.isPublished?'#f0fdf4':'#fffbeb', padding:'2px 9px', borderRadius:10 }}>
                {exercise.isPublished ? '✅ Đã xuất bản' : '⏸ Nháp'}
              </span>
            </div>
          </div>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            <Btn color="ghost" small onClick={() => setShowEdit(true)}>✏️ Sửa thông tin</Btn>
            <Btn color="ghost" small onClick={() => navigate(`/exercises/${id}`)}>👁️ Xem trước</Btn>
            <button onClick={handlePublish} disabled={publishing}
              style={{ padding:'8px 16px', background: exercise.isPublished?'#fffbeb':'linear-gradient(90deg,#10b981,#1a7a4a)', color: exercise.isPublished?'#92400e':'#fff', border: exercise.isPublished?'1.5px solid #fde68a':'none', borderRadius:8, fontWeight:700, fontSize:13, cursor:'pointer', fontFamily:'inherit' }}>
              {publishing ? '⏳...' : exercise.isPublished ? '⏸ Về nháp' : '🚀 Xuất bản'}
            </button>
          </div>
        </div>

        {/* ── Stats row ── */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginBottom:20 }}>
          {LEVELS.map(l => (
            <div key={l.id} style={{ background:'#fff', borderRadius:10, padding:'12px 14px', border:'1.5px solid #e8ecf0', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ fontSize:12, color:l.color, fontWeight:700 }}>{l.label}</span>
              <span style={{ fontSize:20, fontWeight:800, color:'#1a202c' }}>{levelCount[l.id] || 0}</span>
            </div>
          ))}
        </div>

        {/* ── Add button + form ── */}
        {editingIdx !== 'new' && (
          <div style={{ textAlign:'right', marginBottom:14 }}>
            <button onClick={() => setEditingIdx('new')}
              style={{ display:'inline-flex', alignItems:'center', gap:8, background:'linear-gradient(90deg,#1a3a8f,#1a7a4a)', color:'#fff', border:'none', borderRadius:10, padding:'11px 22px', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'inherit', boxShadow:'0 3px 12px rgba(26,58,143,0.25)' }}>
              ➕ Thêm câu hỏi mới
            </button>
          </div>
        )}

        {editingIdx === 'new' && (
          <QuestionForm isNew
            onSave={d => handleSaveQuestion(d, 'new')}
            onCancel={() => setEditingIdx(null)} />
        )}

        {/* ── Questions list ── */}
        {questions.length === 0 && editingIdx !== 'new' ? (
          <div style={{ background:'#fff', borderRadius:14, padding:'56px 24px', textAlign:'center', border:'1.5px solid #e8ecf0', marginBottom:16 }}>
            <div style={{ fontSize:52, marginBottom:12 }}>❓</div>
            <h3 style={{ fontSize:16, fontWeight:700, color:'#1a202c', marginBottom:6 }}>Chưa có câu hỏi nào</h3>
            <p style={{ color:'#aaa', fontSize:14, marginBottom:20 }}>Thêm câu hỏi đầu tiên để bắt đầu xây dựng bài tập</p>
            <button onClick={() => setEditingIdx('new')}
              style={{ padding:'11px 28px', background:'linear-gradient(90deg,#1a3a8f,#1a7a4a)', color:'#fff', border:'none', borderRadius:10, fontWeight:700, fontSize:14, cursor:'pointer', fontFamily:'inherit' }}>
              ➕ Thêm câu hỏi đầu tiên
            </button>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {questions.map((q, i) => (
              editingIdx === i ? (
                <QuestionForm key={q.id || i} initial={q}
                  onSave={d => handleSaveQuestion(d, i)}
                  onCancel={() => setEditingIdx(null)} />
              ) : (
                <QuestionItem key={q.id || i} q={q} idx={i}
                  onEdit={setEditingIdx}
                  onDelete={handleDelete}
                  deleting={deleting} />
              )
            ))}
          </div>
        )}

        {/* ── Bottom add button ── */}
        {questions.length > 0 && editingIdx !== 'new' && (
          <div style={{ textAlign:'center', marginTop:16, paddingBottom:32 }}>
            <button onClick={() => { setEditingIdx('new'); window.scrollTo(0,0); }}
              style={{ padding:'10px 28px', border:'2px dashed #93c5fd', borderRadius:10, background:'#eff6ff', color:'#1d4ed8', fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>
              ➕ Thêm câu hỏi tiếp theo
            </button>
          </div>
        )}
      </PageContainer>

      <EditInfoModal
        open={showEdit}
        onClose={() => setShowEdit(false)}
        exercise={exercise}
        onSaved={(updated) => setExercise(updated)} />
    </div>
  );
}
