import GraphDiff from './Gr_diff'

function OutputPanel({data}) {
  // backend returns 'type', mock data uses 'intent' — handle both
  const intent = data.type || data.intent

  return (
    <div style={{display:'flex', flexDirection:'column', gap:'20px', flex:1, marginTop:'20px'}}>

      {/* top: text answer */}
      <div style={{padding:'20px', border:'1px solid #1e3a5f', borderRadius:'6px', background:'#0f1e35'}}>
        <h2 style={{marginTop:0, color:'#22d3ee'}}>analysis</h2>
        {render_by_intent(intent, data)}
      </div>

      {/* bottom: graph visual */}
      <div style={{padding:'20px', border:'1px solid #1e3a5f', borderRadius:'6px', background:'#0f1e35'}}>
        <h2 style={{marginTop:0, color:'#22d3ee'}}>graph</h2>
        <GraphDiff data={data} />
      </div>

    </div>
  )
}

function render_by_intent(intent, data) {
  switch (intent) {

    case 'search_attacks':
    case 'find_by_technique':
    case 'find_by_tool':
    case 'find_by_category':
      return <AttackList items={data.data} intent={intent} />

    case 'get_playbook':
      return <Playbook item={data.data[0]} />

    case 'replay_state':
      return <Snapshot items={data.data} />

    case 'diff_states':
      // your existing mock has nested structure, real backend has flat list
      // handle both
      if (Array.isArray(data.data)) {
        return <DiffSnapshot items={data.data} message={data.message} />
      }
      return <DiffSummary diff={data.data} t1={data.timestamp1} t2={data.timestamp2} />

    case 'simulate_isolation':
      return <Isolation node={data.node} affected={data.affected} message={data.message} />

    default:
      return <pre style={{opacity:0.5}}>{JSON.stringify(data, null, 2)}</pre>
  }
}

// handles attacks from search/find queries
// keys come as 'a.name', 'a.attack_type' etc from cypher
function AttackList({items, intent}) {
  if (!items || items.length === 0) return <p style={{opacity:0.5}}>no results</p>

  const label = {
    search_attacks: 'matching attacks',
    find_by_technique: 'attacks using this technique',
    find_by_tool: 'attacks using this tool',
    find_by_category: 'attacks in this category'
  }[intent]

  return (
    <div>
      <p style={{opacity:0.7, marginBottom:'15px'}}>{label} — {items.length} found</p>
      {items.map((a, i) => (
        <div key={i} style={card_style}>
          <h3 style={{margin:'0 0 8px 0', color:'#22d3ee'}}>{a['a.name'] || a.name}</h3>
          <p style={{margin:'4px 0'}}><b>type:</b> {a['a.attack_type'] || a.attack_type}</p>
          {(a['a.impact'] || a.impact) && <p style={{margin:'4px 0'}}><b>impact:</b> {a['a.impact'] || a.impact}</p>}
          {a['t.name'] && <p style={{margin:'4px 0', opacity:0.7}}>technique: {a['t.name']}</p>}
          {a['cat.name'] && <p style={{margin:'4px 0', opacity:0.7}}>category: {a['cat.name']}</p>}
        </div>
      ))}
    </div>
  )
}

// full playbook for one attack
function Playbook({item}) {
  if (!item) return <p style={{opacity:0.5}}>playbook not found</p>

  return (
    <div>
      <h3 style={{color:'#22d3ee', margin:'0 0 15px 0'}}>{item['a.name']}</h3>

      <Section title='description'>{item['a.scenario_description']}</Section>
      <Section title='attack steps'>{item['a.attack_steps']}</Section>
      <Section title='detection method'>{item['a.detection_method']}</Section>
      <Section title='solution'>{item['a.solution']}</Section>

      {item['cat.name'] && (
        <p style={{marginTop:'15px', opacity:0.7}}>
          category: <span style={{color:'#22d3ee'}}>{item['cat.name']}</span>
        </p>
      )}

      {item.tools && item.tools.length > 0 && (
        <p style={{opacity:0.7}}>
          tools: {item.tools.map((t, i) => <span key={i} style={tag_style}>{t}</span>)}
        </p>
      )}

      {item.techniques && item.techniques.length > 0 && (
        <p style={{opacity:0.7}}>
          techniques: {item.techniques.map((t, i) => <span key={i} style={tag_style}>{t}</span>)}
        </p>
      )}
    </div>
  )
}

// snapshot for replay_state
function Snapshot({items}) {
  return (
    <div>
      <p style={{opacity:0.7, marginBottom:'15px'}}>graph state — {items.length} attacks at this point in time</p>
      {items.map((a, i) => (
        <div key={i} style={card_style}>
          <h4 style={{margin:'0 0 6px 0', color:'#22d3ee'}}>{a['a.name']}</h4>
          <p style={{margin:'2px 0', fontSize:'13px'}}>{a['a.attack_type']}</p>
          {a['a.impact'] && <p style={{margin:'2px 0', fontSize:'13px', opacity:0.7}}>{a['a.impact']}</p>}
        </div>
      ))}
    </div>
  )
}

// diff_states when backend returns a flat list (real backend currently does this)
function DiffSnapshot({items, message}) {
  return (
    <div>
      {message && <p style={{opacity:0.7, marginBottom:'15px', color:'#fbbf24'}}>{message}</p>}
      {items.map((a, i) => (
        <div key={i} style={card_style}>
          <p style={{margin:0, color:'#22d3ee'}}>{a['a.name']}</p>
          <p style={{margin:'4px 0 0 0', fontSize:'13px', opacity:0.7}}>{a['a.attack_type']}</p>
        </div>
      ))}
    </div>
  )
}

// diff_states with the proper added/removed/modified shape (mock + future real version)
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

// simulate_isolation
function Isolation({node, affected, message}) {
  return (
    <div>
      <div style={{padding:'12px', background:'#3a1f1f', border:'1px solid #f87171', borderRadius:'4px', marginBottom:'15px'}}>
        <p style={{margin:0, color:'#f87171'}}>⚠ simulating isolation of: <b>{node}</b></p>
        <p style={{margin:'4px 0 0 0', opacity:0.8, fontSize:'13px'}}>{message}</p>
      </div>
      {affected && affected.length > 0 ? (
        affected.map((a, i) => (
          <div key={i} style={card_style}>
            <p style={{margin:0, color:'#22d3ee'}}>{a['a.name']}</p>
            <p style={{margin:'4px 0 0 0', fontSize:'13px', opacity:0.7}}>
              {a['a.attack_type']} — {a['a.impact']}
            </p>
          </div>
        ))
      ) : (
        <p style={{opacity:0.5}}>no affected nodes found</p>
      )}
    </div>
  )
}

// small helper for playbook sections
function Section({title, children}) {
  if (!children) return null
  return (
    <div style={{marginBottom:'15px'}}>
      <h4 style={{margin:'0 0 6px 0', color:'#94a3b8', textTransform:'uppercase', fontSize:'12px', letterSpacing:'1px'}}>{title}</h4>
      <p style={{margin:0, lineHeight:1.5, whiteSpace:'pre-wrap'}}>{children}</p>
    </div>
  )
}

// shared styles
const card_style = {
  marginBottom:'12px',
  padding:'12px',
  background:'#0a1628',
  border:'1px solid #1e3a5f',
  borderRadius:'4px'
}

const tag_style = {
  display:'inline-block',
  padding:'2px 8px',
  margin:'0 4px',
  background:'#1e293b',
  border:'1px solid #334155',
  borderRadius:'3px',
  fontSize:'12px',
  color:'#22d3ee'
}

export default OutputPanel