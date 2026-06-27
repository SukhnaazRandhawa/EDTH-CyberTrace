import { useEffect, useRef, useState } from 'react'
import cytoscape from 'cytoscape'

function GraphDiff({data}) {
  const [splitView, setSplitView] = useState(false)

  // if its not a diff_states intent, just show a message
  if (data.intent !== 'diff_states') {
    return (
      <div style={{height:'400px', display:'flex', alignItems:'center', justifyContent:'center', opacity:0.5}}>
        graph diff available for state comparisons only
      </div>
    )
  }

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

function SingleGraph({data, mode}) {
  const container_ref = useRef(null)

  useEffect(() => {
    if (!container_ref.current) return

    const elements = build_elements(data, mode)

    const cy = cytoscape({
      container: container_ref.current,
      elements: elements,
      style: [
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
          selector: 'edge',
          style: {
            'width': 2,
            'line-color': '#22d3ee',
            'opacity': 0.6,
            'target-arrow-color': '#22d3ee',
            'target-arrow-shape': 'triangle',
            'curve-style': 'straight'
          }
        }
      ],
      layout: {
        name: 'cose',
        animate: false,
        fit: true,
        padding: 50
      }
    })

    // make sure the graph fills the container and is centered
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

function build_elements(data, mode) {
  const diff = data.data
  const elements = []

  const unchanged = ['core_router', 'firewall', 'auth_server']
  unchanged.forEach(n => {
    elements.push({data: {id: n, label: n, color: '#666'}})
  })

  if (mode === 'diff' || mode === 'after') {
    diff.added.forEach(n => {
      elements.push({data: {id: n, label: n, color: '#4ade80'}})
    })
  }

  if (mode === 'diff' || mode === 'before') {
    diff.removed.forEach(n => {
      elements.push({data: {id: n, label: n, color: '#f87171'}})
    })
  }

  diff.modified.forEach(n => {
    elements.push({data: {id: n, label: n, color: '#fbbf24'}})
  })

  elements.forEach(el => {
    if (el.data.id !== 'core_router' && !el.data.source) {
      elements.push({
        data: {
          id: `e_${el.data.id}`,
          source: 'core_router',
          target: el.data.id
        }
      })
    }
  })

  return elements
}

export default GraphDiff