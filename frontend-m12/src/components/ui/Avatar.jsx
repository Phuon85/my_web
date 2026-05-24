import React from 'react';

export default function Avatar({ src, alt, size = 40, className = '' }) {
  // Hàm tạo ký tự đại diện (chữ cái đầu) nếu không có ảnh
  const getInitials = (name) => {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  };

  return (
    <div
      className={`avatar-container ${className}`}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: '#e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        flexShrink: 0,
        fontWeight: 'bold',
        color: '#475569',
      }}
    >
      {src ? (
        <img
          src={src}
          alt={alt || 'Avatar'}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => {
            // Fallback nếu ảnh bị lỗi (link hỏng)
            e.target.style.display = 'none';
            e.target.parentNode.innerHTML = getInitials(alt);
          }}
        />
      ) : (
        <span>{getInitials(alt)}</span>
      )}
    </div>
  );
}