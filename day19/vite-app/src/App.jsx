import React from 'react'
import Header from './Header'

export default function App(){
  const [name, setName] = React.useState('Chahe')
  const [title, setTitle] = React.useState('Software Developer')

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial', padding: 24 }}>
      <Header name={name} title={title} />
      <div style={{ marginTop: 18 }}>
        <label style={{ display: 'block', marginBottom: 6 }}>
          Name
          <input value={name} onChange={e => setName(e.target.value)} style={{ display: 'block', width: '100%', padding: 8, marginTop: 6, borderRadius: 6, border: '1px solid #e2e8f0' }} />
        </label>
        <label style={{ display: 'block', marginTop: 8 }}>
          Title
          <input value={title} onChange={e => setTitle(e.target.value)} style={{ display: 'block', width: '100%', padding: 8, marginTop: 6, borderRadius: 6, border: '1px solid #e2e8f0' }} />
        </label>
      </div>
    </div>
  )
}
