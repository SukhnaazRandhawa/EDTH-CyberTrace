import { useState } from 'react'

function InputPanel({onResult}) {
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

    // TODO: replace mock with real API call to N's backend
    // const res = await fetch('http://localhost:8000/query', {
    //   method: 'POST',
    //   body: JSON.stringify({query})
    // })
    // const mock_result = await res.json()

    setLoading(false)
    onResult(mock_result)
  }

  return (
    <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
      <textarea
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder='введіть запит українською...'
        style={{width:'100%', height:'80px', padding:'10px', fontSize:'16px'}}
      />
      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{width:'150px', padding:'10px', fontSize:'16px'}}
      >
        {loading ? 'loading...' : 'search'}
      </button>
    </div>
  )
}

export default InputPanel