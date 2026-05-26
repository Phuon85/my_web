import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import { PageContainer, Spinner, Btn, Card } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { exerciseAPI } from '../../api/axios';
import { toast } from 'react-hot-toast';

const LEVEL_STYLE = {
  EASY:   { label:'🟢 Cơ bản',    color:'#10b981', bg:'#f0fdf4' },
  MEDIUM: { label:'🟡 Trung bình', color:'#f59e0b', bg:'#fffbeb' },
  HARD:   { label:'🔴 Nâng cao',  color:'#e53e3e', bg:'#fef2f2' },
  EXPERT: { label:'🟣 Chuyên gia', color:'#8b5cf6', bg:'#f5f3ff' },
};

// ── Countdown timer ───────────────────────────────────────────────────────────
function Countdown({ totalSeconds, onExpire }) {
  const [left, setLeft] = useState(totalSeconds);
  useEffect(() => {
    if (left <= 0) { onExpire(); return; }
    const t = setInterval(() => setLeft(p => {
      if (p <= 1) { clearInterval(t); onExpire(); return 0; }
      return p - 1;
    }), 1000);
    return () => clearInterval(t);
  // eslint-disable-next-line
  }, []);

  const h = Math.floor(left / 3600);
  const m = Math.floor((left % 3600) / 60);
  const s = left % 60;
  const urgent = left < 300; // last 5 min
  const critical = left < 60;

  return (
    <div style={{ display:'flex', alignItems:'center', gap:6, fontFamily:'monospace', fontWeight:800, fontSize:18,
      color: critical ? '#e53e3e' : urgent ? '#f59e0b' : '#1a3a8f',
      animation: critical && left % 2 === 0 ? 'blink 1s' : 'none' }}>
      <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
      ⏱️ {h > 0 && `${String(h).padStart(2,'0')}:`}{String(m).padStart(2,'0')}:{String(s).padStart(2,'0')}
    </div>
  );
}

// ── Question card ─────────────────────────────────────────────────────────────
function QuestionCard({ q, idx, total, answer, onChange, showResult }) {
  const letters = ['A','B','C','D','E','F'];

  const getChoiceStyle = (letter) => {
    if (!showResult) {
      const selected = q.type === 'MULTIPLE'
        ? (Array.isArray(answer) && answer.includes(letter))
        : answer === letter;
      return {
        bg:     selected ? '#eff6ff' : '#fafafa',
        border: selected ? '#3b82f6' : '#e5e7eb',
        fw:     selected ? 700 : 400,
      };
    }
    // Show result mode
    const correct  = Array.isArray(q.correctAnswer) ? q.correctAnswer.includes(letter) : q.correctAnswer === letter;
    const selected = Array.isArray(answer) ? answer.includes(letter) : answer === letter;
    if (correct)               return { bg:'#f0fdf4', border:'#86efac', fw:700 };
    if (selected && !correct)  return { bg:'#fef2f2', border:'#fca5a5', fw:600 };
    return { bg:'#fafafa', border:'#e5e7eb', fw:400 };
  };

  const isAnswered = answer !== undefined && answer !== '' && !(Array.isArray(answer) && answer.length === 0);

  // Score for this question in result
  let questionResult = null;
  if (showResult) {
    const correct = Array.isArray(q.correctAnswer)
      ? JSON.stringify([...q.correctAnswer].sort()) === JSON.stringify([...(Array.isArray(answer)?answer:[answer])].sort())
      : q.correctAnswer === answer;
    if (q.type !== 'ESSAY') questionResult = correct;
  }

  return (
    <div id={`q-${idx}`} style={{ background:'#fff', borderRadius:14, padding:'22px 24px', marginBottom:16,
      border:`1.5px solid ${showResult ? (questionResult===true?'#86efac':questionResult===false?'#fca5a5':'#e8ecf0') : (isAnswered?'#3b82f6':'#e8ecf0')}`,
      transition:'border-color 0.2s' }}>

      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ background: isAnswered&&!showResult ? '#1a3a8f' : '#f0f4f8', color: isAnswered&&!showResult ? '#fff' : '#888', width:32, height:32, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:14, flexShrink:0 }}>
            {idx+1}
          </span>
          <span style={{ fontSize:12, color:'#aaa' }}>/ {total} câu</span>
          {showResult && questionResult !== null && (
            <span style={{ fontSize:14 }}>{questionResult ? '✅' : '❌'}</span>
          )}
        </div>
        <span style={{ fontSize:12, color:'#888', background:'#f5f6fa', padding:'3px 10px', borderRadius:10 }}>
          {q.score || 1} điểm
          {q.type === 'MULTIPLE' && ' · Chọn nhiều'}
          {q.type === 'ESSAY'    && ' · Tự luận'}
        </span>
      </div>

      {/* Question content */}
      <p style={{ fontSize:15, color:'#1a202c', lineHeight:1.8, marginBottom:18, whiteSpace:'pre-wrap', fontWeight:500 }}>
        {q.content}
      </p>

      {/* Image if any */}
      {q.imageUrl && (
        <img src={q.imageUrl} alt="Hình minh hoạ" style={{ maxWidth:'100%', borderRadius:8, marginBottom:14, border:'1px solid #e0e0e0' }} />
      )}

      {/* ── QUIZ choices ── */}
      {(q.type === 'SINGLE' || q.type === 'MULTIPLE' || q.type === 'QUIZ') && q.choices?.length > 0 && (
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {q.choices.map((ch, ci) => {
            const letter = letters[ci];
            const st = getChoiceStyle(letter);
            const isCorrect = showResult && (Array.isArray(q.correctAnswer) ? q.correctAnswer.includes(letter) : q.correctAnswer===letter);
            return (
              <button key={ci} disabled={!!showResult}
                onClick={() => {
                  if (showResult) return;
                  if (q.type === 'MULTIPLE') {
                    const cur = Array.isArray(answer) ? answer : [];
                    onChange(cur.includes(letter) ? cur.filter(x=>x!==letter) : [...cur, letter]);
                  } else {
                    onChange(letter);
                  }
                }}
                style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px', background:st.bg, border:`1.5px solid ${st.border}`, borderRadius:10, cursor:showResult?'default':'pointer', textAlign:'left', fontFamily:'inherit', transition:'all 0.15s', width:'100%' }}>
                <span style={{ width:30, height:30, borderRadius:'50%', background:st.border==='#3b82f6'?'#3b82f6':st.border==='#86efac'?'#10b981':st.border==='#fca5a5'?'#e53e3e':'#e5e7eb', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:800, flexShrink:0 }}>
                  {letter}
                </span>
                <span style={{ fontSize:14, color:'#1a202c', fontWeight:st.fw, flex:1, lineHeight:1.5 }}>{ch}</span>
                {isCorrect && <span style={{ fontSize:12, color:'#10b981', fontWeight:700, flexShrink:0 }}>✓ Đúng</span>}
              </button>
            );
          })}
        </div>
      )}

      {/* ── Short answer ── */}
      {q.type === 'SHORT_ANSWER' && (
        <div>
          <input value={answer || ''} onChange={e => !showResult && onChange(e.target.value)}
            disabled={!!showResult} placeholder="Nhập đáp án của bạn..."
            style={{ width:'100%', boxSizing:'border-box', padding:'11px 14px',
              border:`1.5px solid ${showResult?(questionResult?'#86efac':'#fca5a5'):'#e5e7eb'}`,
              borderRadius:8, fontSize:14, outline:'none', fontFamily:'inherit', background: showResult?'#fafafa':'#fff' }} />
          {showResult && q.correctAnswer && (
            <p style={{ fontSize:13, color:'#10b981', marginTop:6 }}>✅ Đáp án: <strong>{q.correctAnswer}</strong></p>
          )}
        </div>
      )}

      {/* ── Essay ── */}
      {q.type === 'ESSAY' && (
        <div>
          <textarea value={answer || ''} onChange={e => !showResult && onChange(e.target.value)}
            disabled={!!showResult} rows={5} placeholder="Viết bài giải của bạn tại đây..."
            style={{ width:'100%', boxSizing:'border-box', padding:'11px 14px', border:'1.5px solid #e5e7eb', borderRadius:8, fontSize:14, outline:'none', fontFamily:'inherit', resize:'vertical' }} />
          {showResult && <p style={{ fontSize:12, color:'#888', marginTop:6 }}>📋 Câu tự luận sẽ được giảng viên chấm điểm thủ công.</p>}
        </div>
      )}

      {/* Hint (after submit) */}
      {showResult && q.hint && (
        <div style={{ marginTop:14, background:'#fffbeb', border:'1px solid #fde68a', borderRadius:8, padding:'10px 14px', fontSize:13, color:'#92400e' }}>
          💡 <strong>Gợi ý:</strong> {q.hint}
        </div>
      )}
    </div>
  );
}

// ── Result Panel ──────────────────────────────────────────────────────────────
function ResultPanel({ result, exercise, onReview, onRetry }) {
  const pct = result.totalScore > 0 ? Math.round((result.score / result.totalScore) * 100) : 0;
  const grade = pct >= 90 ? { label:'Xuất sắc 🏆',    color:'#f59e0b', bg:'linear-gradient(135deg,#fef9c3,#fffbeb)' }
              : pct >= 75 ? { label:'Giỏi 🎉',         color:'#10b981', bg:'linear-gradient(135deg,#d1fae5,#f0fdf4)' }
              : pct >= 60 ? { label:'Khá 👍',           color:'#3b82f6', bg:'linear-gradient(135deg,#dbeafe,#eff6ff)' }
              : pct >= 40 ? { label:'Trung bình 📚',    color:'#f97316', bg:'linear-gradient(135deg,#fed7aa,#fff7ed)' }
              :             { label:'Cần cố gắng hơn 💪', color:'#e53e3e', bg:'linear-gradient(135deg,#fecaca,#fef2f2)' };

  return (
    <div style={{ maxWidth:640, margin:'0 auto' }}>
      {/* Score card */}
      <div style={{ background:grade.bg, borderRadius:20, padding:40, textAlign:'center', marginBottom:20, border:'1.5px solid #e8ecf0' }}>
        {/* Circle score */}
        <div style={{ width:140, height:140, borderRadius:'50%', background:'#fff', margin:'0 auto 20px',
          display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
          boxShadow:`0 0 0 8px ${grade.color}22, 0 0 0 16px ${grade.color}11` }}>
          <span style={{ fontSize:36, fontWeight:800, color:grade.color }}>{pct}%</span>
          <span style={{ fontSize:12, color:'#888' }}>{result.score}/{result.totalScore}</span>
        </div>

        <h2 style={{ fontSize:22, fontWeight:800, color:'#1a202c', margin:'0 0 6px' }}>{grade.label}</h2>
        <p style={{ color:'#888', fontSize:14, margin:'0 0 24px' }}>
          Đúng {result.correctCount || 0}/{result.totalQuestion || 0} câu
          {result.timeSpent && ` · ${Math.floor(result.timeSpent/60)} phút ${result.timeSpent%60} giây`}
        </p>

        {/* Stats row */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12, marginBottom:24 }}>
          {[
            { label:'Điểm đạt', val:`${result.score}/${result.totalScore}`, color:grade.color },
            { label:'Câu đúng', val:`${result.correctCount||0}`, color:'#10b981' },
            { label:'Câu sai',  val:`${(result.totalQuestion||0)-(result.correctCount||0)}`, color:'#e53e3e' },
          ].map(s=>(
            <div key={s.label} style={{ background:'rgba(255,255,255,0.7)', borderRadius:10, padding:'12px 8px' }}>
              <div style={{ fontSize:20, fontWeight:800, color:s.color }}>{s.val}</div>
              <div style={{ fontSize:11, color:'#888', marginTop:2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display:'flex', gap:10, justifyContent:'center' }}>
          <Btn color="ghost" onClick={onReview}>📖 Xem lại đáp án</Btn>
          {exercise?.allowRetake !== false && <Btn color="amber" onClick={onRetry}>🔁 Làm lại</Btn>}
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ExerciseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [exercise,    setExercise]    = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [phase,       setPhase]       = useState('info');   // info | doing | result | review
  const [answers,     setAnswers]     = useState({});
  const [result,      setResult]      = useState(null);
  const [submitting,  setSubmitting]  = useState(false);
  const [warnCount,   setWarnCount]   = useState(0);
  const startTime = useRef(null);

  const canManage = ['TEACHER','MANAGER','ADMIN'].includes(user?.role);

  // Load exercise + check existing result
  useEffect(() => {
    setLoading(true);
    exerciseAPI.getById(id)
      .then(async r => {
        setExercise(r.data);
        try {
          const res = await exerciseAPI.myResult(id);
          if (res.data) { setResult(res.data); setPhase('result'); }
        } catch { /* no result yet */ }
      })
      .catch(() => toast.error('Không tải được bài tập'))
      .finally(() => setLoading(false));
  }, [id]);

  // Anti-cheat: tab visibility
  useEffect(() => {
    if (phase !== 'doing') return;
    const handler = () => {
      if (document.hidden) {
        setWarnCount(c => {
          const n = c + 1;
          if (n === 1) toast.error('⚠️ Cảnh báo 1/3: Rời trang bị ghi nhận!');
          if (n === 2) toast.error('⚠️ Cảnh báo 2/3: Lần nữa sẽ tự nộp bài!');
          if (n >= 3)  { toast.error('🚫 Đã rời trang 3 lần — bài tự nộp!'); handleSubmit(); }
          return n;
        });
      }
    };
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  // eslint-disable-next-line
  }, [phase]);

  // Anti-cheat: block copy/paste
  useEffect(() => {
    if (phase !== 'doing') return;
    const block = e => e.preventDefault();
    document.addEventListener('copy',  block);
    document.addEventListener('paste', block);
    document.addEventListener('cut',   block);
    return () => {
      document.removeEventListener('copy',  block);
      document.removeEventListener('paste', block);
      document.removeEventListener('cut',   block);
    };
  }, [phase]);

  const startExam = () => {
    setAnswers({});
    setResult(null);
    setWarnCount(0);
    startTime.current = Date.now();
    setPhase('doing');
    window.scrollTo(0,0);
  };

  const handleSubmit = useCallback(async (force = false) => {
    if (!force) {
      const qs = exercise?.questions || [];
      const answered = Object.keys(answers).filter(k => {
        const a = answers[k];
        return a !== undefined && a !== '' && !(Array.isArray(a) && a.length === 0);
      }).length;
      if (answered < qs.length) {
        const ok = window.confirm(`Bạn còn ${qs.length - answered} câu chưa trả lời. Nộp bài?`);
        if (!ok) return;
      }
    }
    setSubmitting(true);
    const timeSpent = startTime.current ? Math.round((Date.now() - startTime.current) / 1000) : 0;
    try {
      const res = await exerciseAPI.submit(id, { ...answers, _timeSpent: timeSpent });
      setResult(res.data);
      setPhase('result');
      toast.success('✅ Nộp bài thành công!');
      window.scrollTo(0,0);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Nộp bài thất bại');
    } finally { setSubmitting(false); }
  }, [id, answers, exercise]);

  if (loading) return <div style={{ minHeight:'100vh', background:'#f5f6fa', fontFamily:"'Be Vietnam Pro',sans-serif" }}><Navbar /><Spinner /></div>;
  if (!exercise) return <div style={{ minHeight:'100vh', background:'#f5f6fa', fontFamily:"'Be Vietnam Pro',sans-serif" }}><Navbar /><div style={{ textAlign:'center', padding:80, color:'#888', fontSize:16 }}>Không tìm thấy bài tập</div></div>;

  const questions = exercise.questions || [];
  const lvl = LEVEL_STYLE[exercise.level] || LEVEL_STYLE.MEDIUM;
  const answeredCount = Object.keys(answers).filter(k => {
    const a = answers[k];
    return a !== undefined && a !== '' && !(Array.isArray(a) && a.length === 0);
  }).length;

  // ── INFO ─────────────────────────────────────────────────────────────────────
  if (phase === 'info') return (
    <div style={{ minHeight:'100vh', background:'#f5f6fa', fontFamily:"'Be Vietnam Pro',sans-serif" }}>
      <Navbar />
      <PageContainer maxWidth={720}>
        <button onClick={() => navigate('/exercises')}
          style={{ background:'none', border:'none', color:'#888', fontSize:13, cursor:'pointer', fontFamily:'inherit', marginBottom:16, display:'flex', alignItems:'center', gap:4, padding:0 }}>
          ← Quay lại danh sách
        </button>

        <div style={{ background:'#fff', borderRadius:16, overflow:'hidden', border:'1.5px solid #e8ecf0', boxShadow:'0 2px 12px rgba(0,0,0,0.06)' }}>
          {/* Hero */}
          <div style={{ background:'linear-gradient(135deg,#1a3a8f,#1a7a4a)', padding:'28px 32px', color:'#fff' }}>
            <div style={{ display:'flex', gap:8, marginBottom:10, flexWrap:'wrap' }}>
              <span style={{ background:'rgba(255,255,255,0.2)', borderRadius:12, padding:'3px 12px', fontSize:12, fontWeight:600 }}>{lvl.label}</span>
              {exercise.type && <span style={{ background:'rgba(255,255,255,0.15)', borderRadius:12, padding:'3px 12px', fontSize:12 }}>{exercise.type}</span>}
            </div>
            <h1 style={{ fontSize:22, fontWeight:800, margin:'0 0 8px', lineHeight:1.3 }}>{exercise.title}</h1>
            {exercise.description && <p style={{ fontSize:14, color:'rgba(255,255,255,0.8)', margin:0, lineHeight:1.6 }}>{exercise.description}</p>}
          </div>

          <div style={{ padding:'28px 32px' }}>
            {/* Stats */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14, marginBottom:24 }}>
              {[
                ['⏱️', 'Thời gian', `${exercise.durationMinutes} phút`],
                ['❓', 'Số câu',    `${questions.length} câu`],
                ['📊', 'Tổng điểm', `${questions.reduce((s,q)=>s+(q.score||1),0)} điểm`],
              ].map(([icon,lbl,val])=>(
                <div key={lbl} style={{ background:'#f8fafc', borderRadius:10, padding:'16px', textAlign:'center' }}>
                  <div style={{ fontSize:24, marginBottom:4 }}>{icon}</div>
                  <div style={{ fontSize:11, color:'#888', marginBottom:2 }}>{lbl}</div>
                  <div style={{ fontSize:16, fontWeight:700, color:'#1a202c' }}>{val}</div>
                </div>
              ))}
            </div>

            {/* Warnings */}
            <div style={{ background:'#fef2f2', border:'1.5px solid #fecaca', borderRadius:10, padding:'14px 16px', marginBottom:20 }}>
              <p style={{ fontWeight:700, fontSize:13, color:'#991b1b', margin:'0 0 6px' }}>⚠️ Lưu ý quan trọng:</p>
              <ul style={{ margin:0, padding:'0 0 0 18px', fontSize:13, color:'#7f1d1d', lineHeight:1.8 }}>
                <li>Copy/Paste bị vô hiệu trong khi làm bài</li>
                <li>Chuyển tab / rời trang sẽ bị ghi lại — 3 lần → tự động nộp</li>
                <li>Hết giờ sẽ tự động nộp bài</li>
              </ul>
            </div>

            {/* Previous result */}
            {result && (
              <div style={{ background:'#f0fdf4', border:'1.5px solid #86efac', borderRadius:10, padding:'14px 16px', marginBottom:20, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <p style={{ fontWeight:700, fontSize:13, color:'#166534', margin:'0 0 2px' }}>✅ Bạn đã làm bài này</p>
                  <p style={{ fontSize:13, color:'#15803d', margin:0 }}>Điểm: {result.score}/{result.totalScore} · {Math.round((result.score/result.totalScore)*100)}%</p>
                </div>
                <Btn color="ghost" small onClick={() => setPhase('review')}>Xem lại</Btn>
              </div>
            )}

            <div style={{ display:'flex', gap:10 }}>
              <Btn color="ghost" onClick={() => navigate('/exercises')}>← Quay lại</Btn>
              {canManage && <Btn color="ghost" onClick={() => navigate(`/exercises/${id}/manage`)}>⚙️ Quản lý</Btn>}
              <Btn full onClick={startExam}>{result ? '🔁 Làm lại' : '▶️ Bắt đầu làm bài'}</Btn>
            </div>
          </div>
        </div>
      </PageContainer>
    </div>
  );

  // ── RESULT ───────────────────────────────────────────────────────────────────
  if (phase === 'result') return (
    <div style={{ minHeight:'100vh', background:'#f5f6fa', fontFamily:"'Be Vietnam Pro',sans-serif" }}>
      <Navbar />
      <PageContainer maxWidth={720}>
        <ResultPanel
          result={result}
          exercise={exercise}
          onReview={() => { setPhase('review'); window.scrollTo(0,0); }}
          onRetry={startExam}
        />
        <div style={{ textAlign:'center', marginTop:4 }}>
          <button onClick={() => navigate('/exercises')}
            style={{ background:'none', border:'none', color:'#888', fontSize:13, cursor:'pointer', fontFamily:'inherit' }}>
            ← Về danh sách bài tập
          </button>
        </div>
      </PageContainer>
    </div>
  );

  // ── REVIEW ───────────────────────────────────────────────────────────────────
  if (phase === 'review') return (
    <div style={{ minHeight:'100vh', background:'#f5f6fa', fontFamily:"'Be Vietnam Pro',sans-serif" }}>
      <Navbar />
      <PageContainer maxWidth={760}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20, flexWrap:'wrap', gap:10 }}>
          <h2 style={{ fontSize:18, fontWeight:800, color:'#1a202c', margin:0 }}>📖 Xem lại đáp án — {exercise.title}</h2>
          <div style={{ display:'flex', gap:8 }}>
            <Btn color="ghost" small onClick={() => setPhase('result')}>← Kết quả</Btn>
            {exercise?.allowRetake !== false && <Btn small color="amber" onClick={startExam}>🔁 Làm lại</Btn>}
          </div>
        </div>
        {questions.map((q, i) => (
          <QuestionCard key={q.id || i} q={q} idx={i} total={questions.length}
            answer={result?.answers?.[q.id]}
            onChange={() => {}}
            showResult={result} />
        ))}
      </PageContainer>
    </div>
  );

  // ── DOING (Focus mode) ────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight:'100vh', background:'#f0f4ff', fontFamily:"'Be Vietnam Pro',sans-serif" }}>
      {/* Sticky top bar */}
      <div style={{ background:'#1a202c', color:'#fff', padding:'0 24px', height:60, display:'flex', justifyContent:'space-between', alignItems:'center', position:'sticky', top:0, zIndex:200, boxShadow:'0 2px 12px rgba(0,0,0,0.3)' }}>
        <div>
          <p style={{ fontSize:14, fontWeight:700, margin:0 }}>{exercise.title}</p>
          <p style={{ fontSize:12, color:'rgba(255,255,255,0.5)', margin:0 }}>
            {answeredCount}/{questions.length} câu đã trả lời
            {warnCount > 0 && <span style={{ color:'#fca5a5', marginLeft:8 }}>⚠️ {warnCount} cảnh báo</span>}
          </p>
        </div>

        <div style={{ display:'flex', alignItems:'center', gap:20 }}>
          <Countdown totalSeconds={exercise.durationMinutes * 60} onExpire={() => handleSubmit(true)} />
          <button onClick={() => handleSubmit(false)} disabled={submitting}
            style={{ padding:'9px 22px', background:'linear-gradient(90deg,#f59e0b,#f97316)', color:'#fff', border:'none', borderRadius:8, fontWeight:800, fontSize:14, cursor:submitting?'not-allowed':'pointer', fontFamily:'inherit', boxShadow:'0 2px 8px rgba(249,115,22,0.4)' }}>
            {submitting ? '⏳...' : '📤 Nộp bài'}
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height:4, background:'#e5e7eb', position:'sticky', top:60, zIndex:199 }}>
        <div style={{ height:'100%', background:'linear-gradient(90deg,#1a3a8f,#10b981)', width:`${(answeredCount/Math.max(1,questions.length))*100}%`, transition:'width 0.3s' }} />
      </div>

      {/* Body */}
      <div style={{ maxWidth:760, margin:'0 auto', padding:'24px' }}>

        {/* Question navigator */}
        {questions.length > 1 && (
          <div style={{ background:'#fff', borderRadius:12, padding:'14px 18px', marginBottom:20, border:'1.5px solid #e8ecf0' }}>
            <p style={{ fontSize:12, color:'#888', margin:'0 0 10px', fontWeight:600 }}>ĐIỀU HƯỚNG CÂU HỎI</p>
            <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
              {questions.map((q,i) => {
                const a = answers[q.id];
                const ans = a !== undefined && a !== '' && !(Array.isArray(a) && a.length===0);
                return (
                  <button key={i} onClick={() => document.getElementById(`q-${i}`)?.scrollIntoView({ behavior:'smooth', block:'center' })}
                    style={{ width:34, height:34, borderRadius:8, border:'1.5px solid', borderColor:ans?'#1a3a8f':'#e5e7eb', background:ans?'#1a3a8f':'#fff', color:ans?'#fff':'#888', fontWeight:700, fontSize:13, cursor:'pointer', fontFamily:'inherit', transition:'all 0.15s' }}>
                    {i+1}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Questions */}
        {questions.length === 0 ? (
          <div style={{ background:'#fff', borderRadius:14, padding:40, textAlign:'center', color:'#aaa' }}>
            <div style={{ fontSize:48, marginBottom:12 }}>📋</div>
            <p>Bài tập chưa có câu hỏi nào</p>
          </div>
        ) : questions.map((q, i) => (
          <QuestionCard key={q.id || i} q={q} idx={i} total={questions.length}
            answer={answers[q.id]}
            onChange={v => setAnswers(p => ({ ...p, [q.id]: v }))}
            showResult={null} />
        ))}

        {/* Submit button bottom */}
        <div style={{ textAlign:'center', marginTop:8, paddingBottom:32 }}>
          <button onClick={() => handleSubmit(false)} disabled={submitting}
            style={{ padding:'14px 48px', background:'linear-gradient(90deg,#f59e0b,#f97316)', color:'#fff', border:'none', borderRadius:12, fontWeight:800, fontSize:16, cursor:submitting?'not-allowed':'pointer', fontFamily:'inherit', boxShadow:'0 4px 20px rgba(249,115,22,0.35)' }}>
            {submitting ? '⏳ Đang nộp...' : '📤 Nộp bài'}
          </button>
          <p style={{ fontSize:12, color:'#aaa', marginTop:8 }}>Đã trả lời {answeredCount}/{questions.length} câu</p>
        </div>
      </div>
    </div>
  );
}
