import { useEffect, useRef, useState } from 'react'
import cytoscape from 'cytoscape'

function GraphDiff({data}) {
  const [splitView, setSplitView] = useState(false)
  const intent = data.type || data.intent

  // diff_states gets the special split-view treatment
  if (intent === 'diff_states' && data.data && !Array.isArray(data.data)) {
    return (
      <div>
        <div style={{textAlign:'center', marginBottom:'15px'}}>
          <button
            onClick={() => setSplitView(!splitView)}
            style={{padding:'8px 16px', cursor:'pointer'}}
          >
            {splitView ? 'merge view' : 'split view'}
          </button>
        </div>

        {splitView ? (
          <div style={{display:'flex', gap:'10px'}}>
            <SingleGraph data={data} mode='before' />
            <SingleGraph data={data} mode='after' />
          </div>
        ) : (
          <SingleGraph data={data} mode='diff' />
        )}
      </div>
    )
  }

  // everything else gets a hub-and-spoke graph
  return <HubGraph data={data} intent={intent} />
}

// hub-and-spoke graph for non-diff intents
function HubGraph({data, intent}) {
  const container_ref = useRef(null)

  useEffect(() => {
    if (!container_ref.current) return

    const elements = build_hub_elements(data, intent)

    if (elements.length === 0) {
      return
    }

    const cy = cytoscape({
      container: container_ref.current,
      elements: elements,
      style: graph_style,
      layout: {
        name: 'concentric',
        animate: false,
        fit: true,
        padding: 50,
        concentric: function(node) {
          // hub gets innermost ring, others outer
          return node.data('isHub') ? 10 : 1
        },
        levelWidth: function() { return 1 }
      }
    })

    cy.resize()
    cy.fit(null, 50)
    cy.center()

    return () => cy.destroy()
  }, [data, intent])

  return (
    <div style={{width:'100%'}}>
      <div ref={container_ref} style={{width:'100%', height:'400px', background:'#020912', borderRadius:'6px'}} />
    </div>
  )
}

// build nodes + edges based on intent
function build_hub_elements(data, intent) {
  const elements = []
  const items = data.data || data.affected || []

  // figure out the hub label + color based on intent
  let hub_label = 'attacks'
  let hub_color = '#22d3ee'
  let spoke_color = '#4ade80'

  if (intent === 'find_by_technique' && items[0]) {
    hub_label = items[0]['t.name'] || 'technique'
    hub_color = '#fbbf24'
  } else if (intent === 'find_by_tool' && items[0]) {
    hub_label = items[0]['t.name'] || 'tool'
    hub_color = '#a78bfa'
  } else if (intent === 'find_by_category' && items[0]) {
    hub_label = items[0]['cat.name'] || 'category'
    hub_color = '#22d3ee'
  } else if (intent === 'get_playbook' && items[0]) {
    return build_playbook_elements(items[0])
  } else if (intent === 'simulate_isolation') {
    hub_label = data.node || 'isolated'
    hub_color = '#666'
    spoke_color = '#f87171'
  } else if (intent === 'replay_state') {
    hub_label = 'snapshot'
    hub_color = '#22d3ee'
  } else if (intent === 'search_attacks') {
    hub_label = 'attacks'
    hub_color = '#22d3ee'
  } else if (intent === 'diff_states') {
    // backend returns a flat list — treat like search_attacks
    hub_label = 'current state'
    hub_color = '#fbbf24'
  }

  // add hub node
  elements.push({
    data: {id: 'hub', label: hub_label, color: hub_color, isHub: true}
  })

  // add spoke nodes (the attacks/items)
  items.forEach((item, i) => {
    const id = `n_${i}`
    const label = item['a.name'] || item.name || `item ${i+1}`
    // truncate long names for readability
    const short_label = label.length > 25 ? label.slice(0, 22) + '...' : label
    elements.push({data: {id: id, label: short_label, color: spoke_color}})
    elements.push({data: {id: `e_${i}`, source: 'hub', target: id}})
  })

  return elements
}

// special layout for playbook — attack in centre, tools + techniques branching
function build_playbook_elements(item) {
  const elements = []
  const attack_name = item['a.name'] || 'attack'

  elements.push({
    data: {id: 'attack', label: attack_name, color: '#22d3ee', isHub: true}
  })

  // tools
  if (item.tools && item.tools.length > 0) {
    item.tools.forEach((tool, i) => {
      const id = `tool_${i}`
      elements.push({data: {id: id, label: tool, color: '#a78bfa'}})
      elements.push({data: {id: `et_${i}`, source: 'attack', target: id}})
    })
  }

  // techniques
  if (item.techniques && item.techniques.length > 0) {
    item.techniques.forEach((tech, i) => {
      const id = `tech_${i}`
      elements.push({data: {id: id, label: tech, color: '#fbbf24'}})
      elements.push({data: {id: `etn_${i}`, source: 'attack', target: id}})
    })
  }

  // category
  if (item['cat.name']) {
    elements.push({data: {id: 'cat', label: item['cat.name'], color: '#4ade80'}})
    elements.push({data: {id: 'ec', source: 'attack', target: 'cat'}})
  }

  return elements
}

// SingleGraph used only for diff_states split view
function SingleGraph({data, mode}) {
  const container_ref = useRef(null)

  useEffect(() => {
    if (!container_ref.current) return
    const elements = build_diff_elements(data, mode)

    const cy = cytoscape({
      container: container_ref.current,
      elements: elements,
      style: graph_style,
      layout: {name:'cose', animate:false, fit:true, padding:50}
    })

    cy.resize()
    cy.fit(null, 50)
    cy.center()
    return () => cy.destroy()
  }, [data, mode])

  return (
    <div style={{flex:1, width:'100%'}}>
      <p style={{textAlign:'center', opacity:0.6, margin:'5px 0'}}>
        {mode === 'before' && `before: ${data.timestamp1}`}
        {mode === 'after' && `after: ${data.timestamp2}`}
        {mode === 'diff' && 'combined diff view'}
      </p>
      <div ref={container_ref} style={{width:'100%', height:'400px', background:'#020912', borderRadius:'6px'}} />
    </div>
  )
}

function build_diff_elements(data, mode) {
  const diff = data.data
  const elements = []
  const unchanged = ['core_router', 'firewall', 'auth_server']

  unchanged.forEach(n => {
    elements.push({data: {id: n, label: n, color: '#666'}})
  })

  if (mode === 'diff' || mode === 'after') {
    diff.added.forEach(n => elements.push({data: {id: n, label: n, color: '#4ade80'}}))
  }
  if (mode === 'diff' || mode === 'before') {
    diff.removed.forEach(n => elements.push({data: {id: n, label: n, color: '#f87171'}}))
  }
  diff.modified.forEach(n => elements.push({data: {id: n, label: n, color: '#fbbf24'}}))

  elements.forEach(el => {
    if (el.data.id !== 'core_router' && !el.data.source) {
      elements.push({data: {id: `e_${el.data.id}`, source: 'core_router', target: el.data.id}})
    }
  })

  return elements
}

// shared graph styling
const graph_style = [
  {
    selector: 'node',
    style: {
      'label': 'data(label)',
      'background-color': 'data(color)',
      'border-width': 3,
      'border-color': '#0a1628',
      'color': '#e2e8f0',
      'text-valign': 'bottom',
      'text-margin-y': 8,
      'font-size': '11px',
      'font-family': 'Consolas, monospace',
      'font-weight': 'bold',
      'width': 50,
      'height': 50
    }
  },
  {
    selector: 'node[?isHub]',
    style: {
      'width': 70,
      'height': 70,
      'font-size': '13px',
      'border-width': 4
    }
  },
  {
    selector: 'edge',
    style: {
      'width': 2,
      'line-color': '#22d3ee',
      'opacity': 0.5,
      'target-arrow-color': '#22d3ee',
      'target-arrow-shape': 'triangle',
      'curve-style': 'straight'
    }
  }
]

export default GraphDiff