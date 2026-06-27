import { useState } from 'react'
import InputPanel from './Input_panel'
import OutputPanel from './Output_panel'

function App() {
  const [result, setResult] = useState(null)
  const [lang, setLang] = useState('UK')   // 'UK' or 'EN'

  return (
    <div style={{position:'relative', minHeight:'100vh', zIndex:1}}>

      {/* top bar with logo + lang toggle */}
      <div style={{
        display:'flex', justifyContent:'space-between', alignItems:'center',
        padding:'20px 30px', borderBottom:'1px solid #1e3a5f'
      }}>
        <div
        onClick={() => setResult(null)}
        style={{display:'flex', alignItems:'center', gap:'10px', cursor:'pointer'}}
        >
          <div style={{width:'10px', height:'10px', background:'#22d3ee', borderRadius:'50%', boxShadow:'0 0 10px #22d3ee'}} />
          <h2 style={{margin:0, color:'#22d3ee'}}>CyberTrace</h2>
        </div>

        <LangToggle lang={lang} setLang={(newLang) => {
          setLang(newLang)
          setResult(null)
        }} />
      </div>

      {/* main content */}
      {!result ? (
          // landing page (no result yet)
          <div style={{display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'80px 30px', textAlign:'center'}}>
            <h1 style={{fontSize:'48px', margin:'0 0 10px 0', color:'#e2e8f0'}}>
              cyber threat <span style={{color:'#22d3ee'}}>analyst</span>
            </h1>
            <p style={{opacity:0.6, marginBottom:'40px', fontSize:'16px'}}>
              query a knowledge base of 14,000+ attack scenarios in natural language
            </p>
            <div style={{width:'100%', maxWidth:'700px'}}>
              <InputPanel onResult={setResult} lang={lang} />
              <ExampleQueries lang={lang} />
            </div>
          </div>
        ) : (
        // results view
        <div style={{padding:'30px'}}>
          <div style={{maxWidth:'1200px', margin:'0 auto'}}>
            <InputPanel onResult={setResult} lang={lang} compact={true} />
            <OutputPanel data={result} />
          </div>
        </div>
      )}

    </div>
  )
}

function LangToggle({lang, setLang}) {
  return (
    <div style={{display:'flex', border:'1px solid #1e3a5f', borderRadius:'4px', overflow:'hidden'}}>
      <button
        onClick={() => setLang('UK')}
        style={{
          padding:'6px 14px', border:'none', borderRadius:0,
          background: lang === 'UK' ? '#22d3ee' : 'transparent',
          color: lang === 'UK' ? '#0a1628' : '#e2e8f0'
        }}
      >
        UK
      </button>
      <button
        onClick={() => setLang('EN')}
        style={{
          padding:'6px 14px', border:'none', borderRadius:0,
          background: lang === 'EN' ? '#22d3ee' : 'transparent',
          color: lang === 'EN' ? '#0a1628' : '#e2e8f0'
        }}
      >
        EN
      </button>
    </div>
  )
}

function ExampleQueries({lang}) {
  const examples_en = [
    'show me all phishing attacks',
    'what attacks use technique T1078?',
    'which attacks use Metasploit?',
    'give me the playbook for SQL injection',
    'what changed between 2pm and 4pm?',
    'what happens if I isolate the auth server?'
  ]

  const examples_uk = [
    'покажи всі фішингові атаки',
    'які атаки використовують техніку T1078?',
    'які атаки використовують Metasploit?',
    'дай мені інструкцію для SQL ін\'єкції',
    'що змінилося між 14:00 та 16:00?',
    'що буде, якщо ізолювати сервер автентифікації?'
  ]

  const examples = lang === 'UK' ? examples_uk : examples_en

  function fill_query(text) {
    // dispatches a custom event that the InputPanel listens for
    window.dispatchEvent(new CustomEvent('fill_query', {detail: text}))
  }

  return (
    <div style={{marginTop:'30px'}}>
      <p style={{opacity:0.5, fontSize:'12px', textTransform:'uppercase', letterSpacing:'1px', marginBottom:'12px'}}>
        try an example
      </p>
      <div style={{display:'flex', flexWrap:'wrap', gap:'8px', justifyContent:'center'}}>
        {examples.map((q, i) => (
          <button
            key={i}
            onClick={() => fill_query(q)}
            style={{
              padding:'8px 14px',
              fontSize:'13px',
              borderColor:'#1e3a5f',
              background:'transparent',
              opacity:0.85
            }}
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  )
}

export default App