import { useEffect, useState } from 'react'

function InputPanel({onResult, lang, compact}) {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    function handle_fill(e) {
      setQuery(e.detail)
    }
    window.addEventListener('fill_query', handle_fill)
    return () => window.removeEventListener('fill_query', handle_fill)
  }, [])

  async function handleSubmit() {
  if (!query) return
  setLoading(true)

  const USE_MOCK = false   // backend is live

  let result
  try {
    if (USE_MOCK) {
      result = {
        type: 'search_attacks',
        data: [
          {'a.name': 'SQL Injection Attack', 'a.attack_type': 'Injection', 'a.impact': 'Data breach'}
        ]
      }
    } else {
      const res = await fetch('http://localhost:5001/query', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        //body: JSON.stringify({query})
        body: JSON.stringify({query, lang})
      })
      if (!res.ok) throw new Error(`server returned ${res.status}`)
      result = await res.json()
    }

    onResult(result)
  } catch (err) {
    onResult({type: 'error', message: err.message})
  } finally {
    setLoading(false)
  }
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