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
        <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
          <div style={{width:'10px', height:'10px', background:'#22d3ee', borderRadius:'50%', boxShadow:'0 0 10px #22d3ee'}} />
          <h2 style={{margin:0, color:'#22d3ee'}}>CyberTrace</h2>
        </div>

        <LangToggle lang={lang} setLang={setLang} />
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

export default App