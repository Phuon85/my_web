import React from 'react';
export { default as SkeletonCard } from './SkeletonCard';
export { default as Avatar } from './Avatar';

// ── Loading Spinner ───────────────────────────────────────────────────────
export function Spinner({ size = 36, color = '#1a3a8f' }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 40 }}>
      <div style={{
        width: size, height: size, borderRadius: '50%',
        border: `3px solid #e5e7eb`,
        borderTopColor: color,
        animation: 'spin 0.7s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ── Toast / Alert ─────────────────────────────────────────────────────────
export function Toast({ msg, type = 'success' }) {
  if (!msg) return null;
  const styles = {
    success: { bg: '#f0fdf4', border: '#86efac', color: '#166534', icon: '✅' },
    error:   { bg: '#fef2f2', border: '#fca5a5', color: '#991b1b', icon: '❌' },
    info:    { bg: '#eff6ff', border: '#93c5fd', color: '#1e40af', icon: 'ℹ️'  },
  };
  const s = styles[type];
  return (
    <div style={{
      background: s.bg, border: `1px solid ${s.border}`,
      borderRadius: 10, padding: '11px 16px', marginBottom: 16,
      fontSize: 14, color: s.color, display: 'flex', alignItems: 'center', gap: 8,
    }}>
      {s.icon} {msg}
    </div>
  );
}

// ── Button ────────────────────────────────────────────────────────────────
export function Btn({ children, onClick, color = 'primary', disabled, full, small, style = {} }) {
  const palettes = {
    primary: { bg: 'linear-gradient(90deg,#1a3a8f,#1a7a4a)', color: '#fff', shadow: 'rgba(26,58,143,0.3)' },
    danger:  { bg: '#e53e3e', color: '#fff', shadow: 'rgba(229,62,62,0.3)' },
    amber:   { bg: 'linear-gradient(90deg,#f59e0b,#f97316)', color: '#fff', shadow: 'rgba(245,158,11,0.3)' },
    ghost:   { bg: 'transparent', color: '#555', border: '1.5px solid #e0e0e0', shadow: 'none' },
    green:   { bg: 'linear-gradient(90deg,#1a7a4a,#1d8a55)', color: '#fff', shadow: 'rgba(26,122,74,0.3)' },
  };
  const p = palettes[color] || palettes.primary;
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: small ? '7px 14px' : '11px 20px',
        background: disabled ? '#e0e0e0' : p.bg,
        color: disabled ? '#aaa' : p.color,
        border: p.border || 'none',
        borderRadius: 8,
        fontSize: small ? 13 : 14,
        fontWeight: 700,
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: 'inherit',
        width: full ? '100%' : 'auto',
        boxShadow: disabled ? 'none' : `0 3px 12px ${p.shadow}`,
        transition: 'opacity 0.15s, transform 0.1s',
        ...style,
      }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.opacity = '0.9'; }}
      onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
    >
      {children}
    </button>
  );
}

// ── Input ─────────────────────────────────────────────────────────────────
export function Input({ label, value, onChange, placeholder, type = 'text', disabled, error }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 5 }}>{label}</label>}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        style={{
          width: '100%', boxSizing: 'border-box',
          padding: '11px 14px',
          border: `1.5px solid ${error ? '#fca5a5' : '#e0e0e0'}`,
          borderRadius: 8, fontSize: 14, outline: 'none',
          fontFamily: 'inherit', color: '#222',
          background: disabled ? '#f5f5f5' : '#fafafa',
        }}
        onFocus={e => e.target.style.borderColor = '#1a3a8f'}
        onBlur={e => e.target.style.borderColor = error ? '#fca5a5' : '#e0e0e0'}
      />
      {error && <p style={{ color: '#e53e3e', fontSize: 12, marginTop: 4 }}>{error}</p>}
    </div>
  );
}

// ── Select ────────────────────────────────────────────────────────────────
export function Select({ label, value, onChange, options, placeholder }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 5 }}>{label}</label>}
      <select
        value={value}
        onChange={onChange}
        style={{
          width: '100%', padding: '11px 14px',
          border: '1.5px solid #e0e0e0', borderRadius: 8,
          fontSize: 14, fontFamily: 'inherit',
          color: value ? '#222' : '#999',
          background: '#fafafa', cursor: 'pointer', outline: 'none',
        }}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

// ── Badge/Tag ─────────────────────────────────────────────────────────────
export function StatusBadge({ label, color }) {
  const colorMap = {
    green:  { bg: '#f0fdf4', text: '#166534' },
    red:    { bg: '#fef2f2', text: '#991b1b' },
    blue:   { bg: '#eff6ff', text: '#1e40af' },
    amber:  { bg: '#fffbeb', text: '#92400e' },
    gray:   { bg: '#f9fafb', text: '#6b7280' },
    purple: { bg: '#faf5ff', text: '#6b21a8' },
  };
  const s = colorMap[color] || colorMap.gray;
  return (
    <span style={{
      background: s.bg, color: s.text,
      fontSize: 11, fontWeight: 700,
      padding: '3px 10px', borderRadius: 16,
      display: 'inline-block',
    }}>{label}</span>
  );
}

// ── Card ──────────────────────────────────────────────────────────────────
export function Card({ children, style = {}, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: '#fff', borderRadius: 14,
        border: '1.5px solid #e8ecf0',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        padding: '20px',
        cursor: onClick ? 'pointer' : 'default',
        transition: onClick ? 'box-shadow 0.15s, transform 0.15s' : 'none',
        ...style,
      }}
      onMouseEnter={e => { if (onClick) { e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}}
      onMouseLeave={e => { if (onClick) { e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)'; e.currentTarget.style.transform = 'none'; }}}
    >
      {children}
    </div>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, width = 500 }) {
  if (!open) return null;
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 2000,
      background: 'rgba(0,0,0,0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: '#fff', borderRadius: 16,
        width: '100%', maxWidth: width,
        maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        padding: '28px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontSize: 17, fontWeight: 700, color: '#1a202c' }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#aaa', lineHeight: 1 }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── Empty State ───────────────────────────────────────────────────────────
export function Empty({ icon = '📭', message = 'Không có dữ liệu' }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px', color: '#aaa' }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>{icon}</div>
      <p style={{ fontSize: 14 }}>{message}</p>
    </div>
  );
}

// ── Page Layout ───────────────────────────────────────────────────────────
export function PageContainer({ children, maxWidth = 1200 }) {
  return (
    <div style={{ maxWidth, margin: '0 auto', padding: '28px 24px' }}>
      {children}
    </div>
  );
}

// ── Section title ─────────────────────────────────────────────────────────
export function SectionTitle({ children, action }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1a202c' }}>{children}</h3>
      {action}
    </div>
  );
}
