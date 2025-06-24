import React, { useState, useEffect } from 'react'

interface Node {
  id: number
  type: string
  name: string
  status: string | null
  children: Node[]
}

function renderNode(node: Node, onOverride: (id: number, status: string) => void, depth = 0) {
  const statusColor = node.status === 'PASS' ? 'green' : node.status === 'FAIL' ? 'red' : 'gray'
  
  return (
    <div key={node.id} style={{ marginLeft: depth * 20 }}>
      {node.type}: {node.name} | <span style={{ color: statusColor }}>{node.status || 'N/A'}</span>
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

  const loadTree = async () => {
    const data = await fetch('http://localhost:8001/').then(r => r.json())
    setTree(data)
  }

  const handleOverride = async (nodeId: number, newStatus: string) => {
    const hasChildren = (node: Node): boolean => {
      if (node.id === nodeId) return node.children.length > 0
      return node.children.some(hasChildren)
    }
    
    const endpoint = hasChildren(tree!) ? 'cascade_override' : 'override'
    const updatedTree = await fetch(`http://localhost:8001/${endpoint}/${nodeId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    }).then(r => r.json())
    setTree(updatedTree)
  }

  useEffect(() => { loadTree() }, [])

  if (!tree) return <div>Loading...</div>

  return (
    <div>
      <h1>Compliance Analysis</h1>
      <button onClick={loadTree}>Load New Tree</button>
      {renderNode(tree, handleOverride)}
    </div>
  )
} 