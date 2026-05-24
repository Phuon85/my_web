import React from 'react';

export default function SkeletonCard() {
  return (
    <div style={{
      width: '100%',
      height: '120px',
      backgroundColor: '#e2e8f0',
      borderRadius: '8px',
      animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
    }}>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .5; }
        }
      `}</style>
    </div>
  );
}