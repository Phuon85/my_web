import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { teamAPI } from '../../api/axios';
import Navbar from '../../components/layout/Navbar';

// ── Helpers ──────────────────────────────────────────────────────────────────
const SUBJECT_COLORS = {
  'Toán':    { bg: '#eff6ff', text: '#1d4ed8', dot: '#3b82f6' },
  'Tin học': { bg: '#f0fdf4', text: '#15803d', dot: '#22c55e' },
  'Vật lý':  { bg: '#fff7ed', text: '#c2410c', dot: '#f97316' },
  'Hóa học': { bg: '#fdf4ff', text: '#7e22ce', dot: '#a855f7' },
  'Tiếng Anh':{ bg: '#fefce8', text: '#a16207', dot: '#eab308' },
};
const subjectStyle = (s) => SUBJECT_COLORS[s] || { bg: '#f9fafb', text: '#374151', dot: '#6b7280' };

const SUBJECT_EMOJI = {
  'Toán': '📐', 'Tin học': '💻', 'Vật lý': '⚡', 'Hóa học': '🧪', 'Tiếng Anh': '🌍',
};
const subjectEmoji = s => SUBJECT_EMOJI[s] || '🏆';

function Avatar({ name, url, size = 48 }) {
  const initials = (name || '?').split(' ').slice(-2).map(w => w[0]).join('').toUpperCase();
  const colors   = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#ec4899'];
  const color    = colors[name ? name.charCodeAt(0) % colors.length : 0];
  return url ? (
    <img src={url} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} alt="" />
  ) : (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: color, color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.36, fontWeight: 700, flexShrink: 0, letterSpacing: -0.5,
    }}>{initials}</div>
  );
}

function TeamCard({ team, onClick }) {
  const ss = subjectStyle(team.subject);
  const [hov, setHov] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: '#fff',
        borderRadius: 16,
        border: `1.5px solid ${hov ? '#009688' : '#f0f0f0'}`,
        boxShadow: hov ? '0 8px 32px rgba(0,150,136,0.12)' : '0 2px 8px rgba(0,0,0,0.05)',
        padding: 24, cursor: 'pointer',
        transition: 'all 0.2s',
        transform: hov ? 'translateY(-3px)' : 'none',
        display: 'flex', flexDirection: 'column', gap: 16,
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        <div style={{
          width: 52, height: 52, borderRadius: 14,
          background: ss.bg, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26,
          border: `1.5px solid ${ss.dot}22`,
        }}>
          {subjectEmoji(team.subject)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{
            margin: 0, fontSize: 15, fontWeight: 700,
            color: '#1a202c', lineHeight: 1.4,
            display: '-webkit-box', WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>{team.name}</h3>
          {team.subject && (
            <span style={{
              display: 'inline-block', marginTop: 5,
              background: ss.bg, color: ss.text,
              fontSize: 11, fontWeight: 700,
              padding: '2px 10px', borderRadius: 20,
            }}>{team.subject}</span>
          )}
        </div>
      </div>

      {/* Desc */}
      {team.description && (
        <p style={{
          margin: 0, fontSize: 13, color: '#6b7280', lineHeight: 1.6,
          display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>{team.description}</p>
      )}

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#555' }}>
          <span>👥</span>
          <span style={{ fontWeight: 600 }}>{team.memberCount}</span>
          <span style={{ color: '#aaa' }}>thành viên</span>
        </div>
        {team.coachName && (
          <div style={{ fontSize: 12, color: '#888' }}>
            HLV: <strong style={{ color: '#555' }}>{team.coachName.split(' ').slice(-1)[0]}</strong>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Modal chi tiết đội tuyển ─────────────────────────────────────────────────
function TeamDetailModal({ teamId, onClose }) {
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!teamId) return;
    setLoading(true);
    teamAPI.getById(teamId)
      .then(r => setTeam(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [teamId]);

  if (!teamId) return null;

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: '#fff', borderRadius: 20,
        width: '100%', maxWidth: 680,
        maxHeight: '90vh', overflow: 'hidden',
        boxShadow: '0 24px 80px rgba(0,0,0,0.2)',
        display: 'flex', flexDirection: 'column',
      }}>
        {loading ? (
          <div style={{ padding: 60, textAlign: 'center', color: '#aaa' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
            <p style={{ fontSize: 14 }}>Đang tải...</p>
          </div>
        ) : !team ? (
          <div style={{ padding: 60, textAlign: 'center', color: '#aaa' }}>Không tìm thấy.</div>
        ) : (
          <>
            {/* Header */}
            <div style={{
              padding: '24px 28px 20px',
              background: 'linear-gradient(135deg,#0f2a6e,#1a4298)',
              color: '#fff',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: 16,
                    background: 'rgba(255,255,255,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28,
                  }}>{subjectEmoji(team.subject)}</div>
                  <div>
                    <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, lineHeight: 1.3 }}>{team.name}</h2>
                    {team.subject && (
                      <span style={{
                        display: 'inline-block', marginTop: 6,
                        background: 'rgba(255,255,255,0.2)', color: '#fff',
                        fontSize: 11, fontWeight: 700,
                        padding: '2px 10px', borderRadius: 20,
                      }}>{team.subject}</span>
                    )}
                  </div>
                </div>
                <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', fontSize: 16 }}>✕</button>
              </div>

              {team.description && (
                <p style={{ margin: '14px 0 0', fontSize: 13.5, color: 'rgba(255,255,255,0.8)', lineHeight: 1.6 }}>{team.description}</p>
              )}

              <div style={{ display: 'flex', gap: 20, marginTop: 14 }}>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>
                  👥 <strong style={{ color: '#fff' }}>{team.memberCount}</strong> thành viên
                </div>
                {team.coachName && (
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>
                    🎓 HLV: <strong style={{ color: '#fff' }}>{team.coachName}</strong>
                  </div>
                )}
              </div>
            </div>

            {/* Members */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 28px' }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#374151', margin: '0 0 14px', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Danh sách thành viên ({(team.members || []).length})
              </h3>

              {(!team.members || team.members.length === 0) ? (
                <div style={{ textAlign: 'center', padding: '32px 0', color: '#aaa' }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>👥</div>
                  <p style={{ fontSize: 14 }}>Chưa có thành viên.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {team.members.map(m => (
                    <div key={m.memberId} style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '12px 14px', borderRadius: 12,
                      background: m.memberRole === 'CAPTAIN' ? '#eff6ff' : '#f9fafb',
                      border: `1px solid ${m.memberRole === 'CAPTAIN' ? '#bfdbfe' : '#f0f0f0'}`,
                    }}>
                      <Avatar name={m.fullName} url={m.avatarUrl} size={40} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 14, fontWeight: 600, color: '#1a202c' }}>{m.fullName}</span>
                          {m.memberRole === 'CAPTAIN' && (
                            <span style={{ background: '#1d4ed8', color: '#fff', fontSize: 10, fontWeight: 700, padding: '1px 8px', borderRadius: 20 }}>
                              ĐỘI TRƯỞNG
                            </span>
                          )}
                        </div>
                        <p style={{ margin: '2px 0 0', fontSize: 12, color: '#888' }}>
                          {m.mssv ? `${m.mssv} · ` : ''}{m.email}
                          {m.khoa ? ` · ${m.khoa}` : ''}
                        </p>
                      </div>
                      {m.totalScore > 0 && (
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div style={{ fontSize: 15, fontWeight: 800, color: '#f59e0b' }}>⭐ {m.totalScore}</div>
                          <div style={{ fontSize: 10, color: '#aaa' }}>điểm</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function TeamPage() {
  const navigate  = useNavigate();
  const [teams, setTeams]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [subject, setSubject] = useState('');
  const [modalId, setModalId] = useState(null);

  useEffect(() => {
    teamAPI.getAll()
      .then(r => setTeams(r.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const subjects = [...new Set(teams.map(t => t.subject).filter(Boolean))];

  const filtered = teams.filter(t => {
    const matchSearch = !search || t.name.toLowerCase().includes(search.toLowerCase()) || (t.subject || '').toLowerCase().includes(search.toLowerCase());
    const matchSubject = !subject || t.subject === subject;
    return matchSearch && matchSubject;
  });

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'Be Vietnam Pro',sans-serif" }}>
      <Navbar />

      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg,#0f2a6e 0%,#1a4298 60%,#0d7377 100%)',
        padding: '48px 32px 40px', color: '#fff', textAlign: 'center',
      }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🏆</div>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, letterSpacing: -0.5 }}>Đội tuyển Olympic</h1>
        <p style={{ margin: '10px 0 0', color: 'rgba(255,255,255,0.75)', fontSize: 15 }}>
          Các đội tuyển tham gia cuộc thi Olympic của trường HUMG
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginTop: 24 }}>
          {[
            { label: 'Đội tuyển', value: teams.length },
            { label: 'Thành viên', value: teams.reduce((s, t) => s + (t.memberCount || 0), 0) },
            { label: 'Môn thi', value: subjects.length },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#f59e0b' }}>{s.value}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
        {/* Filters */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1', minWidth: 220 }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#aaa', fontSize: 15 }}>🔍</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Tìm đội tuyển..."
              style={{
                width: '100%', boxSizing: 'border-box',
                padding: '10px 12px 10px 36px',
                border: '1.5px solid #e5e7eb', borderRadius: 10,
                fontSize: 14, fontFamily: 'inherit', outline: 'none',
                background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
              }}
              onFocus={e => e.target.style.borderColor = '#009688'}
              onBlur={e => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['', ...subjects].map(s => (
              <button key={s} onClick={() => setSubject(s)} style={{
                padding: '8px 16px', borderRadius: 20,
                border: `1.5px solid ${subject === s ? '#009688' : '#e5e7eb'}`,
                background: subject === s ? '#009688' : '#fff',
                color: subject === s ? '#fff' : '#555',
                fontSize: 13, fontWeight: subject === s ? 700 : 400,
                cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
                transition: 'all 0.15s',
              }}>
                {s ? `${subjectEmoji(s)} ${s}` : 'Tất cả'}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#aaa' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>⏳</div>
            <p style={{ fontSize: 14 }}>Đang tải danh sách đội tuyển...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#aaa' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🏆</div>
            <p style={{ fontSize: 15 }}>Không tìm thấy đội tuyển nào.</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))',
            gap: 20,
          }}>
            {filtered.map(t => (
              <TeamCard key={t.id} team={t} onClick={() => setModalId(t.id)} />
            ))}
          </div>
        )}
      </div>

      <TeamDetailModal teamId={modalId} onClose={() => setModalId(null)} />
    </div>
  );
}