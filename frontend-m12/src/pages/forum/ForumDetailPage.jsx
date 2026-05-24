import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import { PageContainer, Spinner, Modal, Btn } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { forumAPI } from '../../api/axios';
import { toast } from 'react-hot-toast';
import { Avatar } from '../../components/ui';

const CAT_LABEL = { math:'📐 Toán học', physics:'⚛️ Vật lý', chem:'🧪 Hóa học', english:'🌍 Ngoại ngữ', it:'💻 CNTT', general:'💬 Chung' };
const CAT_COLOR = { math:'#1d4ed8', physics:'#6d28d9', chem:'#166534', english:'#92400e', it:'#991b1b', general:'#374151' };
const CAT_BG    = { math:'#eff6ff', physics:'#f5f3ff', chem:'#f0fdf4', english:'#fffbeb', it:'#fef2f2', general:'#f9fafb' };

function timeAgo(d) {
  if (!d) return '';
  const s=(Date.now()-new Date(d))/1000;
  if (s<60)    return 'vừa xong';
  if (s<3600)  return `${Math.floor(s/60)} phút trước`;
  if (s<86400) return `${Math.floor(s/3600)} giờ trước`;
  if (s<604800)return `${Math.floor(s/86400)} ngày trước`;
  return new Date(d).toLocaleDateString('vi-VN',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'});
}

/* ── CommentBox ─────────────────────────────────────────────── */
function CommentBox({ onSubmit, placeholder = 'Viết bình luận...', initialValue = '', loading, onCancel, submitLabel = '💬 Gửi bình luận' }) {
  const [val, setVal] = useState(initialValue);
  const ref = useRef(null);

  useEffect(() => { if (ref.current) ref.current.focus(); }, []);

  return (
    <div>
      <textarea ref={ref} value={val} onChange={e=>setVal(e.target.value)}
        placeholder={placeholder} rows={4}
        style={{ width:'100%', boxSizing:'border-box', padding:'12px 14px', border:'1.5px solid #e5e7eb', borderRadius:12, fontSize:14, outline:'none', fontFamily:'inherit', color:'#222', background:'#fafafa', resize:'vertical', minHeight:110, lineHeight:1.6, transition:'border-color 0.15s, box-shadow 0.15s' }}
        onFocus={e=>{e.target.style.borderColor='#1a3a8f';e.target.style.boxShadow='0 0 0 3px rgba(26,58,143,0.08)';}}
        onBlur={e=>{e.target.style.borderColor='#e5e7eb';e.target.style.boxShadow='none';}}
      />
      <p style={{ fontSize:11, color:'#9ca3af', margin:'4px 0 8px' }}>💡 Hỗ trợ LaTeX: $...$ cho công thức inline, $$...$$ cho block</p>
      <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
        {onCancel && <button onClick={onCancel} style={GHOST_BTN}>Hủy</button>}
        <Btn onClick={()=>{ if (val.trim()) { onSubmit(val.trim()); setVal(''); }}} loading={loading} color="primary" small>
          {submitLabel}
        </Btn>
      </div>
    </div>
  );
}

/* ── CommentItem ─────────────────────────────────────────────── */
function CommentItem({ comment, currentUser, onLike, onDelete, onEdit, onReply, depth = 0 }) {
  const [showEdit, setShowEdit]       = useState(false);
  const [showReply, setShowReply]     = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [replyLoading, setReplyLoading] = useState(false);

  const isOwner   = currentUser?.id === comment.authorId;
  const canDelete = isOwner || ['TEACHER','MANAGER','ADMIN'].includes(currentUser?.role);
  const canEdit   = isOwner;

  const handleEdit = async (newContent) => {
    setEditLoading(true);
    await onEdit(comment.id, newContent);
    setEditLoading(false);
    setShowEdit(false);
  };

  const handleReply = async (content) => {
    setReplyLoading(true);
    await onReply(comment.id, content);
    setReplyLoading(false);
    setShowReply(false);
  };

  return (
    <div style={{ marginLeft: depth > 0 ? 36 : 0 }}>
      <div style={{
        background: depth > 0 ? '#f8faff' : '#fff',
        borderRadius:12, border:'1.5px solid #e8ecf0', padding:'16px 18px', marginBottom:10,
        borderLeft: depth > 0 ? '3px solid #bfdbfe' : '1.5px solid #e8ecf0',
        animation:'fadeInUp 0.25s ease',
      }}>
        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <Avatar src={comment.authorAvatar} name={comment.authorName} size={32} />
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                <span style={{ fontWeight:700, fontSize:13, color:'#1a202c' }}>{comment.authorName}</span>
                {comment.authorRole && comment.authorRole!=='STUDENT' && (
                  <span style={{ background:'#eff6ff', color:'#1d4ed8', fontSize:10, fontWeight:700, padding:'1px 7px', borderRadius:20 }}>{comment.authorRole}</span>
                )}
              </div>
              <span style={{ fontSize:11, color:'#9ca3af' }}>{timeAgo(comment.createdAt)}{comment.editedAt && ' · (đã chỉnh sửa)'}</span>
            </div>
          </div>
          <div style={{ display:'flex', gap:6 }}>
            {canEdit && !showEdit && (
              <button onClick={()=>setShowEdit(true)} style={ICON_BTN} title="Chỉnh sửa">✏️</button>
            )}
            {canDelete && (
              <button onClick={()=>onDelete(comment.id)} style={{ ...ICON_BTN, color:'#e53e3e' }} title="Xóa">🗑️</button>
            )}
          </div>
        </div>

        {/* Content or Edit form */}
        {showEdit ? (
          <CommentBox initialValue={comment.content} onSubmit={handleEdit} loading={editLoading}
            onCancel={()=>setShowEdit(false)} placeholder="Chỉnh sửa bình luận..." submitLabel="💾 Lưu" />
        ) : (
          <div style={{ fontSize:14, color:'#374151', lineHeight:1.7, whiteSpace:'pre-wrap', wordBreak:'break-word', marginBottom:10 }}>
            {comment.content}
          </div>
        )}

        {/* Footer actions */}
        {!showEdit && (
          <div style={{ display:'flex', alignItems:'center', gap:14 }}>
            <button onClick={()=>onLike(comment.id)}
              style={{ background:'none', border:'none', cursor:'pointer', fontSize:13, color: comment.liked?'#e53e3e':'#9ca3af', fontFamily:'inherit', display:'flex', alignItems:'center', gap:4, padding:0, transition:'color 0.15s', fontWeight: comment.liked?700:400 }}
              onMouseEnter={e=>e.currentTarget.style.color='#e53e3e'} onMouseLeave={e=>e.currentTarget.style.color=comment.liked?'#e53e3e':'#9ca3af'}>
              {comment.liked?'❤️':'🤍'} {comment.likeCount||0}
            </button>
            {depth === 0 && (
              <button onClick={()=>setShowReply(r=>!r)}
                style={{ background:'none', border:'none', cursor:'pointer', fontSize:13, color:'#9ca3af', fontFamily:'inherit', padding:0, transition:'color 0.15s' }}
                onMouseEnter={e=>e.currentTarget.style.color='#1a3a8f'} onMouseLeave={e=>e.currentTarget.style.color='#9ca3af'}>
                💬 Trả lời
              </button>
            )}
          </div>
        )}
      </div>

      {/* Reply form */}
      {showReply && (
        <div style={{ marginLeft:36, marginBottom:10, background:'#f8faff', borderRadius:12, padding:'14px 16px', border:'1.5px solid #bfdbfe' }}>
          <CommentBox onSubmit={handleReply} loading={replyLoading}
            onCancel={()=>setShowReply(false)} placeholder={`Trả lời ${comment.authorName}...`} submitLabel="💬 Gửi trả lời" />
        </div>
      )}

      {/* Nested replies */}
      {(comment.replies||[]).map(reply => (
        <CommentItem key={reply.id} comment={reply} currentUser={currentUser}
          onLike={onLike} onDelete={onDelete} onEdit={onEdit} onReply={onReply} depth={1} />
      ))}
    </div>
  );
}

/* ── Main ────────────────────────────────────────────────────── */
export default function ForumDetailPage() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const { user }   = useAuth();
  const [thread, setThread]       = useState(null);
  const [comments, setComments]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [commenting, setCommenting] = useState(false);
  const [liked, setLiked]         = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [showDelete, setShowDelete] = useState(false);
  const [showEdit, setShowEdit]   = useState(false);
  const [editForm, setEditForm]   = useState({ title:'', content:'' });

  const canModerate  = ['TEACHER','MANAGER','ADMIN'].includes(user?.role);
  const isOwner      = user?.id === thread?.authorId;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [tr, cr] = await Promise.all([forumAPI.getThread(id), forumAPI.getComments(id)]);
      setThread(tr.data);
      setEditForm({ title:tr.data.title||'', content:tr.data.content||'' });
      setLiked(tr.data.likedByMe||false);
      setLikeCount(tr.data.likeCount||0);
      setComments(cr.data||[]);
    } catch { toast.error('Không thể tải bài viết này'); navigate('/forum'); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  /* ── Like thread ── */
  const handleLike = async () => {
    try {
      await forumAPI.toggleLike(id);
      setLiked(l=>{ setLikeCount(c=>l?c-1:c+1); return !l; });
    } catch { toast.error('Thao tác thất bại'); }
  };

  /* ── Post comment ── */
  const handleComment = async (content) => {
    setCommenting(true);
    try {
      const res = await forumAPI.create({ content, parentId: id });
      setComments(prev=>[...prev, res.data]);
      setThread(t=>({...t, commentCount:(t.commentCount||0)+1}));
      toast.success('Đã đăng bình luận');
    } catch(err) { toast.error(err?.response?.data?.message||'Đăng bình luận thất bại'); }
    finally { setCommenting(false); }
  };

  /* ── Like comment ── */
  const handleLikeComment = async (commentId) => {
    try {
      await forumAPI.toggleLike(commentId);
      setComments(prev => prev.map(c =>
        c.id===commentId ? {...c, liked:!c.liked, likeCount:(c.likeCount||0)+(c.liked?-1:1)}
        : c.replies ? {...c, replies:c.replies.map(r=>r.id===commentId?{...r,liked:!r.liked,likeCount:(r.likeCount||0)+(r.liked?-1:1)}:r)} : c
      ));
    } catch { toast.error('Thao tác thất bại'); }
  };

  /* ── Delete comment ── */
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Xóa bình luận này?')) return;
    try {
      await forumAPI.delete(commentId);
      setComments(prev=>{
        const filtered = prev.filter(c=>c.id!==commentId);
        return filtered.map(c=>({...c, replies:(c.replies||[]).filter(r=>r.id!==commentId)}));
      });
      setThread(t=>({...t, commentCount:Math.max(0,(t.commentCount||1)-1)}));
      toast.success('Đã xóa bình luận');
    } catch { toast.error('Xóa thất bại'); }
  };

  /* ── Edit comment ── */
  const handleEditComment = async (commentId, content) => {
    try {
      const res = await forumAPI.update(commentId, { content });
      setComments(prev=>prev.map(c=>c.id===commentId?{...c,...res.data,editedAt:new Date().toISOString()}:c));
      toast.success('Đã cập nhật bình luận');
    } catch { toast.error('Cập nhật thất bại'); }
  };

  /* ── Reply ── */
  const handleReply = async (parentCommentId, content) => {
    try {
      const res = await forumAPI.create({ content, parentId: id, parentCommentId });
      setComments(prev=>prev.map(c=>c.id===parentCommentId?{...c, replies:[...(c.replies||[]), res.data]}:c));
      toast.success('Đã gửi trả lời');
    } catch { toast.error('Gửi thất bại'); }
  };

  /* ── Delete thread ── */
  const handleDeleteThread = async () => {
    try {
      await forumAPI.delete(id);
      toast.success('Đã xóa bài viết');
      navigate('/forum');
    } catch { toast.error('Xóa thất bại'); }
  };

  /* ── Edit thread ── */
  const handleEditThread = async () => {
    if (!editForm.title.trim() || !editForm.content.trim()) { toast.error('Tiêu đề và nội dung không được để trống'); return; }
    try {
      const res = await forumAPI.update(id, editForm);
      setThread(t=>({...t,...res.data}));
      setShowEdit(false);
      toast.success('Đã cập nhật bài viết');
    } catch { toast.error('Cập nhật thất bại'); }
  };

  /* ── Pin / Hide ── */
  const handlePin = async () => {
    try {
      await forumAPI.togglePin(id);
      setThread(t=>({...t, pinned:!t.pinned}));
      toast.success(thread.pinned?'Đã bỏ ghim':'Đã ghim bài viết');
    } catch { toast.error('Thao tác thất bại'); }
  };
  const handleHide = async () => {
    try {
      await forumAPI.toggleHide(id);
      setThread(t=>({...t, hidden:!t.hidden}));
      toast.success(thread.hidden?'Đã hiển thị lại':'Đã ẩn bài viết');
    } catch { toast.error('Thao tác thất bại'); }
  };

  if (loading) return <div style={{ minHeight:'100vh', background:'#f5f6fa' }}><Navbar /><Spinner /></div>;
  if (!thread) return null;

  const cat = thread.category||'general';

  return (
    <div style={{ minHeight:'100vh', background:'#f5f6fa', fontFamily:"'Be Vietnam Pro',sans-serif" }}>
      <style>{`@keyframes fadeInUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <Navbar />
      <PageContainer maxWidth={860}>

        {/* Breadcrumb */}
        <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:13, color:'#9ca3af', marginBottom:20, flexWrap:'wrap' }}>
          <span onClick={()=>navigate('/forum')} style={{ cursor:'pointer', transition:'color 0.15s' }}
            onMouseEnter={e=>e.currentTarget.style.color='#1a3a8f'} onMouseLeave={e=>e.currentTarget.style.color='#9ca3af'}>
            ← Diễn đàn
          </span>
          <span>/</span>
          <span style={{ background:CAT_BG[cat]||'#f9fafb', color:CAT_COLOR[cat]||'#374151', fontSize:11, fontWeight:700, padding:'2px 10px', borderRadius:20 }}>
            {CAT_LABEL[cat]||cat}
          </span>
        </div>

        {/* Thread card */}
        <div style={{ background:'#fff', borderRadius:18, border:'1.5px solid #e8ecf0', padding:'28px 32px', marginBottom:24, boxShadow:'0 2px 12px rgba(0,0,0,0.06)', animation:'fadeInUp 0.3s ease', position:'relative' }}>
          {thread.pinned && (
            <div style={{ position:'absolute', top:0, left:0, right:0, height:4, background:'linear-gradient(90deg,#f59e0b,#f97316)', borderRadius:'18px 18px 0 0' }} />
          )}

          {/* Tags */}
          <div style={{ display:'flex', gap:7, marginBottom:14, flexWrap:'wrap' }}>
            <span style={{ background:CAT_BG[cat], color:CAT_COLOR[cat], fontSize:12, fontWeight:700, padding:'4px 12px', borderRadius:20 }}>
              {CAT_LABEL[cat]}
            </span>
            {(thread.tags||[]).map(tag=>(
              <span key={tag} style={{ background:'#f1f5f9', color:'#475569', fontSize:12, padding:'3px 10px', borderRadius:20 }}>#{tag}</span>
            ))}
            {thread.pinned && <span style={{ background:'#fffbeb', color:'#92400e', fontSize:12, fontWeight:700, padding:'4px 12px', borderRadius:20, border:'1px solid #fde68a' }}>📌 Đã ghim</span>}
          </div>

          {/* Title */}
          {showEdit ? (
            <div style={{ marginBottom:16 }}>
              <input value={editForm.title} onChange={e=>setEditForm(f=>({...f,title:e.target.value}))}
                style={{ width:'100%', boxSizing:'border-box', padding:'12px 16px', border:'1.5px solid #1a3a8f', borderRadius:10, fontSize:18, fontWeight:700, fontFamily:'inherit', color:'#1a202c', outline:'none', marginBottom:12, boxShadow:'0 0 0 3px rgba(26,58,143,0.08)' }} />
              <textarea value={editForm.content} onChange={e=>setEditForm(f=>({...f,content:e.target.value}))}
                rows={6} style={{ width:'100%', boxSizing:'border-box', padding:'12px 16px', border:'1.5px solid #e5e7eb', borderRadius:10, fontSize:14, fontFamily:'inherit', color:'#374151', outline:'none', resize:'vertical', lineHeight:1.7,
                  transition:'border-color 0.15s' }}
                onFocus={e=>{e.target.style.borderColor='#1a3a8f';e.target.style.boxShadow='0 0 0 3px rgba(26,58,143,0.08)';}}
                onBlur={e=>{e.target.style.borderColor='#e5e7eb';e.target.style.boxShadow='none';}} />
              <div style={{ display:'flex', gap:8, marginTop:10, justifyContent:'flex-end' }}>
                <button onClick={()=>setShowEdit(false)} style={GHOST_BTN}>Hủy</button>
                <Btn onClick={handleEditThread} color="primary" small>💾 Lưu thay đổi</Btn>
              </div>
            </div>
          ) : (
            <>
              <h1 style={{ fontSize:22, fontWeight:900, color:'#1a202c', margin:'0 0 16px', lineHeight:1.3, letterSpacing:-0.3 }}>{thread.title}</h1>
              <div style={{ fontSize:15, color:'#374151', lineHeight:1.8, whiteSpace:'pre-wrap', wordBreak:'break-word', marginBottom:20 }}>
                {thread.content}
              </div>
            </>
          )}

          {/* Author + stats */}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', paddingTop:16, borderTop:'1px solid #f0f4f8', flexWrap:'wrap', gap:12 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <Avatar src={thread.authorAvatar} name={thread.authorName} size={36} />
              <div>
                <p style={{ fontWeight:700, fontSize:14, color:'#1a202c', margin:0 }}>{thread.authorName}</p>
                <p style={{ fontSize:12, color:'#9ca3af', margin:0 }}>{timeAgo(thread.createdAt)}</p>
              </div>
            </div>

            <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
              <span style={{ fontSize:13, color:'#9ca3af' }}>👁 {thread.viewCount||0} lượt xem</span>
              <span style={{ fontSize:13, color:'#9ca3af' }}>💬 {thread.commentCount||0} bình luận</span>

              {/* Like button */}
              <button onClick={handleLike}
                style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 14px', border:`1.5px solid ${liked?'#fca5a5':'#e5e7eb'}`, borderRadius:8, background:liked?'#fef2f2':'#fff', cursor:'pointer', fontSize:13, fontFamily:'inherit', fontWeight:liked?700:400, color:liked?'#e53e3e':'#6b7280', transition:'all 0.15s' }}>
                {liked?'❤️':'🤍'} {likeCount}
              </button>

              {/* Moderation */}
              {(isOwner || canModerate) && (
                <div style={{ display:'flex', gap:6 }}>
                  {isOwner && <button onClick={()=>setShowEdit(e=>!e)} style={ACT_BTN}>✏️ Sửa</button>}
                  {canModerate && <button onClick={handlePin} style={ACT_BTN}>{thread.pinned?'📍 Bỏ ghim':'📌 Ghim'}</button>}
                  {canModerate && <button onClick={handleHide} style={ACT_BTN}>{thread.hidden?'👁 Hiện':'🚫 Ẩn'}</button>}
                  {(isOwner||canModerate) && <button onClick={()=>setShowDelete(true)} style={{ ...ACT_BTN, color:'#e53e3e', borderColor:'#fca5a5', background:'#fef2f2' }}>🗑️ Xóa</button>}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Comments section */}
        <div style={{ background:'#fff', borderRadius:18, border:'1.5px solid #e8ecf0', padding:'24px 28px', boxShadow:'0 2px 12px rgba(0,0,0,0.04)' }}>
          <h3 style={{ fontSize:16, fontWeight:800, color:'#1a202c', margin:'0 0 20px', display:'flex', alignItems:'center', gap:8 }}>
            💬 {thread.commentCount||0} Bình luận
          </h3>

          {/* New comment box */}
          <div style={{ background:'#f8faff', borderRadius:14, padding:'18px 20px', marginBottom:24, border:'1.5px solid #e0e8ff' }}>
            <div style={{ display:'flex', gap:12, alignItems:'flex-start' }}>
              <Avatar src={user?.avatarUrl} name={user?.fullName} size={36} />
              <div style={{ flex:1 }}>
                <CommentBox onSubmit={handleComment} loading={commenting} placeholder="Chia sẻ suy nghĩ, giải pháp hoặc câu hỏi của bạn..." />
              </div>
            </div>
          </div>

          {/* Comment list */}
          {comments.length === 0 ? (
            <div style={{ textAlign:'center', padding:'40px 0', color:'#c4c9d4' }}>
              <div style={{ fontSize:44, marginBottom:10 }}>💭</div>
              <p style={{ fontSize:14 }}>Chưa có bình luận nào. Hãy là người đầu tiên!</p>
            </div>
          ) : (
            comments.map(comment => (
              <CommentItem key={comment.id} comment={comment} currentUser={user}
                onLike={handleLikeComment} onDelete={handleDeleteComment}
                onEdit={handleEditComment} onReply={handleReply} />
            ))
          )}
        </div>
      </PageContainer>

      {/* Delete confirm modal */}
      <Modal open={showDelete} onClose={()=>setShowDelete(false)} title="🗑️ Xác nhận xóa bài viết" width={420}>
        <div style={{ background:'#fef2f2', borderRadius:12, padding:'16px', marginBottom:20, border:'1px solid #fca5a5' }}>
          <p style={{ fontSize:14, color:'#991b1b', margin:0, lineHeight:1.6 }}>
            Bạn có chắc muốn xóa bài viết <strong>"{thread.title}"</strong>? Toàn bộ bình luận cũng sẽ bị xóa. Hành động này <strong>không thể hoàn tác</strong>.
          </p>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <button onClick={()=>setShowDelete(false)} style={{ flex:1, padding:'11px', border:'1.5px solid #e0e0e0', borderRadius:10, background:'#fff', fontSize:14, cursor:'pointer', fontFamily:'inherit', fontWeight:600 }}>Hủy</button>
          <Btn onClick={handleDeleteThread} color="danger" style={{ flex:1 }}>🗑️ Xóa bài viết</Btn>
        </div>
      </Modal>
    </div>
  );
}

const GHOST_BTN = { padding:'8px 16px', border:'1.5px solid #e0e0e0', borderRadius:8, background:'#fff', fontSize:13, cursor:'pointer', fontFamily:'inherit', fontWeight:600, color:'#555', transition:'background 0.15s' };
const ICON_BTN  = { background:'#f9fafb', border:'1px solid #e5e7eb', borderRadius:7, cursor:'pointer', fontSize:14, padding:'4px 8px', transition:'background 0.12s', color:'#6b7280' };
const ACT_BTN   = { padding:'6px 12px', border:'1.5px solid #e5e7eb', borderRadius:8, background:'#fff', cursor:'pointer', fontSize:12, fontFamily:'inherit', fontWeight:600, color:'#555', transition:'all 0.15s' };
