import React from 'react';

export default function AuthLayout({ children }) {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#f0e4e4',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      fontFamily: "'Be Vietnam Pro', sans-serif",
    }}>
      <div style={{
        display: 'flex',
        width: '100%',
        maxWidth: 940,
        minHeight: 520,
        borderRadius: 16,
        overflow: 'hidden',
        boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
        background: '#fff',
      }}>
        {/* LEFT — blue branding panel */}
        <div style={{
          flex: '0 0 45%',
          background: 'linear-gradient(155deg,#0f2a6e 0%,#1a4298 50%,#0e4098 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '40px 28px 36px',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Decorative circles */}
          <div style={{ position:'absolute', top:-70, left:-60, width:280, height:280, borderRadius:'50%', background:'rgba(255,255,255,0.05)' }} />
          <div style={{ position:'absolute', top:80,  left:-20, width:200, height:200, borderRadius:'50%', background:'rgba(255,255,255,0.04)' }} />
          <div style={{ position:'absolute', bottom:-90, right:-80, width:320, height:320, borderRadius:'50%', background:'rgba(255,255,255,0.05)' }} />

          {/* Logo + title */}
          <div style={{ textAlign:'center', zIndex:1 }}>
            <div style={{
              width:68, height:68, borderRadius:'50%',
              border:'2px solid rgba(255,255,255,0.5)',
              background:'rgba(255,255,255,0.12)',
              display:'flex', alignItems:'center', justifyContent:'center',
              margin:'0 auto 14px', fontSize:30,
            }}>🏛️</div>
            <h1 style={{ color:'#fff', fontSize:21, fontWeight:800, margin:0 }}>
              Olympic Khoa học Cơ bản
            </h1>
            <p style={{ color:'rgba(255,255,255,0.72)', fontSize:13, margin:'6px 0 0' }}>
              Trường Đại học Mỏ – Địa chất
            </p>
          </div>

          {/* Mascot */}
          <div style={{ zIndex:1, textAlign:'center' }}>
            <div style={{ fontSize:76, lineHeight:1, filter:'drop-shadow(0 4px 18px rgba(0,0,0,0.3))' }}>🔥</div>
            <div style={{ display:'flex', gap:40, justifyContent:'center', marginTop:10 }}>
              {[0,1].map(i => (
                <div key={i} style={{
                  width:36, height:36, borderRadius:'50%',
                  background:'rgba(255,255,255,0.15)',
                  display:'flex', alignItems:'center', justifyContent:'center', fontSize:18,
                }}>👤</div>
              ))}
            </div>
          </div>

          {/* Tagline */}
          <div style={{ textAlign:'center', zIndex:1 }}>
            <p style={{ color:'#fff', fontSize:16, fontWeight:700, margin:'0 0 6px' }}>
              Gia nhập đội ngũ chinh phục tri thức
            </p>
            <p style={{ color:'rgba(255,255,255,0.68)', fontSize:13, margin:0 }}>
              Thắp sáng ngọn đuốc khoa học cùng chúng tôi
            </p>
          </div>
        </div>

        {/* RIGHT — content slot */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '40px 48px',
          background: '#fff',
          overflowY: 'auto',
        }}>
          {children}
        </div>
      </div>
    </div>
  );
}
