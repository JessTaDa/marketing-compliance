import React, { useState, useEffect } from 'react'

interface Node {
  id: number
  type: string
  name: string
  status: string | null
  children: Node[]
}

const bgColors = ['#f9f9f9', '#e6f7ff', '#fffbe6', '#f6ffed']

function renderNodeTabbed(node: Node, onOverride: (id: number, status: string) => void, depth = 0) {
  const statusColor = node.status === 'PASS' ? 'green' : node.status === 'FAIL' ? 'red' : 'gray'
  return (
    <div key={node.id} style={{ marginLeft: depth * 20 }}>
      {node.type}: {node.name} (id: {node.id}) | <span style={{ color: statusColor }}>{node.status || 'N/A'}</span>
      {node.status && (
        <button onClick={() => onOverride(node.id, node.status === 'PASS' ? 'FAIL' : 'PASS')}>
          Set {node.status === 'PASS' ? 'FAIL' : 'PASS'}
        </button>
      )}
      {node.children.map(child => renderNodeTabbed(child, onOverride, depth + 1))}
    </div>
  )
}

function renderNodeCard(node: Node, onOverride: (id: number, status: string) => void, depth = 0) {
  const statusColor = node.status === 'PASS' ? 'green' : node.status === 'FAIL' ? 'red' : 'gray'
  const cardStyle = {
    marginLeft: depth * 10,
    marginBottom: 10,
    padding: 10,
    border: '1px solid #ddd',
    borderRadius: 6,
    background: bgColors[depth % bgColors.length],
    boxShadow: depth === 0 ? '0 2px 8px #eee' : undefined,
  } as React.CSSProperties
  return (
    <div key={node.id} style={cardStyle}>
      <div>
        <strong>{node.type}</strong>: {node.name} (id: {node.id}) |{' '}
        <span style={{ color: statusColor }}>{node.status || 'N/A'}</span>
        {node.status && (
          <button onClick={() => onOverride(node.id, node.status === 'PASS' ? 'FAIL' : 'PASS')} style={{ marginLeft: 8 }}>
            Set {node.status === 'PASS' ? 'FAIL' : 'PASS'}
          </button>
        )}
      </div>
      {node.children.map(child => renderNodeCard(child, onOverride, depth + 1))}
    </div>
  )
}

export default function App() {
  const [trees, setTrees] = useState<Node[] | null>(null)
  const [cardView, setCardView] = useState(false)
  const [showAll, setShowAll] = useState(false)

  const loadTree = async () => {
    const data = await fetch('http://localhost:8001/').then(r => r.json())
    setTrees([data])
  }

  const loadAllTrees = async () => {
    const data = await fetch('http://localhost:8001/all').then(r => r.json())
    setTrees(data)
  }

  const handleOverride = async (nodeId: number, newStatus: string) => {
    if (!trees || trees.length === 0) return
    // Find the tree containing the node
    const findTree = (trees: Node[]) => trees.find(t => {
      const search = (n: Node): boolean => n.id === nodeId || n.children.some(search)
      return search(t)
    })
    const tree = findTree(trees)
    if (!tree) return
    const hasChildren = (node: Node): boolean => {
      if (node.id === nodeId) return node.children.length > 0
      return node.children.some(hasChildren)
    }
    const endpoint = hasChildren(tree) ? 'cascade_override' : 'override'
    const updatedTree = await fetch(`http://localhost:8001/${endpoint}/${nodeId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    }).then(r => r.json())
    // If showing all, reload all; else reload one
    showAll ? loadAllTrees() : setTrees([updatedTree])
  }

  useEffect(() => {
    showAll ? loadAllTrees() : loadTree()
    // eslint-disable-next-line
  }, [showAll])

  if (!trees) return <div>Loading...</div>

  return (
    <div>
      <h1>Compliance Analysis</h1>
      <button onClick={() => { setShowAll(false); loadTree(); }}>Show Random Tree</button>
      <button onClick={() => { setShowAll(true); loadAllTrees(); }} style={{ marginLeft: 8 }}>Show All Trees</button>
      <button onClick={() => setCardView(v => !v)} style={{ marginLeft: 8 }}>
        Switch to {cardView ? 'Tabbed' : 'Card'} View
      </button>
      <div style={{ marginTop: 16 }}>
        {trees.map(tree => (
          cardView
            ? renderNodeCard(tree, handleOverride)
            : renderNodeTabbed(tree, handleOverride)
        ))}
      </div>
    </div>
  )
} 