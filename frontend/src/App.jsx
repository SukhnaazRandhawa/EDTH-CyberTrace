import { useState } from 'react'
import InputPanel from './Input_panel'
import OutputPanel from './Output_panel'

function App() {
  const [result, setResult] = useState(null)

  return (
    <div style={{display:'flex', flexDirection:'column', padding:'20px', gap:'20px', width:'100%', boxSizing:'border-box'}}>
      <h1 style={{margin:0}}>CyberTrace</h1>
      <InputPanel onResult={setResult} />
      {result && <OutputPanel data={result} />}
    </div>
  )
}

export default App