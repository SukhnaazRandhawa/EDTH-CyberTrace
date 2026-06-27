import { useState } from 'react'

function InputPanel({onResult, lang, compact}) {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    if (!query) return
    setLoading(true)

    // mock data for now until N's backend is ready
    const mock_result = {
      intent: 'diff_states',
      data: {
        added: ['malicious_script', 'backdoor_user', 'exfil_endpoint'],
        removed: ['old_session_token'],
        modified: ['database_c', 'admin_account']
      },
      timestamp1: '14:00',
      timestamp2: '16:00'
    }

    // TODO: replace with real API call
    // const res = await fetch('http://localhost:8000/query', {
    //   method: 'POST',
    //   headers: {'Content-Type':'application/json'},
    //   body: JSON.stringify({query, lang})
    // })
    // const mock_result = await res.json()

    setLoading(false)
    onResult(mock_result)
  }

  const placeholder = lang === 'UK'
    ? 'введіть запит українською...'
    : 'enter your query in english...'

  return (
    <div style={{display:'flex', flexDirection:'column', gap:'12px', marginBottom: compact ? '30px' : 0}}>
      <textarea
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder={placeholder}
        style={{
          width:'100%',
          height: compact ? '60px' : '120px',
          padding:'14px',
          fontSize:'15px'
        }}
      />
      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{
          alignSelf:'flex-end',
          padding:'10px 24px',
          fontSize:'14px',
          background: loading ? '#1e293b' : '#22d3ee',
          color: loading ? '#e2e8f0' : '#0a1628',
          borderColor: '#22d3ee',
          fontWeight: 'bold'
        }}
      >
        {loading ? 'searching...' : '> search'}
      </button>
    </div>
  )
}

export default InputPanel