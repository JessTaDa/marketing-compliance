import React, { useState, useEffect } from 'react'

// Types matching the backend
type Status = 'PASS' | 'FAIL'
type NodeType = 'SUB_CHECK' | 'CHECK' | 'ROOT'

interface Node {
  id: number
  type: string
  name: string
  status: string | null
  children: Node[]
}

// Render a single node and its children
function renderNode(node: Node, onOverride: (id: number, status: string) => void, depth = 0) {
  return (
    <div key={node.id} style={{ marginLeft: depth * 20 }}>
      {node.type}: {node.name} | {node.status || 'N/A'}
      {node.status && (
        <button onClick={() => onOverride(node.id, node.status === 'PASS' ? 'FAIL' : 'PASS')}>
          Set {node.status === 'PASS' ? 'FAIL' : 'PASS'}
        </button>
      )}
      {node.children.map(child => renderNode(child, onOverride, depth + 1))}
    </div>
  )
}

export default function App() {
  const [tree, setTree] = useState<Node | null>(null)

  // Load tree from backend
  const loadTree = async () => {
    const data = await fetch('http://localhost:8001/').then(r => r.json())
    setTree(data)
  }

  // Override node status
  const handleOverride = async (nodeId: number, newStatus: string) => {
    const updatedTree = await fetch(`http://localhost:8001/override/${nodeId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    }).then(r => r.json())
    setTree(updatedTree)
  }

  useEffect(() => {
    loadTree()
  }, [])

  if (!tree) return <div>Loading...</div>

  return (
    <div>
      <h1>Compliance Analysis</h1>
      <button onClick={loadTree}>Load New Tree</button>
      {renderNode(tree, handleOverride)}
    </div>
  )
} 