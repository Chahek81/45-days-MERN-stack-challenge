import React from 'react'

export default function Header({ name, title }){
  return (
    <header style={{ background: '#fff', padding: 24, borderRadius: 12, boxShadow: '0 6px 18px rgba(15,23,42,0.06)', maxWidth: 640 }}>
      <h1 style={{ margin: 0 }}>{name}</h1>
      <p style={{ margin: '4px 0 0', color: '#475569' }}>{title}</p>
      <div style={{ marginTop: 12, fontSize: 13, color: '#64748b' }}>Built with React + Vite • Minimal starter</div>
    </header>
  )
}
