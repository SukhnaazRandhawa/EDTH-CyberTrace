import GraphDiff from './Gr_diff'

function OutputPanel({data}) {
  return (
    <div style={{display:'flex', flexDirection:'column', gap:'20px', flex:1, marginTop:'20px'}}>

      {/* top panel: text answer */}
      <div style={{padding:'20px', border:'1px solid #444', borderRadius:'8px', overflow:'auto'}}>
        <h2 style={{marginTop:0}}>text answer</h2>
        {data.intent === 'search_attacks' && <AttackList attacks={data.data} count={data.count} />}
        {data.intent === 'diff_states' && <DiffSummary diff={data.data} t1={data.timestamp1} t2={data.timestamp2} />}
      </div>

      {/* bottom panel: graph visual */}
      <div style={{padding:'20px', border:'1px solid #444', borderRadius:'8px'}}>
        <h2 style={{marginTop:0}}>graph</h2>
        <GraphDiff data={data} />
      </div>

    </div>
  )
}

function AttackList({attacks, count}) {
  return (
    <div>
      <p style={{opacity:0.7}}>found: {count}</p>
      {attacks.map((a, i) => (
        <div key={i} style={{marginBottom:'15px', padding:'12px', background:'#222', borderRadius:'6px'}}>
          <h3 style={{margin:'0 0 8px 0'}}>{a.name}</h3>
          <p style={{margin:'4px 0'}}><b>type:</b> {a.attack_type}</p>
          <p style={{margin:'4px 0'}}><b>impact:</b> {a.impact}</p>
          <p style={{margin:'4px 0'}}><b>detection:</b> {a.detection_method}</p>
          <p style={{margin:'4px 0'}}><b>solution:</b> {a.solution}</p>
        </div>
      ))}
    </div>
  )
}

function DiffSummary({diff, t1, t2}) {
  return (
    <div>
      <p style={{opacity:0.7}}>comparing: {t1} → {t2}</p>

      <div style={{display:'flex', gap:'20px', marginTop:'15px'}}>

        <div style={{flex:1}}>
          <h3 style={{color:'#4ade80'}}>added ({diff.added.length})</h3>
          {diff.added.map((n, i) => <div key={i}>+ {n}</div>)}
        </div>

        <div style={{flex:1}}>
          <h3 style={{color:'#f87171'}}>removed ({diff.removed.length})</h3>
          {diff.removed.map((n, i) => <div key={i}>− {n}</div>)}
        </div>

        <div style={{flex:1}}>
          <h3 style={{color:'#fbbf24'}}>modified ({diff.modified.length})</h3>
          {diff.modified.map((n, i) => <div key={i}>~ {n}</div>)}
        </div>

      </div>
    </div>
  )
}
export default OutputPanel